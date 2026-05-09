import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export async function requireRole(ctx: any, allowedRoles: string[]) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await ctx.db.get(userId);
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: You do not have permission to perform this action.");
  }
  return userId;
}

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["Admin"]);
    return await ctx.db.query("users").collect();
  },
});

export const updateRole = mutation({
  args: { userId: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    await ctx.db.patch(args.userId, { role: args.role });
  },
});
