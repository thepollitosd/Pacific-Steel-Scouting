import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { useUIStore } from "../store/use-ui-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MatchSchedule() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const matches = useQuery(api.events.listMatches, activeEvent ? { eventId: activeEvent._id } : "skip") || [];
  const scoutingData = useQuery(api.matchScouting.getByEvent, activeEvent ? { eventId: activeEvent._id } : "skip") || [];
  
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ours" | "unscouted">("all");
  const navigate = useNavigate();
  const layoutDensity = useUIStore((state) => state.layoutDensity);

  if (!activeEvent) return <div>Please setup an event first.</div>;

  // Group scouting data by match
  const scoutedMatches = new Map<number, Set<number>>();
  scoutingData.forEach(r => {
    if (!scoutedMatches.has(r.matchNumber)) {
      scoutedMatches.set(r.matchNumber, new Set());
    }
    scoutedMatches.get(r.matchNumber)?.add(r.teamNumber);
  });

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.number.toString().includes(search) || 
                          match.redAlliance.some((t: number) => t.toString().includes(search)) || 
                          match.blueAlliance.some((t: number) => t.toString().includes(search));
    
    const isOurs = match.redAlliance.includes(5025) || match.blueAlliance.includes(5025);
    const scoutedTeams = scoutedMatches.get(match.number) || new Set();
    const isFullyScouted = scoutedTeams.size >= 6;

    if (filter === "ours" && !isOurs) return false;
    if (filter === "unscouted" && isFullyScouted) return false;
    
    return matchesSearch;
  }).sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Match Schedule ({filteredMatches.length})</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-full sm:w-[140px] bg-background">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="ours">Our Matches</SelectItem>
              <SelectItem value="unscouted">Unscouted</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 bg-background"
              placeholder="Search match or team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${layoutDensity === "compact" ? "gap-2" : "gap-4"}`}>
        {filteredMatches.map(match => {
          const isOurs = match.redAlliance.includes(5025) || match.blueAlliance.includes(5025);
          const scoutedTeams = scoutedMatches.get(match.number) || new Set();
          const fullyScouted = scoutedTeams.size >= 6;
          const partiallyScouted = scoutedTeams.size > 0 && scoutedTeams.size < 6;

          return (
            <Card 
              key={match._id} 
              className={`overflow-hidden border-2 ${isOurs ? "border-primary" : "border-border"} hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => navigate(`/scouting?match=${match.number}`)}
            >
              <CardHeader className={`py-3 ${isOurs ? "bg-primary/10" : "bg-muted/50"}`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Qual {match.number}</CardTitle>
                  <div className="flex gap-2">
                    {isOurs && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary text-primary-foreground">
                        Our Match
                      </span>
                    )}
                    {fullyScouted ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-500 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Scouted
                      </span>
                    ) : partiallyScouted ? (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {scoutedTeams.size}/6
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Unscouted
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Red Alliance */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-red-500 uppercase">Red Alliance</p>
                    {match.redAlliance.map((team: number) => (
                      <div 
                        key={team} 
                        className={`text-sm font-medium flex items-center justify-between p-1 rounded ${scoutedTeams.has(team) ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted/30"}`}
                      >
                        <span className={team === 5025 ? "font-black underline" : ""}>{team}</span>
                        {scoutedTeams.has(team) && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                    ))}
                  </div>
                  {/* Blue Alliance */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-500 uppercase">Blue Alliance</p>
                    {match.blueAlliance.map((team: number) => (
                      <div 
                        key={team} 
                        className={`text-sm font-medium flex items-center justify-between p-1 rounded ${scoutedTeams.has(team) ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-muted/30"}`}
                      >
                        <span className={team === 5025 ? "font-black underline" : ""}>{team}</span>
                        {scoutedTeams.has(team) && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default MatchSchedule;
