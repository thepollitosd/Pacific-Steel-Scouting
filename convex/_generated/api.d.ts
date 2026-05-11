/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as driveTeamHub from "../driveTeamHub.js";
import type * as driverFeedback from "../driverFeedback.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as matchScouting from "../matchScouting.js";
import type * as nexus from "../nexus.js";
import type * as pickLists from "../pickLists.js";
import type * as pitScouting from "../pitScouting.js";
import type * as tba from "../tba.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  driveTeamHub: typeof driveTeamHub;
  driverFeedback: typeof driverFeedback;
  events: typeof events;
  http: typeof http;
  matchScouting: typeof matchScouting;
  nexus: typeof nexus;
  pickLists: typeof pickLists;
  pitScouting: typeof pitScouting;
  tba: typeof tba;
  teams: typeof teams;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
