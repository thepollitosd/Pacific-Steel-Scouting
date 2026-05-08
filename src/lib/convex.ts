import { ConvexReactClient } from "convex/react";

const envUrl = import.meta.env.VITE_CONVEX_URL;
export const isConvexConfigured = !!envUrl && envUrl !== "https://your-project-name.convex.cloud";

export const convexUrl = envUrl || "https://placeholder-url.convex.cloud";
export const convex = new ConvexReactClient(convexUrl);
