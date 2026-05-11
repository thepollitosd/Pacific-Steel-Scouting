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
export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, { name: args.name });
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const users = await ctx.db.query("users").collect();
    const matchScouting = await ctx.db.query("matchScouting").collect();
    const pitScouting = await ctx.db.query("pitScouting").collect();
    
    const leaderboard = users.map(user => {
      const matchesScouted = matchScouting.filter(m => m.scouterId === user._id).length;
      const pitsScouted = pitScouting.filter(p => p.scoutedBy === user._id).length;
      
      return {
        _id: user._id,
        name: user.name || user.email || "Anonymous",
        matchesScouted,
        pitsScouted,
        points: (matchesScouted * 10) + (pitsScouted * 20),
      };
    });
    
    return leaderboard.sort((a, b) => b.points - a.points);
  },
});

