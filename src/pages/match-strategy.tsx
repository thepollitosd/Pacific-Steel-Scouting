import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Target, Shield, Zap, X, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStatboticsEvent } from "../hooks/use-statbotics";

export function MatchStrategy() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const teams = useQuery(api.teams.getByEvent, { eventId: activeEvent?._id });
  const { data: statboticsData } = useStatboticsEvent(activeEvent?.key);
  const teamAverages = useQuery(api.matchScouting.getTeamAverages, activeEvent ? { eventId: activeEvent._id } : "skip");

  const [blueTeams, setBlueTeams] = useState<(number | null)[]>([null, null, null]);
  const [redTeams, setRedTeams] = useState<(number | null)[]>([null, null, null]);

  const updateTeam = (alliance: "blue" | "red", index: number, value: string) => {
    const num = value === "clear" ? null : parseInt(value);
    if (alliance === "blue") {
      const newTeams = [...blueTeams];
      newTeams[index] = num;
      setBlueTeams(newTeams);
    } else {
      const newTeams = [...redTeams];
      newTeams[index] = num;
      setRedTeams(newTeams);
    }
  };

  const getEpa = (teamNumber: number | null) => {
    if (!teamNumber || !statboticsData) return 0;
    return statboticsData.find((s) => s.team === teamNumber)?.epa?.total_points?.mean || 0;
  };

  const blueScore = blueTeams.reduce<number>((acc, t) => acc + getEpa(t), 0);
  const redScore = redTeams.reduce<number>((acc, t) => acc + getEpa(t), 0);
  const hasTeams = blueTeams.some(t => t !== null) || redTeams.some(t => t !== null);

  const renderTeamSelector = (alliance: "blue" | "red", index: number, currentValue: number | null) => {
    return (
      <div className="flex items-center gap-2">
        <Select 
          value={currentValue?.toString() || ""} 
          onValueChange={(val) => updateTeam(alliance, index, val)}
        >
          <SelectTrigger className={`flex-1 h-14 text-lg ${currentValue ? "border-primary" : "border-dashed"}`}>
            <SelectValue placeholder={`+ Add Team ${index + 1}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clear" className="text-destructive">Clear Selection</SelectItem>
            {teams?.map((t) => (
              <SelectItem key={t.number} value={t.number.toString()}>
                {t.number} - {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {currentValue && (
          <div className="w-16 text-center text-sm font-semibold text-muted-foreground bg-muted rounded-md py-1" title="Statbotics EPA">
            {getEpa(currentValue).toFixed(1)}
          </div>
        )}
      </div>
    );
  };

  // Calculate correlation data
  const correlationData = teams?.map(team => {
    const epa = getEpa(team.number);
    const actual = teamAverages?.find(a => a.teamNumber === team.number);
    return {
      teamNumber: team.number,
      teamName: team.name,
      epa,
      actual: actual?.avgTotal || 0,
      diff: (actual?.avgTotal || 0) - epa,
      matchCount: actual?.matchCount || 0,
    };
  }).filter(d => d.matchCount > 0) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Match Strategy Predictor</h1>
        <p className="text-muted-foreground mt-2">
          Compare alliance data, project scores, and formulate winning strategies.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Blue Alliance */}
        <Card className="border-blue-500/50 shadow-blue-500/10">
          <CardHeader className="bg-blue-500/10 rounded-t-xl pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Blue Alliance
              </CardTitle>
              {blueScore > 0 && <span className="font-bold text-lg text-blue-500">{blueScore.toFixed(1)}</span>}
            </div>
            <CardDescription>Select 3 teams to analyze</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {renderTeamSelector("blue", 0, blueTeams[0])}
            {renderTeamSelector("blue", 1, blueTeams[1])}
            {renderTeamSelector("blue", 2, blueTeams[2])}
          </CardContent>
        </Card>

        {/* Red Alliance */}
        <Card className="border-red-500/50 shadow-red-500/10">
          <CardHeader className="bg-red-500/10 rounded-t-xl pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Red Alliance
              </CardTitle>
              {redScore > 0 && <span className="font-bold text-lg text-red-500">{redScore.toFixed(1)}</span>}
            </div>
            <CardDescription>Select 3 teams to analyze</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {renderTeamSelector("red", 0, redTeams[0])}
            {renderTeamSelector("red", 1, redTeams[1])}
            {renderTeamSelector("red", 2, redTeams[2])}
          </CardContent>
        </Card>
      </div>

      {/* Projection Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Match Projection
          </CardTitle>
          <CardDescription>Estimated score based on historical averages</CardDescription>
        </CardHeader>
        <CardContent>
          {hasTeams ? (
            <div className="flex items-center justify-between p-6">
              <div className="text-center w-1/3">
                <h3 className="text-2xl font-black text-blue-500">{blueScore.toFixed(1)}</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-2">Blue Win %</p>
                <div className="text-xl font-bold mt-1">
                  {blueScore === redScore ? "50%" : `${((blueScore / (blueScore + redScore)) * 100).toFixed(1)}%`}
                </div>
              </div>
              
              <div className="flex-1 px-8 flex items-center">
                <div className="h-4 w-full rounded-full flex overflow-hidden bg-muted">
                  <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${(blueScore / (blueScore + redScore || 1)) * 100}%` }} />
                  <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(redScore / (blueScore + redScore || 1)) * 100}%` }} />
                </div>
              </div>

              <div className="text-center w-1/3">
                <h3 className="text-2xl font-black text-red-500">{redScore.toFixed(1)}</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mt-2">Red Win %</p>
                <div className="text-xl font-bold mt-1">
                  {blueScore === redScore ? "50%" : `${((redScore / (blueScore + redScore)) * 100).toFixed(1)}%`}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Target className="w-12 h-12 text-muted-foreground/50" />
              <div className="text-xl font-medium text-muted-foreground">
                Select teams above to generate a projection.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statbotics vs Reality Correlation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-primary" />
            Statbotics vs. Reality Correlation
          </CardTitle>
          <CardDescription>Compare predicted EPA with actual scouted performance</CardDescription>
        </CardHeader>
        <CardContent>
          {correlationData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No scouted data available yet to compare.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Statbotics EPA</TableHead>
                  <TableHead>Actual Avg</TableHead>
                  <TableHead>Difference</TableHead>
                  <TableHead>Matches</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {correlationData.sort((a, b) => b.actual - a.actual).map((d) => (
                  <TableRow key={d.teamNumber}>
                    <TableCell className="font-medium">{d.teamNumber} - {d.teamName}</TableCell>
                    <TableCell>{d.epa.toFixed(1)}</TableCell>
                    <TableCell>{d.actual.toFixed(1)}</TableCell>
                    <TableCell className={d.diff > 0 ? "text-green-500 font-bold" : d.diff < 0 ? "text-red-500 font-bold" : ""}>
                      {d.diff > 0 ? `+${d.diff.toFixed(1)}` : d.diff.toFixed(1)}
                    </TableCell>
                    <TableCell>{d.matchCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MatchStrategy;
