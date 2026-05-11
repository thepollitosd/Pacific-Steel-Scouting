import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Users, Trophy, RotateCcw, Check, X, ArrowRight } from "lucide-react";
import { useStatboticsEvent } from "../hooks/use-statbotics";
import { cn } from "@/lib/utils";

interface Alliance {
  number: number;
  captain: number | null;
  pick1: number | null;
  pick2: number | null;
}

export function AllianceSelection() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const pitScouting = useQuery(api.pitScouting.getPitScoutingForEvent, activeEvent ? { eventId: activeEvent._id } : "skip");
  const { data: statboticsData } = useStatboticsEvent(activeEvent?.key);

  const [fullRankedTeams, setFullRankedTeams] = useState<number[]>([]);
  const [availableTeams, setAvailableTeams] = useState<number[]>([]);
  const [alliances, setAlliances] = useState<Alliance[]>(
    Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      captain: null,
      pick1: null,
      pick2: null,
    }))
  );
  
  const [currentStep, setCurrentStep] = useState<{
    round: 1 | 2;
    allianceIndex: number; // 0 to 7
  }>({ round: 1, allianceIndex: 0 });

  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [declinedTeams, setDeclinedTeams] = useState<number[]>([]);

  // Initialize available teams from pit scouting or statbotics
  useEffect(() => {
    if (pitScouting && fullRankedTeams.length === 0) {
      const teams = pitScouting.map(p => p.teamNumber).sort((a, b) => a - b);
      
      let sorted = teams;
      if (statboticsData) {
        sorted = [...teams].sort((a, b) => {
          const epaA = statboticsData.find(s => s.team === a)?.epa?.total_points?.mean ?? -1;
          const epaB = statboticsData.find(s => s.team === b)?.epa?.total_points?.mean ?? -1;
          return epaB - epaA;
        });
      }
      
      setFullRankedTeams(sorted);
      setAvailableTeams(sorted.slice(8));
      
      setAlliances(Array.from({ length: 8 }, (_, i) => ({
        number: i + 1,
        captain: sorted[i] || null,
        pick1: null,
        pick2: null,
      })));
    }
  }, [pitScouting, statboticsData]);

  const getTeamEpa = (teamNum: number) => {
    return statboticsData?.find(s => s.team === teamNum)?.epa?.total_points?.mean;
  };

  const handlePick = () => {
    if (!selectedTeam) {
      toast.error("Please select a team to pick");
      return;
    }

    const { round, allianceIndex } = currentStep;
    const currentAlliance = alliances[allianceIndex];

    const newAlliances = [...alliances];
    
    // Check if the picked team is currently a captain
    const pickedCaptainIndex = alliances.findIndex(a => a.captain === selectedTeam);
    
    if (pickedCaptainIndex !== -1) {
      // It's a captain! We need to shift seeds.
      // 1. Remove them from their captain spot
      // 2. Shift all captains below them up
      // 3. Find a new captain for alliance 8
      
      toast.info(`Captain ${selectedTeam} accepted the pick! Shifting seeds...`);
      
      // Shift captains up
      for (let i = pickedCaptainIndex; i < 7; i++) {
        newAlliances[i].captain = newAlliances[i+1].captain;
      }
      
      // Find new captain for Alliance 8
      // It must be the next team in fullRankedTeams that is NOT a captain and NOT a pick
      const currentCaptains = newAlliances.map(a => a.captain).filter(Boolean);
      const currentPicks = newAlliances.flatMap(a => [a.pick1, a.pick2]).filter(Boolean);
      
      const nextCaptain = fullRankedTeams.find(t => 
        !currentCaptains.includes(t) && 
        !currentPicks.includes(t) && 
        !declinedTeams.includes(t) &&
        t !== selectedTeam
      );
      
      newAlliances[7].captain = nextCaptain || null;
    }

    // Assign the pick
    if (round === 1) {
      newAlliances[allianceIndex] = { ...newAlliances[allianceIndex], pick1: selectedTeam };
    } else {
      newAlliances[allianceIndex] = { ...newAlliances[allianceIndex], pick2: selectedTeam };
    }

    setAlliances(newAlliances);
    
    // Update available teams (remove the picked team)
    const currentCaptains = newAlliances.map(a => a.captain).filter(Boolean);
    const currentPicks = newAlliances.flatMap(a => [a.pick1, a.pick2]).filter(Boolean);
    
    setAvailableTeams(fullRankedTeams.filter(t => 
      !currentCaptains.includes(t) && 
      !currentPicks.includes(t) && 
      !declinedTeams.includes(t)
    ));
    
    setSelectedTeam(null);

    // Advance step
    advanceStep(round, allianceIndex);
    toast.success(`Alliance ${allianceIndex + 1} picked Team ${selectedTeam}`);
  };

  const handleDecline = () => {
    if (!selectedTeam) {
      toast.error("Please select a team that declined");
      return;
    }
    
    // Captains cannot decline unless they are in top 8 and picking, or being picked.
    // If a captain declines a pick, they cannot be picked again, but they can still pick!
    // So we just add them to declined list and remove from available pool.
    
    setDeclinedTeams([...declinedTeams, selectedTeam]);
    
    const currentCaptains = alliances.map(a => a.captain).filter(Boolean);
    const currentPicks = alliances.flatMap(a => [a.pick1, a.pick2]).filter(Boolean);
    
    setAvailableTeams(fullRankedTeams.filter(t => 
      !currentCaptains.includes(t) && 
      !currentPicks.includes(t) && 
      ![...declinedTeams, selectedTeam].includes(t)
    ));
    
    setSelectedTeam(null);
    toast.warning(`Team ${selectedTeam} declined and cannot be picked again.`);
  };

  const advanceStep = (round: 1 | 2, allianceIndex: number) => {
    if (round === 1) {
      if (allianceIndex < 7) {
        setCurrentStep({ round: 1, allianceIndex: allianceIndex + 1 });
      } else {
        // Serpentine: Alliance 8 picks again at start of round 2
        setCurrentStep({ round: 2, allianceIndex: 7 });
      }
    } else {
      if (allianceIndex > 0) {
        setCurrentStep({ round: 2, allianceIndex: allianceIndex - 1 });
      } else {
        toast.success("Alliance selection complete!");
      }
    }
  };

  const resetSimulation = () => {
    if (pitScouting) {
      const teams = pitScouting.map(p => p.teamNumber);
      let sorted = teams;
      if (statboticsData) {
        sorted = [...teams].sort((a, b) => {
          const epaA = statboticsData.find(s => s.team === a)?.epa?.total_points?.mean ?? -1;
          const epaB = statboticsData.find(s => s.team === b)?.epa?.total_points?.mean ?? -1;
          return epaB - epaA;
        });
      }
      
      setFullRankedTeams(sorted);
      setAvailableTeams(sorted.slice(8));
      setAlliances(Array.from({ length: 8 }, (_, i) => ({
        number: i + 1,
        captain: sorted[i] || null,
        pick1: null,
        pick2: null,
      })));
    }
    setCurrentStep({ round: 1, allianceIndex: 0 });
    setDeclinedTeams([]);
    setSelectedTeam(null);
    toast.success("Simulation reset");
  };

  const currentAlliancePicking = alliances[currentStep.allianceIndex];

  // All teams that are currently captains or picks
  const assignedTeams = alliances.flatMap(a => [a.captain, a.pick1, a.pick2]).filter(Boolean) as number[];
  
  // Selectable teams include available teams AND captains below the current picker (who haven't been picked yet)
  // Note: Captains can ONLY be picked in Round 1.
  const selectableTeams = fullRankedTeams.filter(t => {
    if (declinedTeams.includes(t)) return false;
    if (assignedTeams.includes(t)) {
      // Is it a captain?
      const allianceIdx = alliances.findIndex(a => a.captain === t);
      if (allianceIdx !== -1) {
        // Captains can only be picked in Round 1 and if they are BELOW the current picker!
        return currentStep.round === 1 && allianceIdx > currentStep.allianceIndex;
      }
      return false; // Already picked as a partner
    }
    return true; // Not assigned yet
  });

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alliance Selection Simulator</h1>
          <p className="text-muted-foreground">Simulate picks and project alliance strengths.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={resetSimulation} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>

      {/* Controller / HUD */}
      <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">CURRENTLY PICKING</p>
            <h2 className="text-2xl font-bold">
              Alliance {currentStep.allianceIndex + 1}
              <span className="text-muted-foreground text-lg ml-2">
                (Seed {currentAlliancePicking?.captain || "?"})
              </span>
            </h2>
            <p className="text-xs text-primary font-semibold">
              Round {currentStep.round} | Step {currentStep.round === 1 ? currentStep.allianceIndex + 1 : 16 - currentStep.allianceIndex} of 16
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-48 bg-muted rounded-lg p-3 text-center font-bold text-lg border">
            {selectedTeam ? `Team ${selectedTeam}` : "Select a team..."}
          </div>
          <Button 
            onClick={handlePick} 
            disabled={!selectedTeam}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="h-4 w-4" /> Pick
          </Button>
          <Button 
            onClick={handleDecline} 
            disabled={!selectedTeam}
            variant="destructive"
            className="gap-2"
          >
            <X className="h-4 w-4" /> Decline
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Alliances Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {alliances.map((alliance, index) => {
              const isActive = index === currentStep.allianceIndex;
              const epaSum = [alliance.captain, alliance.pick1, alliance.pick2]
                .reduce<number>((sum, team) => sum + (team ? (getTeamEpa(team) ?? 0) : 0), 0);

              return (
                <div 
                  key={alliance.number}
                  className={cn(
                    "bg-card border rounded-xl p-4 transition-all duration-300 relative overflow-hidden",
                    isActive ? "border-primary ring-2 ring-primary/20 shadow-lg" : "hover:border-primary/50"
                  )}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 animate-pulse" /> Picking
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Alliance {alliance.number}
                    </h3>
                    <span className="text-sm font-bold bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-full">
                      Proj EPA: {epaSum.toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Captain */}
                    <div className="bg-muted/50 p-2 rounded-lg border text-center">
                      <p className="text-[10px] text-muted-foreground font-semibold">CAPTAIN</p>
                      <p className="font-bold text-lg">{alliance.captain || "—"}</p>
                      <p className="text-xs text-muted-foreground">{alliance.captain ? (getTeamEpa(alliance.captain)?.toFixed(1) || "N/A") : ""}</p>
                    </div>
                    {/* Pick 1 */}
                    <div className={cn(
                      "p-2 rounded-lg border text-center",
                      currentStep.round === 1 && isActive ? "border-primary/50 bg-primary/5 animate-pulse" : "bg-muted/50"
                    )}>
                      <p className="text-[10px] text-muted-foreground font-semibold">1ST PICK</p>
                      <p className="font-bold text-lg">{alliance.pick1 || "—"}</p>
                      <p className="text-xs text-muted-foreground">{alliance.pick1 ? (getTeamEpa(alliance.pick1)?.toFixed(1) || "N/A") : ""}</p>
                    </div>
                    {/* Pick 2 */}
                    <div className={cn(
                      "p-2 rounded-lg border text-center",
                      currentStep.round === 2 && isActive ? "border-primary/50 bg-primary/5 animate-pulse" : "bg-muted/50"
                    )}>
                      <p className="text-[10px] text-muted-foreground font-semibold">2ND PICK</p>
                      <p className="font-bold text-lg">{alliance.pick2 || "—"}</p>
                      <p className="text-xs text-muted-foreground">{alliance.pick2 ? (getTeamEpa(alliance.pick2)?.toFixed(1) || "N/A") : ""}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selectable Teams */}
        <div className="w-full md:w-80 bg-card border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <h3 className="font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Selectable Teams ({selectableTeams.length})
            </h3>
            <p className="text-xs text-muted-foreground">Top 8 captains below you are selectable</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {selectableTeams.map(teamNum => {
              const epa = getTeamEpa(teamNum);
              const isCaptain = alliances.some(a => a.captain === teamNum);
              return (
                <button
                  key={teamNum}
                  onClick={() => setSelectedTeam(teamNum)}
                  className={cn(
                    "w-full flex justify-between items-center p-3 rounded-lg border text-sm font-bold transition-all",
                    selectedTeam === teamNum 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "hover:bg-muted/50 hover:border-muted-foreground/50",
                    isCaptain && "border-amber-500/50 bg-amber-500/5"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {teamNum}
                    {isCaptain && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded-md">
                        Captain
                      </span>
                    )}
                  </span>
                  {epa !== undefined && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500">
                      EPA {epa.toFixed(1)}
                    </span>
                  )}
                </button>
              );
            })}
            {selectableTeams.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-4">
                No teams available
              </div>
            )}
          </div>
          
          {declinedTeams.length > 0 && (
            <div className="p-4 border-t bg-muted/20">
              <h4 className="text-xs font-bold text-muted-foreground mb-2">DECLINED</h4>
              <div className="flex flex-wrap gap-1">
                {declinedTeams.map(team => (
                  <span key={team} className="text-xs font-semibold px-2 py-0.5 bg-red-500/10 text-red-500 rounded-full">
                    {team}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
