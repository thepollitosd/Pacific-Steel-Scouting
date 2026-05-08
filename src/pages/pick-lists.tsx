import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableTeam({ id, number }: { id: string, number: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 bg-background border rounded-lg shadow-sm font-bold text-center touch-none">
      {number}
    </div>
  );
}

export function PickLists() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const pickLists = useQuery(api.pickLists.getMyPickLists, { eventId: activeEvent?._id });
  const createList = useMutation(api.pickLists.createPickList);
  const updateTiers = useMutation(api.pickLists.updatePickListTiers);
  
  const [newListName, setNewListName] = useState("");

  const handleCreate = async () => {
    if (!activeEvent || !newListName) return;
    try {
      await createList({ eventId: activeEvent._id, name: newListName });
      setNewListName("");
      toast.success("List created");
    } catch {
      toast.error("Failed to create list");
    }
  };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // A full robust implementation would handle cross-container drag and drop
  // For this scaffold, we present the structural concept with sortable.

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pick Lists</h1>
          <p className="text-muted-foreground">Drag and drop teams to rank them.</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="New list name" value={newListName} onChange={(e) => setNewListName(e.target.value)} className="w-48" />
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </div>

      {!pickLists || pickLists.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border-dashed rounded-xl border-2 text-muted-foreground">
          Create a pick list to get started.
        </div>
      ) : (
        <div className="flex-1 flex overflow-x-auto gap-4 pb-4">
          {pickLists[0]?.tiers.map((tier: any) => (
            <div key={tier.name} className="flex flex-col w-72 shrink-0 bg-muted/20 rounded-xl p-4 border h-full overflow-hidden">
              <h3 className="font-semibold mb-4">{tier.name} <span className="text-muted-foreground text-sm font-normal">({tier.teams.length})</span></h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {tier.teams.slice(0, 50).map((teamNum: number) => (
                  <div key={teamNum} className="p-3 bg-background border rounded-lg shadow-sm font-bold touch-none flex justify-between items-center">
                    <span>{teamNum}</span>
                    <span className="text-xs text-muted-foreground">Drag</span>
                  </div>
                ))}
                {tier.teams.length > 50 && (
                  <p className="text-xs text-center text-muted-foreground pt-4">...and {tier.teams.length - 50} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
