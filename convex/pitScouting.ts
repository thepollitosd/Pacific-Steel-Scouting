import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./users";

export const savePitScouting = mutation({
  args: {
    eventId: v.id("events"),
    teamNumber: v.number(),
    coralLevels: v.array(v.number()),
    algaeLevels: v.array(v.string()),
    climbLevels: v.array(v.string()),
    drivetrain: v.string(),
    pitLocation: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireRole(ctx, ["Pit Scout", "Admin"]);

    const existing = await ctx.db.query("pitScouting")
      .withIndex("by_event_team", q => q.eq("eventId", args.eventId).eq("teamNumber", args.teamNumber))
      .first();

    const data = {
      ...args,
      scoutedBy: userId,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("pitScouting", data);
    }
  },
});

export const getPitScouting = query({
  args: { eventId: v.id("events"), teamNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.query("pitScouting")
      .withIndex("by_event_team", q => q.eq("eventId", args.eventId).eq("teamNumber", args.teamNumber))
      .first();
  },
});

export const getPitScoutingForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.query("pitScouting")
      .withIndex("by_event_team", q => q.eq("eventId", args.eventId))
      .collect();
  },
});
