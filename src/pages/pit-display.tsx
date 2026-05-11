import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { AlertTriangle, Trophy, Star, CheckCircle2, XCircle, Activity } from "lucide-react";

export function PitDisplay() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const requests = useQuery(api.driveTeamHub.getRequests, { eventId: activeEvent?._id });
  const matchScouting = useQuery(api.matchScouting.getByTeam, 
    activeEvent ? { eventId: activeEvent._id, teamNumber: 5025 } : "skip"
  );
  const driverFeedback = useQuery(api.driverFeedback?.getByEvent, 
    activeEvent ? { eventId: activeEvent._id } : "skip"
  );

  const [rankings, setRankings] = useState<any[]>([]);
  const getRankingsAction = useAction(api.tba.getRankings);

  useEffect(() => {
    if (activeEvent?.key) {
      getRankingsAction({ eventKey: activeEvent.key })
        .then(setRankings)
        .catch(console.error);
    }
  }, [activeEvent?.key, getRankingsAction]);

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];

  // Combine data by match number to find the last match
  const matches = new Map<number, { scouting?: any, feedback?: any }>();
  matchScouting?.forEach(s => {
    matches.set(s.matchNumber, { ...matches.get(s.matchNumber), scouting: s });
  });
  driverFeedback?.forEach(f => {
    matches.set(f.matchNumber, { ...matches.get(f.matchNumber), feedback: f });
  });

  const sortedMatchNumbers = Array.from(matches.keys()).sort((a, b) => b - a);
  const lastMatchNum = sortedMatchNumbers[0];
  const lastMatch = lastMatchNum ? matches.get(lastMatchNum) : null;

  return (
    <div className="fixed inset-0 bg-background text-foreground p-8 flex flex-col space-y-8 z-50">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Logo" className="h-16 w-16" />
          <div>
            <h1 className="text-5xl font-black tracking-tight">TEAM 5025</h1>
            <p className="text-xl text-muted-foreground uppercase tracking-wider">{activeEvent?.name || "No Active Event"}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm uppercase font-medium text-muted-foreground">System Status</p>
          <p className="text-2xl font-black text-green-500 flex items-center gap-2 justify-end">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            CONNECTED
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Column 1: Active Requests */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              Active Requests
            </h2>
            <span className="text-xl font-bold bg-amber-500/10 text-amber-500 px-4 py-1 rounded-full">
              {pendingRequests.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {pendingRequests.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-2xl text-2xl p-4 text-center">
                No active requests. All systems nominal.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req._id} className="p-6 bg-card border rounded-2xl shadow-sm flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">Team {req.targetTeamNumber}</span>
                    <span className={`text-sm uppercase font-bold px-3 py-1 rounded-full ${
                      req.priority === "critical" ? "bg-red-500 text-white" :
                      req.priority === "high" ? "bg-orange-500 text-white" :
                      "bg-blue-500 text-white"
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-xl">{req.note}</p>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Type: {req.type.toUpperCase()}</span>
                    <span>{new Date(req.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Last Match Info */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-500" />
            Last Match
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {lastMatch ? (
              <div className="bg-card border rounded-2xl p-6 space-y-6">
                <div className="text-center">
                  <p className="text-sm uppercase font-medium text-muted-foreground">Match Number</p>
                  <p className="text-6xl font-black">{lastMatchNum}</p>
                </div>

                {/* Driver Feedback */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold border-b pb-1">Driver Feedback</h3>
                  {lastMatch.feedback ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Drivetrain:</span>
                        <div className="flex text-yellow-500">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-5 h-5" fill={lastMatch.feedback.drivetrainRating >= s ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Intake Issues:</span>
                        {lastMatch.feedback.intakeIssues ? (
                          <span className="flex items-center gap-1 text-destructive font-medium">
                            <XCircle className="w-5 h-5" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-500 font-medium">
                            <CheckCircle2 className="w-5 h-5" /> No
                          </span>
                        )}
                      </div>
                      {lastMatch.feedback.generalNotes && (
                        <div className="bg-muted/50 p-3 rounded-xl mt-2">
                          <p className="text-sm">{lastMatch.feedback.generalNotes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No feedback submitted.</p>
                  )}
                </div>

                {/* Scouting Analysis */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold border-b pb-1">Scouting Analysis</h3>
                  {lastMatch.scouting ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 p-3 rounded-xl text-center">
                          <p className="text-xs text-muted-foreground">Auto Balls</p>
                          <p className="text-3xl font-bold">{lastMatch.scouting.auto.ballsShot}</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-xl text-center">
                          <p className="text-xs text-muted-foreground">Teleop Balls</p>
                          <p className="text-3xl font-bold">{lastMatch.scouting.teleop.ballsShot}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Auto Climb:</span>
                        <span className="font-bold capitalize">{lastMatch.scouting.auto.climb}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Endgame Climb:</span>
                        <span className="font-bold capitalize">{lastMatch.scouting.endgame.climb}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No scouting data recorded.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-2xl text-xl p-4 text-center">
                No match data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Rankings */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Rankings
            </h2>
            <span className="text-sm text-muted-foreground">via TBA</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {rankings.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-2xl text-xl p-4 text-center">
                No ranking data available.
              </div>
            ) : (
              rankings.slice(0, 10).map((rank) => (
                <div key={rank.team_key} className="flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">#{rank.rank}</span>
                    <div>
                      <p className="text-xl font-bold">Team {rank.team_key.replace("frc", "")}</p>
                      <p className="text-sm text-muted-foreground">
                        Record: {rank.record?.wins}-{rank.record?.losses}-{rank.record?.ties}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-mono font-bold">{rank.rank_sort_values?.[0]?.toFixed(2) || "--"}</p>
                    <p className="text-xs text-muted-foreground">Sort Value</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-muted-foreground text-sm border-t pt-2">
        Pit Display Mode • Auto-updates in real-time
      </div>
    </div>
  );
}

export default PitDisplay;
