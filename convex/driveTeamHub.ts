import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./users";

export const getRequests = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    if (!args.eventId) return [];
    return await ctx.db.query("requests")
      .filter(q => q.eq(q.field("eventId"), args.eventId))
      .order("desc")
      .collect();
  },
});

export const createRequest = mutation({
  args: {
    eventId: v.id("events"),
    targetTeamNumber: v.number(),
    type: v.string(),
    priority: v.string(),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireRole(ctx, ["Drive Team", "Admin"]);

    await ctx.db.insert("requests", {
      ...args,
      fromId: userId,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const respondToRequest = mutation({
  args: {
    requestId: v.id("requests"),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Drive Team", "Admin"]);
    await ctx.db.patch(args.requestId, {
      status: "completed",
      response: args.response,
    });
  },
});
