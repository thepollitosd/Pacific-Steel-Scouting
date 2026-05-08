import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

function Counter({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  return (
    <div className="flex flex-col items-center p-3 bg-muted/20 border rounded-xl">
      <Label className="mb-3 font-semibold text-center h-8 flex items-center justify-center">{label}</Label>
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={() => onChange(Math.max(0, value - 1))}>
          <Minus className="h-6 w-6" />
        </Button>
        <span className="text-3xl font-black w-12 text-center tabular-nums">{value}</span>
        <Button type="button" variant="default" size="icon" className="h-12 w-12 rounded-full" onClick={() => onChange(value + 1)}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

export function MatchScouting() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const saveMatch = useMutation(api.matchScouting.saveMatchScouting);

  const [matchNumber, setMatchNumber] = useState("");
  const [teamNumber, setTeamNumber] = useState("");
  
  // Auto
  const [autoCoral, setAutoCoral] = useState([0, 0, 0, 0]); // L1, L2, L3, L4
  const [autoAlgae, setAutoAlgae] = useState([0, 0]); // High, Low
  // Teleop
  const [teleopCoral, setTeleopCoral] = useState([0, 0, 0, 0]); // L1, L2, L3, L4
  const [teleopAlgae, setTeleopAlgae] = useState([0, 0]); // High, Low
  // Endgame
  const [climb, setClimb] = useState("none");
  // Ratings
  const [driverRating, setDriverRating] = useState(5);
  const [defenseRating, setDefenseRating] = useState(0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !matchNumber || !teamNumber) return toast.error("Match and Team needed");
    try {
      await saveMatch({
        eventId: activeEvent._id,
        matchNumber: parseInt(matchNumber),
        teamNumber: parseInt(teamNumber),
        auto: { coral: autoCoral, algae: autoAlgae, notes: "" },
        teleop: { coral: teleopCoral, algae: teleopAlgae, notes: "" },
        endgame: { climb, notes: "" },
        driverRating,
        defenseRating,
        tags: [],
      });
      toast.success("Match report saved");
      // Reset
      setMatchNumber(""); setTeamNumber("");
      setAutoCoral([0,0,0,0]); setAutoAlgae([0,0]);
      setTeleopCoral([0,0,0,0]); setTeleopAlgae([0,0]);
      setClimb("none"); setDriverRating(5); setDefenseRating(0);
    } catch {
      toast.error("Failed to save match report");
    }
  };

  const updateArray = (arr: number[], idx: number, val: number) => {
    const next = [...arr];
    next[idx] = val;
    return next;
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Match Scouting</h1>
        <p className="text-muted-foreground">Rapid data collection.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-2 gap-4 p-4 border rounded-xl bg-card">
          <div className="space-y-2">
            <Label>Match #</Label>
            <Input type="number" required className="h-12 text-xl" value={matchNumber} onChange={e => setMatchNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Team #</Label>
            <Input type="number" required className="h-12 text-xl" value={teamNumber} onChange={e => setTeamNumber(e.target.value)} />
          </div>
        </div>

        {/* Autonomous */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 uppercase tracking-wider text-primary">Autonomous</h2>
          <div className="grid grid-cols-2 gap-3">
            {[4, 3, 2, 1].map((lvl, index) => (
              <Counter key={`ac-${lvl}`} label={`Coral L${lvl}`} value={autoCoral[lvl-1]} onChange={(v) => setAutoCoral(prev => updateArray(prev, lvl-1, v))} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Counter label="Algae High" value={autoAlgae[0]} onChange={(v) => setAutoAlgae(prev => updateArray(prev, 0, v))} />
            <Counter label="Algae Low" value={autoAlgae[1]} onChange={(v) => setAutoAlgae(prev => updateArray(prev, 1, v))} />
          </div>
        </div>

        {/* Teleop */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 uppercase tracking-wider text-primary">Teleop</h2>
          <div className="grid grid-cols-2 gap-3">
            {[4, 3, 2, 1].map((lvl, index) => (
              <Counter key={`tc-${lvl}`} label={`Coral L${lvl}`} value={teleopCoral[lvl-1]} onChange={(v) => setTeleopCoral(prev => updateArray(prev, lvl-1, v))} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Counter label="Algae High" value={teleopAlgae[0]} onChange={(v) => setTeleopAlgae(prev => updateArray(prev, 0, v))} />
            <Counter label="Algae Low" value={teleopAlgae[1]} onChange={(v) => setTeleopAlgae(prev => updateArray(prev, 1, v))} />
          </div>
        </div>

        {/* Endgame */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 uppercase tracking-wider text-primary">Endgame</h2>
          <div className="grid grid-cols-3 gap-2">
            {["none", "low", "high"].map(c => (
              <Button key={c} type="button" variant={climb === c ? "default" : "outline"} className="h-14 font-bold uppercase" onClick={() => setClimb(c)}>
                {c}
              </Button>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="space-y-4 p-4 border rounded-xl bg-card">
          <h2 className="text-xl font-bold mb-4">Post-Match Review</h2>
          <div className="space-y-4">
            <Label>Driver Rating (1-10)</Label>
            <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                <button key={v} type="button" onClick={() => setDriverRating(v)} className={`h-10 w-full rounded-md font-bold transition-colors ${driverRating === v ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}>{v}</button>
              ))}
            </div>
            
            <Label className="mt-4 block">Defense Played (0-10)</Label>
            <div className="flex justify-between items-center bg-muted/20 p-2 rounded-lg gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                <button key={v} type="button" onClick={() => setDefenseRating(v)} className={`h-10 w-full rounded-md font-bold transition-colors ${defenseRating === v ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}>{v}</button>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-16 text-xl">Submit Match Report</Button>
      </form>
    </div>
  );
}
