import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./users";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyPickLists = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    if (!args.eventId) return [];
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db.query("pickLists")
      .withIndex("by_user_event", q => q.eq("userId", userId).eq("eventId", args.eventId!))
      .collect();
  },
});

export const getAllPickLists = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    if (!args.eventId) return [];
    await requireRole(ctx, ["Admin"]);
    return await ctx.db.query("pickLists")
      .filter(q => q.eq(q.field("eventId"), args.eventId))
      .collect();
  },
});

export const createPickList = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireRole(ctx, ["Strategist", "Admin"]);

    const defaultTiers = [
      { name: "Tier 1", teams: [] as number[] },
      { name: "Tier 2", teams: [] as number[] },
      { name: "Tier 3", teams: [] as number[] },
      { name: "Do Not Pick", teams: [] as number[] },
      { name: "Uncategorized", teams: [] as number[] },
    ];

    // Auto-populate Uncategorized with all teams from event
    const eventTeams = await ctx.db.query("teams")
      .withIndex("by_event_team", q => q.eq("eventId", args.eventId))
      .collect();
    
    defaultTiers[4].teams = eventTeams.map(t => t.number);

    return await ctx.db.insert("pickLists", {
      eventId: args.eventId,
      userId,
      name: args.name,
      isGlobal: false,
      tiers: defaultTiers,
    });
  },
});

export const updatePickListTiers = mutation({
  args: {
    pickListId: v.id("pickLists"),
    tiers: v.array(v.object({
      name: v.string(),
      teams: v.array(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await requireRole(ctx, ["Strategist", "Admin"]);
    const pickList = await ctx.db.get(args.pickListId);
    if (!pickList) throw new Error("Pick list not found");
    
    if (pickList.userId !== userId) {
      const user = await ctx.db.get(userId);
      if (user?.role !== "Admin") {
        throw new Error("Forbidden: You can only update your own pick lists.");
      }
    }
    
    await ctx.db.patch(args.pickListId, { tiers: args.tiers });
  },
});

export const deletePickList = mutation({
  args: { pickListId: v.id("pickLists") },
  handler: async (ctx, args) => {
    const userId = await requireRole(ctx, ["Strategist", "Admin"]);
    const pickList = await ctx.db.get(args.pickListId);
    if (!pickList) throw new Error("Pick list not found");
    
    if (pickList.userId !== userId) {
      const user = await ctx.db.get(userId);
      if (user?.role !== "Admin") {
        throw new Error("Forbidden: You can only delete your own pick lists.");
      }
    }
    
    await ctx.db.delete(args.pickListId);
  },
});

export const getAveragePositions = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    if (!args.eventId) return [];
    
    const pickLists = await ctx.db.query("pickLists")
      .filter(q => q.eq(q.field("eventId"), args.eventId))
      .collect();
      
    if (pickLists.length === 0) return [];
    
    const teamScores: Record<number, { totalPos: number, count: number }> = {};
    
    pickLists.forEach(list => {
      let currentPos = 0;
      list.tiers.forEach(tier => {
        tier.teams.forEach(teamNum => {
          if (!teamScores[teamNum]) {
            teamScores[teamNum] = { totalPos: 0, count: 0 };
          }
          teamScores[teamNum].totalPos += currentPos;
          teamScores[teamNum].count += 1;
          currentPos++;
        });
      });
    });
    
    const result = Object.entries(teamScores).map(([teamNum, scores]) => ({
      teamNumber: parseInt(teamNum),
      avgPosition: scores.totalPos / scores.count,
      count: scores.count,
    }));
    
    // Sort by average position ascending (lower is better)
    result.sort((a, b) => a.avgPosition - b.avgPosition);
    
    return result;
  },
});
