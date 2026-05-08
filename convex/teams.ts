import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByEvent = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    if (!args.eventId) return [];
    const teams = await ctx.db.query("teams")
      .withIndex("by_event_team", q => q.eq("eventId", args.eventId!))
      .collect();
    
    // In a real implementation we would join with pitScouting and matchScouting
    // to return full status. Here we just return teams for simplicity.
    return teams.sort((a, b) => a.number - b.number);
  },
});
