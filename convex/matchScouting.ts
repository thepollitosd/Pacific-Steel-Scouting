import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./users";

export const saveMatchScouting = mutation({
  args: {
    eventId: v.id("events"),
    matchNumber: v.number(),
    teamNumber: v.number(),
    auto: v.object({
      ballsShot: v.number(),
      climb: v.string(),
      notes: v.string(),
    }),
    teleop: v.object({
      ballsShot: v.number(),
      notes: v.string(),
    }),
    endgame: v.object({
      climb: v.string(),
      notes: v.string(),
    }),
    driverRating: v.number(),
    defenseRating: v.number(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireRole(ctx, ["Scout", "Admin"]);

    const existing = await ctx.db.query("matchScouting")
      .withIndex("by_match_team", q => q.eq("eventId", args.eventId).eq("matchNumber", args.matchNumber).eq("teamNumber", args.teamNumber))
      .first();

    const data = {
      ...args,
      scouterId: userId,
      submittedAt: Date.now(),
    };

    if (existing) {
      if (existing.scouterId !== userId) {
        throw new Error("This robot is already being scouted by another user for this match.");
      }
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("matchScouting", data);
    }
  },
});

export const getByTeam = query({
  args: { eventId: v.id("events"), teamNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.query("matchScouting")
      .withIndex("by_event_team", q => q.eq("eventId", args.eventId).eq("teamNumber", args.teamNumber))
      .collect();
  },
});
