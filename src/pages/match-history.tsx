import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, AlertTriangle, CheckCircle2 } from "lucide-react";

export function MatchHistory() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const matchScouting = useQuery(api.matchScouting.getByTeam, 
    activeEvent ? { eventId: activeEvent._id, teamNumber: 5025 } : "skip"
  );
  const driverFeedback = useQuery(api.driverFeedback?.getByEvent, 
    activeEvent ? { eventId: activeEvent._id } : "skip"
  );

  if (!activeEvent) {
    return <div className="text-center p-8 text-muted-foreground">No active event selected.</div>;
  }

  // Combine data by match number
  const matches = new Map<number, { scouting?: any, feedback?: any }>();

  matchScouting?.forEach(s => {
    matches.set(s.matchNumber, { ...matches.get(s.matchNumber), scouting: s });
  });

  driverFeedback?.forEach(f => {
    matches.set(f.matchNumber, { ...matches.get(f.matchNumber), feedback: f });
  });

  const sortedMatchNumbers = Array.from(matches.keys()).sort((a, b) => b - a); // Descending

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Our Match History</h1>
        <p className="text-muted-foreground mt-2">Combined scouting and driver feedback for Team 5025.</p>
      </div>

      <div className="grid gap-6">
        {sortedMatchNumbers.length === 0 ? (
          <div className="text-center p-12 border rounded-xl bg-card text-muted-foreground">
            No match data recorded yet for Team 5025.
          </div>
        ) : (
          sortedMatchNumbers.map(matchNum => {
            const data = matches.get(matchNum);
            const scouting = data?.scouting;
            const feedback = data?.feedback;

            return (
              <Card key={matchNum} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Match {matchNum}</CardTitle>
                    <div className="flex gap-2">
                      {feedback && (
                        <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full border border-blue-500/20">
                          Driver Feedback
                        </span>
                      )}
                      {scouting && (
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/20">
                          Scouted
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Driver Feedback Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" /> Drive Team Notes
                    </h3>
                    {feedback ? (
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Drivetrain Rating:</span>
                          <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className="w-4 h-4" fill={feedback.drivetrainRating >= s ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Intake Issues:</span>
                          {feedback.intakeIssues ? (
                            <span className="flex items-center gap-1 text-destructive font-medium">
                              <AlertTriangle className="w-4 h-4" /> Yes
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-500 font-medium">
                              <CheckCircle2 className="w-4 h-4" /> No
                            </span>
                          )}
                        </div>
                        {feedback.intakeNotes && (
                          <div className="bg-muted/50 p-2 rounded-md">
                            <p className="text-xs font-medium text-muted-foreground">Intake Notes:</p>
                            <p>{feedback.intakeNotes}</p>
                          </div>
                        )}
                        {feedback.generalNotes && (
                          <div className="bg-muted/50 p-2 rounded-md">
                            <p className="text-xs font-medium text-muted-foreground">General Notes:</p>
                            <p>{feedback.generalNotes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No driver feedback submitted.</p>
                    )}
                  </div>

                  {/* Scouting Data Section */}
                  <div className="space-y-4 border-l pl-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" /> Scout Data
                    </h3>
                    {scouting ? (
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-muted/30 p-2 rounded-md text-center">
                            <p className="text-xs text-muted-foreground">Auto Balls</p>
                            <p className="text-xl font-bold">{scouting.auto.ballsShot}</p>
                          </div>
                          <div className="bg-muted/30 p-2 rounded-md text-center">
                            <p className="text-xs text-muted-foreground">Teleop Balls</p>
                            <p className="text-xl font-bold">{scouting.teleop.ballsShot}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Auto Climb:</span>
                          <span className="font-medium capitalize">{scouting.auto.climb}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Endgame Climb:</span>
                          <span className="font-medium capitalize">{scouting.endgame.climb}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Driver Rating:</span>
                          <span className="font-medium">{scouting.driverRating}/10</span>
                        </div>
                        {scouting.teleop.notes && (
                          <div className="bg-muted/50 p-2 rounded-md">
                            <p className="text-xs font-medium text-muted-foreground">Scouter Notes:</p>
                            <p>{scouting.teleop.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No scout data recorded.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MatchHistory;
