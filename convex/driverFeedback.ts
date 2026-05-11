import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./users";

export const getByEvent = query({
  args: { eventId: v.optional(v.id("events")) },
  handler: async (ctx, args) => {
    if (!args.eventId) return [];
    return await ctx.db.query("driverFeedback")
      .filter(q => q.eq(q.field("eventId"), args.eventId))
      .order("desc")
      .collect();
  },
});

export const submit = mutation({
  args: {
    eventId: v.id("events"),
    matchNumber: v.number(),
    drivetrainRating: v.number(),
    intakeIssues: v.boolean(),
    intakeNotes: v.string(),
    generalNotes: v.string(),
    submittedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Only Drive Team and Admin can submit feedback
    await requireRole(ctx, ["Drive Team", "Admin"]);

    await ctx.db.insert("driverFeedback", {
      ...args,
    });
  },
});
