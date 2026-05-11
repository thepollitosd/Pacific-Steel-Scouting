import { action, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

const TBA_BASE_URL = "https://www.thebluealliance.com/api/v3";

export const importEvent = action({
  args: { eventKey: v.string() },
  handler: async (ctx, args) => {
    // Role check
    const user = await ctx.runQuery(api.users.current);
    if (!user || user.role !== "Admin") {
      throw new Error("Forbidden: Only Admins can import events.");
    }

    const apiKey = process.env.TBA_API_KEY;
    if (!apiKey) throw new Error("TBA_API_KEY environment variable is not set");

    const headers = {
      "X-TBA-Auth-Key": apiKey,
    };

    // 1. Fetch Event Details
    const eventRes = await fetch(`${TBA_BASE_URL}/event/${args.eventKey}`, { headers });
    if (!eventRes.ok) throw new Error("Failed to fetch event from TBA");
    const eventData = await eventRes.json();

    // 2. Fetch Teams
    const teamsRes = await fetch(`${TBA_BASE_URL}/event/${args.eventKey}/teams`, { headers });
    if (!teamsRes.ok) throw new Error("Failed to fetch teams");
    const teamsData = await teamsRes.json();

    // 3. Fetch Matches
    const matchesRes = await fetch(`${TBA_BASE_URL}/event/${args.eventKey}/matches`, { headers });
    if (!matchesRes.ok) throw new Error("Failed to fetch matches");
    const matchesData = await matchesRes.json();

    const qualMatches = matchesData.filter((m: any) => m.comp_level === "qm");

    // Process Teams
    const teamsToImport = teamsData.map((t: any) => ({
      number: t.team_number,
      name: t.nickname,
      location: `${t.city}, ${t.state_prov}`,
      tbaKey: t.key,
    }));

    // Process Matches
    const matchesToImport = qualMatches.map((m: any) => ({
      number: m.match_number,
      type: "qual",
      redAlliance: m.alliances.red.team_keys.map((k: string) => parseInt(k.replace("frc", ""))),
      blueAlliance: m.alliances.blue.team_keys.map((k: string) => parseInt(k.replace("frc", ""))),
      startTime: m.time,
      tbaKey: m.key,
    }));

    // Save to Convex
    await ctx.runMutation(internal.events.saveImportedEvent, {
      eventKey: args.eventKey,
      name: eventData.name,
      year: eventData.year,
      city: eventData.city,
      state: eventData.state_prov,
      country: eventData.country,
      teams: teamsToImport,
      matches: matchesToImport,
    });

    return { success: true, eventKey: args.eventKey };
  },
});

export const getTeamMedia = action({
  args: { teamNumber: v.number(), year: v.number() },
  handler: async (ctx, args) => {
    const apiKey = process.env.TBA_API_KEY;
    if (!apiKey) throw new Error("TBA_API_KEY environment variable is not set");

    const headers = {
      "X-TBA-Auth-Key": apiKey,
    };

    const res = await fetch(`${TBA_BASE_URL}/team/frc${args.teamNumber}/media/${args.year}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch media from TBA");
    
    const media = await res.json();
    return media;
  },
});

export const getRankings = action({
  args: { eventKey: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.TBA_API_KEY;
    if (!apiKey) throw new Error("TBA_API_KEY environment variable is not set");

    const headers = {
      "X-TBA-Auth-Key": apiKey,
    };

    const res = await fetch(`https://www.thebluealliance.com/api/v3/event/${args.eventKey}/rankings`, { headers });
    if (!res.ok) throw new Error("Failed to fetch rankings from TBA");
    
    const data = await res.json();
    return data.rankings || [];
  },
});
