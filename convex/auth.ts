import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (user && !user.role) {
        const users = await ctx.db.query("users").collect();
        // If this is the first user, make them Admin
        if (users.length === 1) {
          await ctx.db.patch(userId, { role: "Admin" });
        } else {
          await ctx.db.patch(userId, { role: "Scout" });
        }
      }
    },
  },
});
