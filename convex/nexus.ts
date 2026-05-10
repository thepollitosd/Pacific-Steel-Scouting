import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./users";
import { api } from "./_generated/api";

export const importPitLocations = action({
  args: { eventKey: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.current);
    if (!user || user.role !== "Admin") {
      throw new Error("Forbidden: You do not have permission to perform this action.");
    }
    
    const apiKey = process.env.NEXUS_API_KEY;
    if (!apiKey) {
      throw new Error("Missing NEXUS_API_KEY environment variable");
    }

    const response = await fetch(`https://frc.nexus/api/v1/event/${args.eventKey}/pits`, {
      headers: {
        "Nexus-Api-Key": apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Event not found on Nexus or event does not use Nexus for pits.");
      }
      throw new Error(`Failed to fetch from Nexus: ${response.statusText}`);
    }

    const data = await response.json(); // Expected: { "1234": "A1", "5678": "B12" }

    // We need to call a mutation to update the database
    await ctx.runMutation(api.nexus.updatePitLocationsBatch, {
      eventKey: args.eventKey,
      pits: data,
    });

    return { success: true, count: Object.keys(data).length };
  },
});

export const updatePitLocationsBatch = mutation({
  args: {
    eventKey: v.string(),
    pits: v.any(), // Record<string, string>
  },
  handler: async (ctx, args) => {
    const userId = await requireRole(ctx, ["Admin"]);

    // Find the event ID
    const event = await ctx.db.query("events")
      .withIndex("by_key", q => q.eq("key", args.eventKey))
      .unique();
    
    if (!event) throw new Error("Event not found");

    const pits = args.pits as Record<string, string>;
    const teamNumbers = Object.keys(pits).map(Number);

    for (const teamNum of teamNumbers) {
      const pitLocation = pits[teamNum.toString()];
      
      // Check if a pitScouting record exists
      const existing = await ctx.db.query("pitScouting")
        .withIndex("by_event_team", q => q.eq("eventId", event._id).eq("teamNumber", teamNum))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { pitLocation });
      } else {
        // Create a stub record
        await ctx.db.insert("pitScouting", {
          eventId: event._id,
          teamNumber: teamNum,
          drivetrain: "",
          trench: false,
          bump: false,
          depot: false,
          outpostIntake: false,
          outpostFeed: false,
          shootOnTheMove: false,
          shooterType: "",
          bps: 0,
          hopperSize: 0,
          canClimbInAuto: false,
          climbLevels: [],
          pitLocation,
          notes: "",
          scoutedBy: userId,
          updatedAt: Date.now(),
        });
      }
    }
  },
});

export const getPitMap = action({
  args: { eventKey: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.current);
    if (!user) throw new Error("Unauthorized");
    
    const apiKey = process.env.NEXUS_API_KEY;
    if (!apiKey) {
      throw new Error("Missing NEXUS_API_KEY environment variable");
    }

    const headers = { "Nexus-Api-Key": apiKey };

    // Fetch map data
    const mapResponse = await fetch(`https://frc.nexus/api/v1/event/${args.eventKey}/map`, { headers });
    
    let mapData: any = null;
    if (mapResponse.ok) {
      mapData = await mapResponse.json();
    } else if (mapResponse.status !== 404) {
      throw new Error(`Failed to fetch map from Nexus: ${mapResponse.statusText}`);
    }

    // Fetch pits data (mapping)
    const pitsResponse = await fetch(`https://frc.nexus/api/v1/event/${args.eventKey}/pits`, { headers });
    let pitsData: Record<string, string> = {};
    if (pitsResponse.ok) {
      pitsData = await pitsResponse.json();
    }

    // If we have no map and no pits, return null
    if (!mapData && Object.keys(pitsData).length === 0) {
      return null;
    }

    // If we have no map but have pits, create a minimal map
    if (!mapData) {
      mapData = {
        size: { x: 1000, y: 1000 },
        pits: {},
      };
    }

    // Merge pits into mapData
    const pitToTeamMapping: Record<string, string> = {};
    for (const [team, pit] of Object.entries(pitsData)) {
      pitToTeamMapping[pit as string] = team;
    }

    if (mapData.pits) {
      for (const [pitId, pitObj] of Object.entries(mapData.pits)) {
        const team = pitToTeamMapping[pitId];
        if (team && !(pitObj as any).team) {
          (pitObj as any).team = team;
        }
      }
    }

    return mapData;
  },
});
