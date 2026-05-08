import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Event Data
  events: defineTable({
    key: v.string(), // e.g., "2025nvlv"
    name: v.string(),
    year: v.number(),
    city: v.string(),
    state: v.string(),
    country: v.string(),
    isActive: v.boolean(),
  }).index("by_key", ["key"]),

  teams: defineTable({
    eventId: v.id("events"),
    number: v.number(),
    name: v.string(),
    location: v.string(), // Combined city/state
    tbaKey: v.string(),
  }).index("by_event_team", ["eventId", "number"]),

  matches: defineTable({
    eventId: v.id("events"),
    number: v.number(),
    type: v.string(), // "qual"
    redAlliance: v.array(v.number()),
    blueAlliance: v.array(v.number()),
    startTime: v.optional(v.number()), // Unix timestamp
    tbaKey: v.string(),
  }).index("by_event_match", ["eventId", "number"]),

  // Scouting Data
  pitScouting: defineTable({
    eventId: v.id("events"),
    teamNumber: v.number(),
    
    // Capabilities
    coralLevels: v.array(v.number()), // [1, 2, 3, 4]
    algaeLevels: v.array(v.string()), // ["high", "low"]
    climbLevels: v.array(v.string()), // ["high", "low"]
    
    // Specs
    drivetrain: v.string(),
    pitLocation: v.string(),
    notes: v.string(),
    scoutedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_event_team", ["eventId", "teamNumber"]),

  matchScouting: defineTable({
    eventId: v.id("events"),
    matchNumber: v.number(),
    teamNumber: v.number(),
    scouterId: v.id("users"),

    // Scoring
    auto: v.object({
      coral: v.array(v.number()), // Indices correspond to levels 1-4
      algae: v.array(v.number()), // [high, low]
      notes: v.string(),
    }),
    teleop: v.object({
      coral: v.array(v.number()),
      algae: v.array(v.number()),
      notes: v.string(),
    }),
    endgame: v.object({
      climb: v.string(), // "none", "low", "high"
      notes: v.string(),
    }),

    // Ratings
    driverRating: v.number(), // 1-10
    defenseRating: v.number(), // 1-10
    tags: v.array(v.string()), // "fast", "tippy", etc.
    
    submittedAt: v.number(),
  }).index("by_match_team", ["eventId", "matchNumber", "teamNumber"]),

  // Pit Map
  pitLocations: defineTable({
    eventId: v.id("events"),
    teamNumber: v.number(),
    label: v.string(),
    row: v.string(),
    coords: v.object({ x: v.number(), y: v.number() }),
  }).index("by_event_team", ["eventId", "teamNumber"]),

  // Pick Lists
  pickLists: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"), // owner
    name: v.string(),
    isGlobal: v.boolean(), // Primary team list
    tiers: v.array(v.object({
      name: v.string(),
      teams: v.array(v.number()),
    })),
  }).index("by_user_event", ["userId", "eventId"]),

  // Drive Team Hub Communication
  requests: defineTable({
    eventId: v.id("events"),
    fromId: v.id("users"),
    targetTeamNumber: v.number(),
    type: v.string(), // "repair", "location", "strategy"
    priority: v.string(), // "low", "medium", "high", "critical"
    note: v.string(),
    status: v.string(), // "pending", "accepted", "completed"
    response: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_event_status", ["eventId", "status"]),
});
