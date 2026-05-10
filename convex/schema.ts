import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.optional(v.string()), // "Admin", "Scout", "Pit Scout", "Drive Team", "Strategist"
  }),

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
    
    // 2026 Game REBUILT Capabilities
    // Group 1
    trench: v.boolean(),
    bump: v.boolean(),
    
    // Group 2
    climbLevels: v.array(v.string()), // ["L1", "L2", "L3"]
    canClimbInAuto: v.boolean(),
    
    // Group 3
    depot: v.boolean(),
    
    // Group 4
    outpostIntake: v.boolean(),
    outpostFeed: v.boolean(),
    
    // Group 5
    shootOnTheMove: v.boolean(),
    shooterType: v.string(), // "Dumper", "Turret", "Misc"
    shootingPaths: v.optional(v.number()), // Number of shooting paths (1-5, or undefined for none/other)
    
    // Group 6
    bps: v.number(), // Balls Per Second
    hopperSize: v.number(),
    
    // Group 7
    drivetrain: v.string(),
    gearing: v.optional(v.string()),
    
    // Meta
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
      ballsShot: v.number(),
      climb: v.string(), // "none", "L1"
      notes: v.string(),
    }),
    teleop: v.object({
      ballsShot: v.number(),
      notes: v.string(),
    }),
    endgame: v.object({
      climb: v.string(), // "none", "L1", "L2", "L3"
      notes: v.string(),
    }),

    // Ratings
    driverRating: v.number(), // 1-10
    defenseRating: v.number(), // 1-10
    tags: v.array(v.string()), // "fast", "tippy", etc.
    
    submittedAt: v.number(),
  }).index("by_match_team", ["eventId", "matchNumber", "teamNumber"])
    .index("by_event_team", ["eventId", "teamNumber"]),

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
