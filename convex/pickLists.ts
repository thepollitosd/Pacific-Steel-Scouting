import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
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

export const createPickList = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

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

    await ctx.db.insert("pickLists", {
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
    await ctx.db.patch(args.pickListId, { tiers: args.tiers });
  },
});
