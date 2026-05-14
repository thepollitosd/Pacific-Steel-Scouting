import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { triggerFeedback } from "../../lib/feedback";
import { useUIStore } from "../store/use-ui-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "react-router";
import { useHotkeys } from "react-hotkeys-hook";

function Counter({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="flex flex-col items-center p-3 bg-muted/20 border rounded-xl">
      <Label className="mb-3 font-semibold text-center h-8 flex items-center justify-center">{label}</Label>
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => { onChange(Math.max(0, value - 1)); triggerFeedback(); }}>
          <Minus className="h-6 w-6" />
        </Button>
        <span className="text-3xl font-black w-12 text-center tabular-nums">{value}</span>
        <Button type="button" variant="default" size="icon" className="h-12 w-12 rounded-full" onClick={() => { onChange(value + 1); triggerFeedback(); }}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

function BallCounter({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="flex flex-col items-center p-4 bg-muted/20 border rounded-xl space-y-4">
      <Label className="font-semibold text-lg">{label}</Label>
      <div className="text-4xl font-black tabular-nums">{value}</div>
      <div className="grid grid-cols-3 gap-2 w-full">
        {[1, 5, 25].map(inc => (
          <Button key={`plus-${inc}`} type="button" variant="default" className="h-12 text-lg" onClick={() => { onChange(value + inc); triggerFeedback(); }}>
            +{inc}
          </Button>
        ))}
        {[1, 5, 25].map(inc => (
          <Button key={`minus-${inc}`} type="button" variant="outline" className="h-12 text-lg" onClick={() => { onChange(Math.max(0, value - inc)); triggerFeedback(); }}>
            -{inc}
          </Button>
        ))}
      </div>
      <Button type="button" variant="ghost" className="w-full" onClick={() => { onChange(0); triggerFeedback(); }}>Reset</Button>
    </div>
  );
}

export function MatchScouting() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const saveMatch = useMutation(api.matchScouting.saveMatchScouting);
  const matches = useQuery(api.events.listMatches, activeEvent ? { eventId: activeEvent._id } : "skip") || [];
  const [searchParams] = useSearchParams();
  const matchParam = searchParams.get("match");

  const [matchNumber, setMatchNumber] = useState(matchParam || "");
  const [teamNumber, setTeamNumber] = useState("");

  // Power User Match Navigation
  useHotkeys('mod+[', (e) => {
    e.preventDefault();
    const currentIndex = matches.findIndex((m: any) => m.number === parseInt(matchNumber));
    if (currentIndex > 0) {
      setMatchNumber(matches[currentIndex - 1].number.toString());
      setTeamNumber("");
      toast.info(`Switched to Qual ${matches[currentIndex - 1].number}`);
    }
  }, { enabled: !!matches.length });

  useHotkeys('mod+]', (e) => {
    e.preventDefault();
    const currentIndex = matches.findIndex((m: any) => m.number === parseInt(matchNumber));
    if (currentIndex < matches.length - 1) {
      setMatchNumber(matches[currentIndex + 1].number.toString());
      setTeamNumber("");
      toast.info(`Switched to Qual ${matches[currentIndex + 1].number}`);
    }
  }, { enabled: !!matches.length });
  
  const selectedMatchObj = matches.find((m: any) => m.number === parseInt(matchNumber));
  const teamsInMatch = selectedMatchObj ? [...selectedMatchObj.redAlliance, ...selectedMatchObj.blueAlliance] : [];
  
  // Auto
  const [autoBallsShot, setAutoBallsShot] = useState(0);
  const [autoClimb, setAutoClimb] = useState("none"); // none, L1
  
  // Teleop
  const [teleopBallsShot, setTeleopBallsShot] = useState(0);
  
  // Endgame
  const [climb, setClimb] = useState("none"); // none, L1, L2, L3
  
  // Ratings
  const [driverRating, setDriverRating] = useState(5);
  const [defenseRating, setDefenseRating] = useState(0);

  const { autoSaveInterval, warnOnLeave } = useUIStore();

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("match-scouting-draft");
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setMatchNumber(data.matchNumber || "");
        setTeamNumber(data.teamNumber || "");
        setAutoBallsShot(data.autoBallsShot || 0);
        setAutoClimb(data.autoClimb || "none");
        setTeleopBallsShot(data.teleopBallsShot || 0);
        setClimb(data.climb || "none");
        setDriverRating(data.driverRating || 5);
        setDefenseRating(data.defenseRating || 0);
        toast.success("Draft loaded", { id: "draft-loaded" });
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  // Save draft periodically
  useEffect(() => {
    if (autoSaveInterval === 0) return; // 0 means disabled
    
    const interval = setInterval(() => {
      const data = {
        matchNumber,
        teamNumber,
        autoBallsShot,
        autoClimb,
        teleopBallsShot,
        climb,
        driverRating,
        defenseRating,
      };
      localStorage.setItem("match-scouting-draft", JSON.stringify(data));
      toast.success("Draft auto-saved", { id: "draft-saved", duration: 1000 });
    }, autoSaveInterval * 1000);

    return () => clearInterval(interval);
  }, [matchNumber, teamNumber, autoBallsShot, autoClimb, teleopBallsShot, climb, driverRating, defenseRating, autoSaveInterval]);

  // Warn on leave if dirty
  useEffect(() => {
    if (!warnOnLeave) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDirty = matchNumber || teamNumber || 
        autoBallsShot !== 0 || autoClimb !== "none" ||
        teleopBallsShot !== 0 || climb !== "none" || 
        driverRating !== 5 || defenseRating !== 0;

      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [matchNumber, teamNumber, autoBallsShot, autoClimb, teleopBallsShot, climb, driverRating, defenseRating, warnOnLeave]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !matchNumber || !teamNumber) return toast.error("Match and Team needed");
    try {
      await saveMatch({
        eventId: activeEvent._id,
        matchNumber: parseInt(matchNumber),
        teamNumber: parseInt(teamNumber),
        auto: { ballsShot: autoBallsShot, climb: autoClimb, notes: "" },
        teleop: { ballsShot: teleopBallsShot, notes: "" },
        endgame: { climb, notes: "" },
        driverRating,
        defenseRating,
        tags: [],
      });
      toast.success("Match report saved");
      localStorage.removeItem("match-scouting-draft");
      // Reset
      setMatchNumber(""); setTeamNumber("");
      setAutoBallsShot(0); setAutoClimb("none");
      setTeleopBallsShot(0);
      setClimb("none"); setDriverRating(5); setDefenseRating(0);
    } catch {
      toast.error("Failed to save match report");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Match Scouting</h1>
        <p className="text-muted-foreground">Rapid data collection for REBUILT.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-4 p-4 border rounded-xl bg-card">
          <div className="space-y-2">
            <Label>Select Match</Label>
            <Select value={matchNumber} onValueChange={(val) => { setMatchNumber(val); setTeamNumber(""); }}>
              <SelectTrigger className="h-12 text-xl">
                <SelectValue placeholder="Select Match" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((match: any) => (
                  <SelectItem key={match._id} value={match.number.toString()}>
                    Qual {match.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Team</Label>
            {teamsInMatch.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {teamsInMatch.map((team) => (
                  <Button
                    key={team}
                    type="button"
                    variant={teamNumber === team.toString() ? "default" : "outline"}
                    className={`h-12 text-lg font-bold ${selectedMatchObj?.redAlliance.includes(team) ? "border-red-500 text-red-500 hover:bg-red-500/10" : "border-blue-500 text-blue-500 hover:bg-blue-500/10"}`}
                    onClick={() => setTeamNumber(team.toString())}
                  >
                    {team}
                  </Button>
                ))}
              </div>
            ) : (
              <Input type="number" required className="h-12 text-xl" placeholder="Enter Team #" value={teamNumber} onChange={e => setTeamNumber(e.target.value)} />
            )}
          </div>
        </div>

        {/* Autonomous */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 uppercase tracking-wider text-primary">Autonomous</h2>
          <BallCounter label="Balls Shot in Auto" value={autoBallsShot} onChange={setAutoBallsShot} />
          
          <div className="space-y-2">
            <Label>Climb in Auto</Label>
            <div className="grid grid-cols-2 gap-2">
              {["none", "L1"].map(c => (
                <Button key={c} type="button" variant={autoClimb === c ? "default" : "outline"} className="h-14 font-bold uppercase" onClick={() => { setAutoClimb(c); triggerFeedback(); }}>
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Teleop */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 uppercase tracking-wider text-primary">Teleop</h2>
          <BallCounter label="Balls Shot in Teleop" value={teleopBallsShot} onChange={setTeleopBallsShot} />
        </div>

        {/* Endgame */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 uppercase tracking-wider text-primary">Endgame</h2>
          <div className="space-y-2">
            <Label>Climb Level</Label>
            <div className="grid grid-cols-4 gap-2">
              {["none", "L1", "L2", "L3"].map(c => (
                <Button key={c} type="button" variant={climb === c ? "default" : "outline"} className="h-14 font-bold uppercase" onClick={() => { setClimb(c); triggerFeedback(); }}>
                  {c}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="space-y-4 p-4 border rounded-xl bg-card">
          <h2 className="text-xl font-bold mb-4">Post-Match Review</h2>
          <div className="space-y-4">
            <Label>Driver Rating (1-10)</Label>
            <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                <button key={v} type="button" onClick={() => { setDriverRating(v); triggerFeedback(); }} className={`h-10 w-full rounded-md font-bold transition-colors ${driverRating === v ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}>{v}</button>
              ))}
            </div>
            
            <Label className="mt-4 block">Defense Played (0-10)</Label>
            <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                <button key={v} type="button" onClick={() => { setDefenseRating(v); triggerFeedback(); }} className={`h-10 w-full rounded-md font-bold transition-colors ${defenseRating === v ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}>{v}</button>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-16 text-xl">Submit Match Report</Button>
      </form>
    </div>
  );
}
