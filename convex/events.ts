import { internalMutation, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./users";

export const getActiveEvent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").filter((q) => q.eq(q.field("isActive"), true)).first();
  },
});

export const saveImportedEvent = internalMutation({
  args: {
    eventKey: v.string(),
    name: v.string(),
    year: v.number(),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    teams: v.array(v.object({
      number: v.number(),
      name: v.string(),
      location: v.string(),
      tbaKey: v.string(),
    })),
    matches: v.array(v.object({
      number: v.number(),
      type: v.string(),
      redAlliance: v.array(v.number()),
      blueAlliance: v.array(v.number()),
      startTime: v.optional(v.number()),
      tbaKey: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // Upsert Event
    let eventId;
    const existing = await ctx.db.query("events").withIndex("by_key", q => q.eq("key", args.eventKey)).first();
    
    // Deactivate others
    const actives = await ctx.db.query("events").filter((q) => q.eq(q.field("isActive"), true)).collect();
    for (const active of actives) {
      if (active.key !== args.eventKey) {
        await ctx.db.patch(active._id, { isActive: false });
      }
    }

    if (existing) {
      eventId = existing._id;
      await ctx.db.patch(eventId, {
        name: args.name, year: args.year, city: args.city || "", state: args.state || "", country: args.country || "", isActive: true,
      });
    } else {
      eventId = await ctx.db.insert("events", {
        key: args.eventKey, name: args.name, year: args.year, city: args.city || "", state: args.state || "", country: args.country || "", isActive: true,
      });
    }

    // Insert Teams (Deduplicate)
    const existingTeams = await ctx.db.query("teams").withIndex("by_event_team", q => q.eq("eventId", eventId)).collect();
    const existingTeamNumbers = new Set(existingTeams.map(t => t.number));

    for (const t of args.teams) {
      if (!existingTeamNumbers.has(t.number)) {
        await ctx.db.insert("teams", {
          eventId,
          number: t.number,
          name: t.name,
          location: t.location,
          tbaKey: t.tbaKey,
        });
      }
    }

    // Insert Matches (Deduplicate)
    const existingMatches = await ctx.db.query("matches").withIndex("by_event_match", q => q.eq("eventId", eventId)).collect();
    const existingMatchKeys = new Set(existingMatches.map(m => m.tbaKey));

    for (const m of args.matches) {
      if (!existingMatchKeys.has(m.tbaKey)) {
        await ctx.db.insert("matches", {
          eventId,
          number: m.number,
          type: m.type,
          redAlliance: m.redAlliance,
          blueAlliance: m.blueAlliance,
          startTime: m.startTime,
          tbaKey: m.tbaKey,
        });
      }
    }
  },
});
export const listMatches = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("matches")
      .withIndex("by_event_match", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const resetAllData = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["Admin"]);

    // Delete all records from scouting tables
    const matchScouting = await ctx.db.query("matchScouting").collect();
    for (const doc of matchScouting) { await ctx.db.delete(doc._id); }

    const pitScouting = await ctx.db.query("pitScouting").collect();
    for (const doc of pitScouting) { await ctx.db.delete(doc._id); }

    const pitLocations = await ctx.db.query("pitLocations").collect();
    for (const doc of pitLocations) { await ctx.db.delete(doc._id); }

    const pickLists = await ctx.db.query("pickLists").collect();
    for (const doc of pickLists) { await ctx.db.delete(doc._id); }

    const requests = await ctx.db.query("requests").collect();
    for (const doc of requests) { await ctx.db.delete(doc._id); }

    const matches = await ctx.db.query("matches").collect();
    for (const doc of matches) { await ctx.db.delete(doc._id); }

    const teams = await ctx.db.query("teams").collect();
    for (const doc of teams) { await ctx.db.delete(doc._id); }

    const events = await ctx.db.query("events").collect();
    for (const doc of events) { await ctx.db.delete(doc._id); }
  },
});
