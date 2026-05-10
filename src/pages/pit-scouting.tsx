import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { triggerFeedback } from "../../lib/feedback";
import { useUIStore } from "../store/use-ui-store";
import { useSearchParams } from "react-router";

export function PitScouting() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const savePit = useMutation(api.pitScouting.savePitScouting);
  const getPitMap = useAction(api.nexus.getPitMap);
  
  const [searchParams] = useSearchParams();
  const teamParam = searchParams.get("team");
  const pitParam = searchParams.get("pit");
  
  const [teamNumber, setTeamNumber] = useState<string>("");
  const [trench, setTrench] = useState(false);
  const [bump, setBump] = useState(false);
  const [climbLevels, setClimbLevels] = useState<string[]>([]);
  const [canClimbInAuto, setCanClimbInAuto] = useState(false);
  const [depot, setDepot] = useState(false);
  const [outpostIntake, setOutpostIntake] = useState(false);
  const [outpostFeed, setOutpostFeed] = useState(false);
  const [shootOnTheMove, setShootOnTheMove] = useState(false);
  const [shooterType, setShooterType] = useState("Dumper");
  const [shootingPaths, setShootingPaths] = useState<number | null>(null);
  const [bps, setBps] = useState<string>("0");
  const [hopperSize, setHopperSize] = useState<string>("0");
  const [drivetrain, setDrivetrain] = useState("Swerve");
  const [gearing, setGearing] = useState("");
  const [pitLocation, setPitLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nexusMap, setNexusMap] = useState<any>(null);

  // Fetch pit map from Nexus
  useEffect(() => {
    if (activeEvent?.key) {
      getPitMap({ eventKey: activeEvent.key })
        .then(data => setNexusMap(data))
        .catch(err => console.error("Failed to fetch Nexus map:", err));
    }
  }, [activeEvent?.key, getPitMap]);

  // Set from URL params if present
  useEffect(() => {
    if (teamParam) setTeamNumber(teamParam);
    if (pitParam) setPitLocation(pitParam);
  }, [teamParam, pitParam]);

  // Auto-fill pit location from map when team changes
  useEffect(() => {
    if (nexusMap && nexusMap.pits && teamNumber && !pitLocation) {
      const teamNumInt = parseInt(teamNumber);
      const pitEntry = Object.entries(nexusMap.pits).find(([_, pit]: [string, any]) => pit.team === teamNumInt);
      if (pitEntry) {
        setPitLocation(pitEntry[0]);
      }
    }
  }, [teamNumber, nexusMap, pitLocation]);

  const toggleClimb = (lvl: string) => {
    setClimbLevels(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]);
    triggerFeedback();
  };

  const { autoSaveInterval, warnOnLeave } = useUIStore();

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("pit-scouting-draft");
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setTeamNumber(data.teamNumber || "");
        setTrench(data.trench || false);
        setBump(data.bump || false);
        setClimbLevels(data.climbLevels || []);
        setCanClimbInAuto(data.canClimbInAuto || false);
        setDepot(data.depot || false);
        setOutpostIntake(data.outpostIntake || false);
        setOutpostFeed(data.outpostFeed || false);
        setShootOnTheMove(data.shootOnTheMove || false);
        setShooterType(data.shooterType || "Dumper");
        setShootingPaths(data.shootingPaths !== undefined ? data.shootingPaths : null);
        setBps(data.bps || "0");
        setHopperSize(data.hopperSize || "0");
        setDrivetrain(data.drivetrain || "Swerve");
        setGearing(data.gearing || "");
        setPitLocation(data.pitLocation || "");
        setNotes(data.notes || "");
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
        teamNumber, trench, bump, climbLevels, canClimbInAuto, depot,
        outpostIntake, outpostFeed, shootOnTheMove, shooterType, shootingPaths,
        bps, hopperSize, drivetrain, gearing, pitLocation, notes
      };
      localStorage.setItem("pit-scouting-draft", JSON.stringify(data));
      toast.success("Draft auto-saved", { id: "draft-saved", duration: 1000 });
    }, autoSaveInterval * 1000);

    return () => clearInterval(interval);
  }, [teamNumber, trench, bump, climbLevels, canClimbInAuto, depot, outpostIntake, outpostFeed, shootOnTheMove, shooterType, shootingPaths, bps, hopperSize, drivetrain, gearing, pitLocation, notes, autoSaveInterval]);

  // Warn on leave if dirty
  useEffect(() => {
    if (!warnOnLeave) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDirty = teamNumber || trench || bump || climbLevels.length > 0 ||
        canClimbInAuto || depot || outpostIntake || outpostFeed ||
        shootOnTheMove || shooterType !== "Dumper" || shootingPaths !== null || bps !== "0" ||
        hopperSize !== "0" || drivetrain !== "Swerve" || gearing || pitLocation || notes;

      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [teamNumber, trench, bump, climbLevels, canClimbInAuto, depot, outpostIntake, outpostFeed, shootOnTheMove, shooterType, shootingPaths, bps, hopperSize, drivetrain, gearing, pitLocation, notes, warnOnLeave]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !teamNumber) return toast.error("Team number and active event required");
    setIsSubmitting(true);
    try {
      await savePit({
        eventId: activeEvent._id,
        teamNumber: parseInt(teamNumber),
        trench,
        bump,
        climbLevels,
        canClimbInAuto,
        depot,
        outpostIntake,
        outpostFeed,
        shootOnTheMove,
        shooterType,
        shootingPaths: shootingPaths === null ? undefined : shootingPaths,
        bps: parseFloat(bps),
        hopperSize: parseInt(hopperSize),
        drivetrain,
        gearing: gearing || undefined,
        pitLocation,
        notes,
      });
      toast.success("Pit scouting saved!");
      localStorage.removeItem("pit-scouting-draft");
      // Reset form
      setTeamNumber(""); setTrench(false); setBump(false); setClimbLevels([]); setCanClimbInAuto(false);
      setDepot(false); setOutpostIntake(false); setOutpostFeed(false); setShootOnTheMove(false);
      setShooterType("Dumper"); setShootingPaths(null); setBps("0"); setHopperSize("0"); setDrivetrain("Swerve");
      setGearing(""); setPitLocation(""); setNotes("");
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
        <p className="text-muted-foreground">Mobile-first capability tracking for REBUILT.</p>
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

        {/* Group 1: Trench, Bump */}
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Mobility</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant={trench ? "default" : "outline"} 
              className="h-16 text-lg"
              onClick={() => { setTrench(!trench); triggerFeedback(); }}
            >
              {trench && <CheckCircle2 className="mr-2 h-5 w-5" />}
              Trench
            </Button>
            <Button 
              type="button" 
              variant={bump ? "default" : "outline"} 
              className="h-16 text-lg"
              onClick={() => { setBump(!bump); triggerFeedback(); }}
            >
              {bump && <CheckCircle2 className="mr-2 h-5 w-5" />}
              Bump
            </Button>
          </div>
        </div>

        {/* Group 2: L1,L2,L3 Climb + Auto Climb */}
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Climb</h2>
          <div className="grid grid-cols-3 gap-3">
            {["L1", "L2", "L3"].map(lvl => (
              <Button 
                key={`climb-${lvl}`} 
                type="button" 
                variant={climbLevels.includes(lvl) ? "default" : "outline"} 
                className="h-16 text-lg"
                onClick={() => toggleClimb(lvl)}
              >
                {climbLevels.includes(lvl) && <CheckCircle2 className="mr-2 h-5 w-5" />}
                {lvl}
              </Button>
            ))}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="auto-climb" checked={canClimbInAuto} onCheckedChange={(checked) => setCanClimbInAuto(!!checked)} />
            <Label htmlFor="auto-climb" className="text-lg">Can climb in Auto</Label>
          </div>
        </div>

        {/* Group 3: Depot */}
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Depot</h2>
          <Button 
            type="button" 
            variant={depot ? "default" : "outline"} 
            className="w-full h-16 text-lg"
            onClick={() => { setDepot(!depot); triggerFeedback(); }}
          >
            {depot && <CheckCircle2 className="mr-2 h-5 w-5" />}
            Can use Depot
          </Button>
        </div>

        {/* Group 4: Outpost Intake, Outpost Feed */}
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Outpost</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant={outpostIntake ? "default" : "outline"} 
              className="h-16 text-lg"
              onClick={() => { setOutpostIntake(!outpostIntake); triggerFeedback(); }}
            >
              {outpostIntake && <CheckCircle2 className="mr-2 h-5 w-5" />}
              Intake
            </Button>
            <Button 
              type="button" 
              variant={outpostFeed ? "default" : "outline"} 
              className="h-16 text-lg"
              onClick={() => { setOutpostFeed(!outpostFeed); triggerFeedback(); }}
            >
              {outpostFeed && <CheckCircle2 className="mr-2 h-5 w-5" />}
              Feed
            </Button>
          </div>
        </div>

        {/* Group 5: Shoot on the Move, Shooter Type */}
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Shooter</h2>
          <div className="flex items-center space-x-2 pb-2">
            <Checkbox id="shoot-move" checked={shootOnTheMove} onCheckedChange={(checked) => setShootOnTheMove(!!checked)} />
            <Label htmlFor="shoot-move" className="text-lg">Shoot on the Move</Label>
          </div>
          <div className="space-y-2">
            <Label>Shooter Type</Label>
            <Select value={shooterType} onValueChange={(val) => {
              setShooterType(val);
              if (val !== "Misc" && val !== "Turret") setShootingPaths(null);
            }}>
              <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Dumper">Dumper</SelectItem>
                <SelectItem value="Turret">Turret</SelectItem>
                <SelectItem value="Misc">Misc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(shooterType === "Misc" || shooterType === "Turret") && (
            <div className="space-y-2 pt-2 border-t mt-4">
              <Label>Number of Shooting Paths</Label>
              <Select 
                value={shootingPaths === null ? "none" : shootingPaths.toString()} 
                onValueChange={(val) => setShootingPaths(val === "none" ? null : parseInt(val))}
              >
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="1">1 Path</SelectItem>
                  <SelectItem value="2">2 Paths</SelectItem>
                  <SelectItem value="3">3 Paths</SelectItem>
                  <SelectItem value="4">4 Paths</SelectItem>
                  <SelectItem value="5">5 Paths</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Group 6: BPS, Hopper Size */}
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Capacity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Balls Per Second (BPS)</Label>
              <Input type="number" step="0.1" value={bps} onChange={(e) => setBps(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Hopper Size</Label>
              <Input type="number" value={hopperSize} onChange={(e) => setHopperSize(e.target.value)} className="h-12" />
            </div>
          </div>
        </div>

        {/* Group 7: Drivetrain, Gearing */}
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <h2 className="text-xl font-semibold">Drive Specs</h2>
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
            <Label>Gearing (Optional)</Label>
            <Input placeholder="e.g. High speed, Low gear" value={gearing} onChange={(e) => setGearing(e.target.value)} className="h-12" />
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
