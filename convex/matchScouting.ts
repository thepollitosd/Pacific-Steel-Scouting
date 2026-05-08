import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveMatchScouting = mutation({
  args: {
    eventId: v.id("events"),
    matchNumber: v.number(),
    teamNumber: v.number(),
    auto: v.object({
      coral: v.array(v.number()),
      algae: v.array(v.number()),
      notes: v.string(),
    }),
    teleop: v.object({
      coral: v.array(v.number()),
      algae: v.array(v.number()),
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db.query("matchScouting")
      .withIndex("by_match_team", q => q.eq("eventId", args.eventId).eq("matchNumber", args.matchNumber).eq("teamNumber", args.teamNumber))
      .first();

    const data = {
      ...args,
      scouterId: userId,
      submittedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("matchScouting", data);
    }
  },
});
