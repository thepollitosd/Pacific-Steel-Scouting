import { useParams, useNavigate } from "react-router";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, Clock, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useStatboticsTeamYear } from "../hooks/use-statbotics";

export function TeamDetail() {
  const { teamNumber } = useParams();
  const navigate = useNavigate();
  const teamNum = Number(teamNumber);

  const activeEvent = useQuery(api.events.getActiveEvent);
  const teams = useQuery(api.teams.getByEvent, { eventId: activeEvent?._id });
  const pitData = useQuery(
    api.pitScouting.getPitScoutingForEvent,
    activeEvent?._id ? { eventId: activeEvent._id } : "skip"
  );
  const matchData = useQuery(
    api.matchScouting.getByTeam,
    activeEvent?._id ? { eventId: activeEvent._id, teamNumber: teamNum } : "skip"
  );
  
  const getTeamMedia = useAction(api.tba.getTeamMedia);
  const { data: statboticsData, loading: statboticsLoading } = useStatboticsTeamYear(teamNum, activeEvent?.year);
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    if (teamNum && activeEvent?.year) {
      getTeamMedia({ teamNumber: teamNum, year: activeEvent.year })
        .then(setMedia)
        .catch(console.error);
    }
  }, [teamNum, activeEvent?.year, getTeamMedia]);

  if (!activeEvent) return <div className="p-4">Please setup an event first.</div>;
  if (teams === undefined) return <div className="p-4">Loading team data...</div>;

  const team = teams.find(t => t.number === teamNum);
  if (!team) return <div className="p-4">Team not found.</div>;

  const pitRecord = pitData?.find(r => r.teamNumber === teamNum);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/teams")}
          className="p-2 rounded-xl border bg-card hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Team {team.number}</h1>
          <p className="text-muted-foreground">{team.name} | {team.location}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Data */}
        <div className="md:col-span-1 space-y-6 h-fit">
          {/* Statbotics Card */}
          <div className="p-6 rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-blue-500">Statbotics EPA</h2>
              {statboticsLoading && (
                <span title="Loading latest EPA data...">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </span>
              )}
            </div>
            {statboticsData ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center bg-blue-500/10 p-2 rounded-lg">
                  <span className="text-muted-foreground font-semibold">Total EPA:</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {statboticsData.epa?.total_points?.mean?.toFixed(1) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between p-1">
                  <span className="text-muted-foreground">Auto EPA:</span>
                  <span className="font-semibold">{statboticsData.epa?.auto_points?.mean?.toFixed(1) || "N/A"}</span>
                </div>
                <div className="flex justify-between p-1">
                  <span className="text-muted-foreground">Teleop EPA:</span>
                  <span className="font-semibold">{statboticsData.epa?.teleop_points?.mean?.toFixed(1) || "N/A"}</span>
                </div>
                <div className="flex justify-between p-1">
                  <span className="text-muted-foreground">Endgame EPA:</span>
                  <span className="font-semibold">{statboticsData.epa?.endgame_points?.mean?.toFixed(1) || "N/A"}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No Statbotics data available.</div>
            )}
          </div>

          {/* Pit Scouting Card */}
          <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <h2 className="text-xl font-bold mb-4">Pit Scouting</h2>
          {pitRecord ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pit Location:</span>
                <span className="font-semibold">{pitRecord.pitLocation || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Drivetrain:</span>
                <span className="font-semibold">{pitRecord.drivetrain || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gearing:</span>
                <span className="font-semibold">{pitRecord.gearing || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shooter Type:</span>
                <span className="font-semibold">{pitRecord.shooterType || "N/A"} {pitRecord.shootingPaths ? `(${pitRecord.shootingPaths} paths)` : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">BPS:</span>
                <span className="font-semibold">{pitRecord.bps ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hopper Size:</span>
                <span className="font-semibold">{pitRecord.hopperSize ?? "N/A"}</span>
              </div>
              
              <div>
                <span className="text-muted-foreground block mb-1">Capabilities:</span>
                <div className="flex gap-1 flex-wrap">
                  {pitRecord.trench && <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">Trench</span>}
                  {pitRecord.bump && <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">Bump</span>}
                  {pitRecord.depot && <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">Depot</span>}
                  {pitRecord.outpostIntake && <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">Outpost Intake</span>}
                  {pitRecord.outpostFeed && <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">Outpost Feed</span>}
                  {pitRecord.shootOnTheMove && <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">Shoot on Move</span>}
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block mb-1">Climb:</span>
                <div className="flex gap-1 flex-wrap">
                  {pitRecord.climbLevels?.map(l => (
                    <span key={l} className="px-2 py-0.5 bg-accent/20 text-accent rounded-full text-xs">{l}</span>
                  )) || "None"}
                  {pitRecord.canClimbInAuto && <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs">Auto Climb</span>}
                </div>
              </div>

              <div className="mt-2">
                <span className="text-muted-foreground block mb-1">Notes:</span>
                <p className="p-3 bg-muted/50 rounded-lg text-xs">
                  {(pitRecord.notes && pitRecord.notes !== "Imported from Nexus") 
                    ? pitRecord.notes 
                    : "No notes."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              No pit scouting data available.
            </div>
          )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Media Gallery */}
          {media && media.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Media</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {media.map((item, i) => {
                  if (item.type === "youtube") {
                    return (
                      <a 
                        key={i} 
                        href={item.view_url || `https://youtube.com/watch?v=${item.foreign_key}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="aspect-video bg-muted rounded-xl border flex flex-col items-center justify-center hover:bg-muted/80 transition-colors text-muted-foreground group"
                      >
                        <Video className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform text-red-500" />
                        <span className="text-xs font-semibold">Watch Video</span>
                      </a>
                    );
                  }
                  if (item.direct_url) {
                    return (
                      <a key={i} href={item.direct_url} target="_blank" rel="noreferrer" className="aspect-square bg-muted rounded-xl border overflow-hidden block hover:opacity-90 transition-opacity">
                        <img src={item.direct_url} alt="Robot Media" className="w-full h-full object-cover" loading="lazy" />
                      </a>
                    );
                  }
                  return (
                    <a key={i} href={item.view_url} target="_blank" rel="noreferrer" className="aspect-square bg-muted rounded-xl border flex flex-col items-center justify-center hover:bg-muted/80 transition-colors text-muted-foreground group">
                      <ImageIcon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform text-blue-500" />
                      <span className="text-xs font-semibold">View Image</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Match Scouting List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Match Performance</h2>
          {matchData === undefined ? (
            <div>Loading match data...</div>
          ) : matchData.length === 0 ? (
            <div className="text-muted-foreground p-6 border rounded-2xl bg-card text-center">
              No matches scouted for this team yet.
            </div>
          ) : (
            matchData.map(match => (
              <div key={match._id} className="p-6 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">Match {match.matchNumber}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(match.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-muted rounded-full">Driver: {match.driverRating}/10</span>
                    <span className="px-2 py-1 bg-muted rounded-full">Defense: {match.defenseRating}/10</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {/* Auto */}
                  <div className="p-3 rounded-xl bg-muted/30">
                    <h3 className="font-semibold text-xs text-muted-foreground mb-1">AUTO</h3>
                    <div className="space-y-1">
                      <div>Balls Shot: {match.auto.ballsShot}</div>
                      <div>Climb: <span className="font-semibold uppercase">{match.auto.climb}</span></div>
                      {match.auto.notes && <p className="text-xs mt-1 italic">"{match.auto.notes}"</p>}
                    </div>
                  </div>

                  {/* Teleop */}
                  <div className="p-3 rounded-xl bg-muted/30">
                    <h3 className="font-semibold text-xs text-muted-foreground mb-1">TELEOP</h3>
                    <div className="space-y-1">
                      <div>Balls Shot: {match.teleop.ballsShot}</div>
                      {match.teleop.notes && <p className="text-xs mt-1 italic">"{match.teleop.notes}"</p>}
                    </div>
                  </div>

                  {/* Endgame */}
                  <div className="p-3 rounded-xl bg-muted/30">
                    <h3 className="font-semibold text-xs text-muted-foreground mb-1">ENDGAME</h3>
                    <div>Climb: <span className="font-semibold uppercase">{match.endgame.climb}</span></div>
                    {match.endgame.notes && <p className="text-xs mt-1 italic">"{match.endgame.notes}"</p>}
                  </div>
                </div>

                {match.tags && match.tags.length > 0 && (
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {match.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
