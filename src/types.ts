
export type Role = "admin" | "scout" | "pit_scout" | "drive_team" | "strategist";

export interface TeamMetrics {
  avgAutoCoral: number[];
  avgTeleopCoral: number[];
  avgAutoAlgae: number[];
  avgTeleopAlgae: number[];
  avgDriverRating: number;
  climbConsistency: number;
}

export type RequestPriority = "low" | "medium" | "high" | "critical";
export type RequestStatus = "pending" | "accepted" | "completed";

export interface PitLocation {
  teamNumber: number;
  label: string;
  row: string;
  coords: { x: number; y: number };
}
