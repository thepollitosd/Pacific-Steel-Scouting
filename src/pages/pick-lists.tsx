import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams } from "react-router";
import { Shield, Crosshair, Asterisk, CirclePile, Tally1, Tally2, Tally3, Tally4, Tally5 } from "lucide-react";
import { useStatboticsEvent } from "../hooks/use-statbotics";

function SortableTeam({ id, number, pitData, epa }: { id: number, number: number, pitData?: any, epa?: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  const shooterType = pitData?.shooterType;
  let RobotIcon = Shield;
  if (shooterType === "Turret") RobotIcon = Crosshair;
  else if (shooterType === "Dumper") RobotIcon = CirclePile;
  else if (shooterType === "Misc") {
    const paths = pitData?.shootingPaths;
    if (paths === 1) RobotIcon = Tally1;
    else if (paths === 2) RobotIcon = Tally2;
    else if (paths === 3) RobotIcon = Tally3;
    else if (paths === 4) RobotIcon = Tally4;
    else if (paths === 5) RobotIcon = Tally5;
    else RobotIcon = Asterisk;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 bg-background border rounded-lg shadow-sm font-bold flex justify-between items-center touch-none hover:bg-muted/50 cursor-grab">
      <div className="flex items-center gap-3">
        <RobotIcon className="h-5 w-5 text-primary" />
        <div>
          <div className="flex items-center gap-2">
            <span>{number}</span>
            {epa !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-500">
                EPA {epa.toFixed(1)}
              </span>
            )}
          </div>
          {pitData && (
            <p className="text-xs text-muted-foreground font-normal">
              {pitData.drivetrain || "Unknown DT"} | {pitData.climbLevels?.join(", ") || "No Climb"}
              {(pitData.shooterType === "Turret" || pitData.shooterType === "Misc") && pitData.shootingPaths ? ` | ${pitData.shootingPaths} Path${pitData.shootingPaths > 1 ? 's' : ''}` : ""}
            </p>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">::</span>
    </div>
  );
}

function DroppableTier({ id, children, name, count }: { id: string, children: React.ReactNode, name: string, count: number }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex flex-col w-72 shrink-0 bg-muted/20 rounded-xl p-4 border h-full overflow-hidden">
      <h3 className="font-semibold mb-4">{name} <span className="text-muted-foreground text-sm font-normal">({count})</span></h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {children}
      </div>
    </div>
  );
}

export function PickLists() {
  const [searchParams] = useSearchParams();
  const listIdFromUrl = searchParams.get("id");

  const activeEvent = useQuery(api.events.getActiveEvent);
  const pickLists = useQuery(api.pickLists.getMyPickLists, { eventId: activeEvent?._id });
  const pitScouting = useQuery(api.pitScouting.getPitScoutingForEvent, activeEvent ? { eventId: activeEvent._id } : "skip");
  const { data: statboticsData } = useStatboticsEvent(activeEvent?.key);
  const createList = useMutation(api.pickLists.createPickList);
  const updateTiers = useMutation(api.pickLists.updatePickListTiers);
  
  const [newListName, setNewListName] = useState("");
  const [tiers, setTiers] = useState<any[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  useEffect(() => {
    if (pickLists && pickLists.length > 0) {
      const targetId = listIdFromUrl || activeListId;
      const activeList = pickLists.find(l => l._id === targetId) || pickLists[0];
      
      setActiveListId(activeList._id);
      setTiers(activeList.tiers);
    } else {
      setTiers([]);
      setActiveListId(null);
    }
  }, [pickLists, activeListId, listIdFromUrl]);

  const handleCreate = async () => {
    if (!activeEvent || !newListName) return;
    try {
      const id = await createList({ eventId: activeEvent._id, name: newListName });
      setNewListName("");
      setActiveListId(id as any); // Switch to the new list!
      toast.success("List created");
    } catch {
      toast.error("Failed to create list");
    }
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || !activeListId) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTierIndex = tiers.findIndex(t => t.teams.includes(activeId));
    const overTierIndex = tiers.findIndex(t => t.teams.includes(overId));

    if (activeTierIndex === -1) return;

    const newTiers = JSON.parse(JSON.stringify(tiers)); // Deep copy

    if (overTierIndex === -1) {
      // Check if dropped over a container directly
      const containerIndex = tiers.findIndex(t => t.name === overId);
      if (containerIndex !== -1 && containerIndex !== activeTierIndex) {
        // Move to empty container or end of container
        const activeTeams = newTiers[activeTierIndex].teams;
        const activeIndex = activeTeams.indexOf(activeId);
        activeTeams.splice(activeIndex, 1);
        newTiers[containerIndex].teams.push(activeId);
        
        setTiers(newTiers);
        updateTiers({ pickListId: activeListId as any, tiers: newTiers });
      }
      return;
    }

    if (activeTierIndex === overTierIndex) {
      const teams = newTiers[activeTierIndex].teams;
      const oldIndex = teams.indexOf(activeId);
      const newIndex = teams.indexOf(overId);
      newTiers[activeTierIndex].teams = arrayMove(teams, oldIndex, newIndex);
    } else {
      const activeTeams = newTiers[activeTierIndex].teams;
      const overTeams = newTiers[overTierIndex].teams;
      
      const activeIndex = activeTeams.indexOf(activeId);
      activeTeams.splice(activeIndex, 1);
      
      const overIndex = overTeams.indexOf(overId);
      overTeams.splice(overIndex, 0, activeId);
    }

    setTiers(newTiers);
    updateTiers({ pickListId: activeListId as any, tiers: newTiers });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pick Lists</h1>
          <p className="text-muted-foreground">Drag and drop teams to rank them.</p>
        </div>
        <div className="flex gap-2 items-center">
          {pickLists && pickLists.length > 0 && (
            <Select value={activeListId || ""} onValueChange={setActiveListId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select list" />
              </SelectTrigger>
              <SelectContent>
                {pickLists.map((list) => (
                  <SelectItem key={list._id} value={list._id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input placeholder="New list name" value={newListName} onChange={(e) => setNewListName(e.target.value)} className="w-48" />
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </div>

      {!pickLists || pickLists.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border-dashed rounded-xl border-2 text-muted-foreground">
          Create a pick list to get started.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex-1 flex overflow-x-auto gap-4 pb-4">
            {tiers.map((tier: any) => {
              const displayTeams = tier.name === "Uncategorized" && statboticsData 
                ? [...tier.teams].sort((a, b) => {
                    const epaA = statboticsData.find(s => s.team === a)?.epa?.total_points?.mean ?? -1;
                    const epaB = statboticsData.find(s => s.team === b)?.epa?.total_points?.mean ?? -1;
                    return epaB - epaA;
                  })
                : tier.teams;

              return (
                <DroppableTier key={tier.name} id={tier.name} name={tier.name} count={tier.teams.length}>
                  <SortableContext items={displayTeams} strategy={verticalListSortingStrategy}>
                    {displayTeams.map((teamNum: number) => {
                      const pitData = pitScouting?.find(p => p.teamNumber === teamNum);
                      const epa = statboticsData?.find(s => s.team === teamNum)?.epa?.total_points?.mean;
                      return (
                        <SortableTeam key={teamNum} id={teamNum} number={teamNum} pitData={pitData} epa={epa} />
                      );
                    })}
                  </SortableContext>
                </DroppableTier>
              );
            })}
          </div>
        </DndContext>
      )}
    </div>
  );
}
