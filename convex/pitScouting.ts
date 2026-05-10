import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./users";

export const savePitScouting = mutation({
  args: {
    eventId: v.id("events"),
    teamNumber: v.number(),
    trench: v.boolean(),
    bump: v.boolean(),
    climbLevels: v.array(v.string()),
    canClimbInAuto: v.boolean(),
    depot: v.boolean(),
    outpostIntake: v.boolean(),
    outpostFeed: v.boolean(),
    shootOnTheMove: v.boolean(),
    shooterType: v.string(),
    shootingPaths: v.optional(v.number()),
    bps: v.number(),
    hopperSize: v.number(),
    drivetrain: v.string(),
    gearing: v.optional(v.string()),
    pitLocation: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireRole(ctx, ["Scout", "Pit Scout", "Admin"]);

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
