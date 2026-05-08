import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export function PitScouting() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const savePit = useMutation(api.pitScouting.savePitScouting);
  
  const [teamNumber, setTeamNumber] = useState<string>("");
  const [coralLevels, setCoralLevels] = useState<number[]>([]);
  const [algaeLevels, setAlgaeLevels] = useState<string[]>([]);
  const [climbLevels, setClimbLevels] = useState<string[]>([]);
  const [drivetrain, setDrivetrain] = useState("Swerve");
  const [pitLocation, setPitLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCoral = (lvl: number) => {
    setCoralLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
  };
  const toggleAlgae = (lvl: string) => {
    setAlgaeLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
  };
  const toggleClimb = (lvl: string) => {
    setClimbLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !teamNumber) return toast.error("Team number and active event required");
    setIsSubmitting(true);
    try {
      await savePit({
        eventId: activeEvent._id,
        teamNumber: parseInt(teamNumber),
        coralLevels,
        algaeLevels,
        climbLevels,
        drivetrain,
        pitLocation,
        notes,
      });
      toast.success("Pit scouting saved!");
      // Reset form
      setTeamNumber(""); setCoralLevels([]); setAlgaeLevels([]); setClimbLevels([]); 
      setDrivetrain("Swerve"); setPitLocation(""); setNotes("");
    } catch {
      toast.error("Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pit Scouting</h1>
        <p className="text-muted-foreground">Mobile-first capability tracking.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Robot Selection</h2>
          <div className="space-y-2">
            <Label>Team Number</Label>
            <Input type="number" placeholder="Enter Team #" value={teamNumber} onChange={(e) => setTeamNumber(e.target.value)} required className="text-2xl h-14" />
          </div>
          <div className="space-y-2">
            <Label>Pit Location (Optional)</Label>
            <Input placeholder="e.g. Row B, Pit 14" value={pitLocation} onChange={(e) => setPitLocation(e.target.value)} />
          </div>
        </div>

        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Capabilities</h2>
          
          <div className="space-y-3">
            <Label className="text-muted-foreground">Coral Scoring</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(lvl => (
                <Button 
                  key={`coral-${lvl}`} 
                  type="button" 
                  variant={coralLevels.includes(lvl) ? "default" : "outline"} 
                  className="h-16 text-lg"
                  onClick={() => toggleCoral(lvl)}
                >
                  {coralLevels.includes(lvl) && <CheckCircle2 className="mr-2 h-5 w-5" />}
                  Lvl {lvl}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Label className="text-muted-foreground">Algae Scoring</Label>
            <div className="grid grid-cols-2 gap-3">
              {["low", "high"].map(lvl => (
                <Button 
                  key={`algae-${lvl}`} 
                  type="button" 
                  variant={algaeLevels.includes(lvl) ? "default" : "outline"} 
                  className="h-16 text-lg capitalize"
                  onClick={() => toggleAlgae(lvl)}
                >
                  {algaeLevels.includes(lvl) && <CheckCircle2 className="mr-2 h-5 w-5" />}
                  {lvl} Algae
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Label className="text-muted-foreground">Climb</Label>
            <div className="grid grid-cols-2 gap-3">
              {["low", "high"].map(lvl => (
                <Button 
                  key={`climb-${lvl}`} 
                  type="button" 
                  variant={climbLevels.includes(lvl) ? "default" : "outline"} 
                  className="h-16 text-lg capitalize"
                  onClick={() => toggleClimb(lvl)}
                >
                  {climbLevels.includes(lvl) && <CheckCircle2 className="mr-2 h-5 w-5" />}
                  {lvl} Climb
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Specs & Notes</h2>
          <div className="space-y-2">
            <Label>Drivetrain</Label>
            <Select value={drivetrain} onValueChange={setDrivetrain}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Swerve">Swerve</SelectItem>
                <SelectItem value="Tank">Tank</SelectItem>
                <SelectItem value="Mecanum">Mecanum</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Robot Notes</Label>
            <Textarea placeholder="Autonomous paths, preferred scoring locations..." className="min-h-[120px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <Button type="submit" className="w-full h-16 text-xl" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Pit Report"}
        </Button>
      </form>
    </div>
  );
}
