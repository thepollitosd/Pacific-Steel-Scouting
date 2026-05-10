import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Search, X, Crosshair, Asterisk, CirclePile, Tally1, Tally2, Tally3, Tally4, Tally5, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useUIStore } from "../store/use-ui-store";
import { useStatboticsEvent } from "../hooks/use-statbotics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function TeamList() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const teams = useQuery(api.teams.getByEvent, { eventId: activeEvent?._id });
  const pitScoutingData = useQuery(
    api.pitScouting.getPitScoutingForEvent,
    activeEvent?._id ? { eventId: activeEvent._id } : "skip"
  );
  const { data: statboticsData, loading: statboticsLoading } = useStatboticsEvent(activeEvent?.key);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"number" | "epa">("number");
  const [scoutFilter, setScoutFilter] = useState<"all" | "scouted" | "unscouted">("all");
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const navigate = useNavigate();
  const layoutDensity = useUIStore((state) => state.layoutDensity);

  if (teams === undefined) return <div>Loading teams...</div>;
  if (!activeEvent) return <div>Please setup an event first.</div>;

  const scoutedTeamNumbers = new Set(
    pitScoutingData
      ? pitScoutingData
        .filter(r => r.drivetrain !== "" || r.trench || r.bump || r.depot || r.outpostIntake || r.outpostFeed || r.shootOnTheMove || (r.climbLevels && r.climbLevels.length > 0))
        .map(r => r.teamNumber)
      : []
  );

  const filtered = teams.filter(t => {
    const matchesSearch = t.number.toString().includes(search) || t.name.toLowerCase().includes(search.toLowerCase());
    const isScouted = scoutedTeamNumbers.has(t.number);
    
    if (scoutFilter === "scouted" && !isScouted) return false;
    if (scoutFilter === "unscouted" && isScouted) return false;
    
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "epa") {
      const epaA = statboticsData?.find(s => s.team === a.number)?.epa?.total_points?.mean ?? -1;
      const epaB = statboticsData?.find(s => s.team === b.number)?.epa?.total_points?.mean ?? -1;
      return epaB - epaA;
    }
    return a.number - b.number;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Teams ({filtered.length})</h1>
          {statboticsLoading && (
            <span title="Loading latest EPA data...">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-full sm:w-[140px] bg-background">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Team Number</SelectItem>
              <SelectItem value="epa">Highest EPA</SelectItem>
            </SelectContent>
          </Select>

          <Select value={scoutFilter} onValueChange={(v: any) => setScoutFilter(v)}>
            <SelectTrigger className="w-full sm:w-[140px] bg-background">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              <SelectItem value="scouted">Scouted</SelectItem>
              <SelectItem value="unscouted">Not Scouted</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 bg-background"
              placeholder="Search teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${layoutDensity === "compact" ? "gap-2" : "gap-4"}`}>
        {filtered.map(team => {
          const isScouted = scoutedTeamNumbers.has(team.number);
          const scoutData = pitScoutingData?.find(r => r.teamNumber === team.number);
          const shooterType = scoutData?.shooterType;
          const shootingPaths = scoutData?.shootingPaths;

          let ShooterIcon = null;
          if (shooterType === "Turret") ShooterIcon = Crosshair;
          else if (shooterType === "Dumper") ShooterIcon = CirclePile;
          else if (shooterType === "Misc") {
            if (shootingPaths === 1) ShooterIcon = Tally1;
            else if (shootingPaths === 2) ShooterIcon = Tally2;
            else if (shootingPaths === 3) ShooterIcon = Tally3;
            else if (shootingPaths === 4) ShooterIcon = Tally4;
            else if (shootingPaths === 5) ShooterIcon = Tally5;
            else ShooterIcon = Asterisk;
          }

          return (
            <div
              key={team._id}
              className={`${layoutDensity === "compact" ? "p-2" : "p-4"} rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setSelectedTeam(team)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black">{team.number}</span>
                  {ShooterIcon && (
                    <span title={shooterType + (shootingPaths ? ` (${shootingPaths} paths)` : "")}>
                      <ShooterIcon className="h-5 w-5 text-muted-foreground" />
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {statboticsData && statboticsData.find(s => s.team === team.number) && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                      EPA: {statboticsData.find(s => s.team === team.number).epa?.total_points?.mean?.toFixed(1) || "N/A"}
                    </span>
                  )}
                  {isScouted ? (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/20 text-primary">Scouted</span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted">Unscouted</span>
                  )}
                </div>
              </div>
              <h3 className="font-semibold truncate">{team.name}</h3>
              <p className="text-xs text-muted-foreground truncate mt-1">{team.location}</p>
            </div>
          );
        })}
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedTeam(null)}>
          <div className="bg-card text-card-foreground p-6 rounded-2xl shadow-xl w-full max-w-md border" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-3xl font-black">{selectedTeam.number}</span>
                <h2 className="text-xl font-bold mt-1">{selectedTeam.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedTeam.location}</p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Pit Scouting Info */}
              {(() => {
                const scoutData = pitScoutingData?.find(r => r.teamNumber === selectedTeam.number);
                return (
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <h3 className="font-semibold mb-2">Pit Scouting Status</h3>
                    {scoutData ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-semibold text-primary">Scouted</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shooter Type:</span>
                          <span className="font-semibold">{scoutData.shooterType || "N/A"} {scoutData.shootingPaths ? `(${scoutData.shootingPaths} paths)` : ""}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Climb:</span>
                          <span className="font-semibold">{scoutData.climbLevels?.join(", ") || "None"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Drivetrain:</span>
                          <span className="font-semibold">{scoutData.drivetrain || "N/A"}</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground block mb-1">Notes:</span>
                          <p className="p-2 bg-background rounded-lg text-xs">{scoutData.notes || "No notes."}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        This team has not been scouted yet.
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Statbotics Info Modal */}
              {(() => {
                const sData = statboticsData?.find(s => s.team === selectedTeam.number);
                if (!sData && !statboticsLoading) return null;
                return (
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Statbotics Expected Points Added</h3>
                      {statboticsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    {sData ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total EPA:</span>
                          <span className="font-bold text-blue-500">{sData.epa?.total_points?.mean?.toFixed(1) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Auto EPA:</span>
                          <span className="font-semibold">{sData.epa?.auto_points?.mean?.toFixed(1) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Teleop EPA:</span>
                          <span className="font-semibold">{sData.epa?.teleop_points?.mean?.toFixed(1) || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Endgame EPA:</span>
                          <span className="font-semibold">{sData.epa?.endgame_points?.mean?.toFixed(1) || "N/A"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Loading EPA data...</div>
                    )}
                  </div>
                );
              })()}

              <button
                onClick={() => navigate(`/teams/${selectedTeam.number}`)}
                className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                View Full Team Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
