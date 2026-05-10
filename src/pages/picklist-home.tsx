import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, List, Trophy, Shield, Crosshair, Asterisk, CirclePile, Tally1, Tally2, Tally3, Tally4, Tally5 } from "lucide-react";
import { Link } from "react-router";

export function PicklistHome() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const currentUser = useQuery(api.users.current);
  
  const myLists = useQuery(api.pickLists.getMyPickLists, { eventId: activeEvent?._id });
  const allLists = useQuery(api.pickLists.getAllPickLists, { eventId: activeEvent?._id });
  const avgPositions = useQuery(api.pickLists.getAveragePositions, { eventId: activeEvent?._id });
  const pitScouting = useQuery(api.pitScouting.getPitScoutingForEvent, activeEvent ? { eventId: activeEvent._id } : "skip");
  
  const createList = useMutation(api.pickLists.createPickList);
  const deleteList = useMutation(api.pickLists.deletePickList);
  
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

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this list?")) return;
    try {
      await deleteList({ pickListId: id });
      toast.success("List deleted");
    } catch {
      toast.error("Failed to delete list");
    }
  };

  const listsToDisplay = currentUser?.role === "Admin" ? allLists : myLists;

  const getPitData = (teamNumber: number) => {
    return pitScouting?.find(p => p.teamNumber === teamNumber);
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Pick Lists</h1>
        <p className="text-muted-foreground">Manage your team rankings and see global averages.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global Picklist / Averages */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Global Average Rankings</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Aggregated ranking based on all team lists.
          </p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {avgPositions?.map((item, index) => {
              const pitData = getPitData(item.teamNumber);
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
                <div key={item.teamNumber} className="p-3 bg-muted/30 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <RobotIcon className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-bold">#{index + 1} Team {item.teamNumber}</span>
                      {pitData && (
                        <p className="text-xs text-muted-foreground">
                          {pitData.drivetrain || "Unknown DT"} | {pitData.climbLevels?.join(", ") || "No Climb"}
                          {(pitData.shooterType === "Turret" || pitData.shooterType === "Misc") && pitData.shootingPaths ? ` | ${pitData.shootingPaths} Path${pitData.shootingPaths > 1 ? 's' : ''}` : ""}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Avg Pos: {item.avgPosition.toFixed(1)} ({item.count} lists)</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Score: {item.avgPosition.toFixed(1)}</span>
                </div>
              );
            })}
            {(!avgPositions || avgPositions.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No data available yet.</p>
            )}
          </div>
        </div>

        {/* My Lists / All Lists */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <List className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">{currentUser?.role === "Admin" ? "All Lists" : "Your Lists"}</h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="New list name" 
              value={newListName} 
              onChange={(e) => setNewListName(e.target.value)} 
            />
            <Button onClick={handleCreate} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {listsToDisplay?.map((list) => (
              <div key={list._id} className="p-3 bg-muted/30 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold">{list.name}</span>
                  <p className="text-xs text-muted-foreground">{list.tiers.reduce((acc, t) => acc + t.teams.length, 0)} teams</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/pick-lists/edit?id=${list._id}`}>Edit</Link>
                  </Button>
                  {(currentUser?.role === "Admin" || list.userId === currentUser?._id) && (
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(list._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(!listsToDisplay || listsToDisplay.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No lists found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
