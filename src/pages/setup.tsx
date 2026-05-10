import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUIStore } from "../store/use-ui-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function EventSetup() {
  const importEvent = useAction(api.tba.importEvent);
  const importPits = useAction(api.nexus.importPitLocations);
  const activeEvent = useQuery(api.events.getActiveEvent);
  const setCurrentEventId = useUIStore((state) => state.setCurrentEventId);
  const currentUser = useQuery(api.users.current);
  const users = useQuery(api.users.getUsers, currentUser?.role === "Admin" ? {} : "skip");
  const updateRole = useMutation(api.users.updateRole);
  const resetAllData = useMutation(api.events.resetAllData);

  const [tbaKey, setTbaKey] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isImportingPits, setIsImportingPits] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tbaKey) return toast.error("Event key is required");

    setIsImporting(true);
    toast.info("Importing event from TBA...");
    try {
      await importEvent({ eventKey: tbaKey });
      toast.success("Event imported successfully");
      setTbaKey("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportPits = async () => {
    if (!activeEvent) return;
    setIsImportingPits(true);
    toast.info("Importing pit locations from Nexus...");
    try {
      const res = await importPits({ eventKey: activeEvent.key });
      toast.success(`Imported ${res.count} pit locations`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import pit locations");
    } finally {
      setIsImportingPits(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm("Are you sure you want to reset all data? This cannot be undone!")) return;
    try {
      await resetAllData();
      toast.success("All data has been reset!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset data");
    }
  };

  const handleRoleChange = async (userId: any, newRole: string) => {
    try {
      await updateRole({ userId, role: newRole });
      toast.success("Role updated");
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Event Setup</h1>
        <p className="text-muted-foreground">Import your TBA event key to initialize the database.</p>
      </div>

      {activeEvent && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Active Event</span>
            <span className="text-xl font-bold">{activeEvent.name}</span>
            <span className="text-sm text-foreground/80">{activeEvent.city}, {activeEvent.state}</span>
          </div>
          {currentUser?.role === "Admin" && (
            <div className="flex flex-col gap-2 mt-2">
              <Button onClick={handleImportPits} disabled={isImportingPits} variant="outline" className="w-full">
                {isImportingPits ? "Importing Pits..." : "Import Pit Locations from Nexus"}
              </Button>
              <Button onClick={handleResetData} variant="destructive" className="w-full">
                Reset All Data
              </Button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleImport} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">TBA Event Key</label>
          <Input 
            placeholder="e.g. 2025nvlv" 
            value={tbaKey} 
            onChange={(e) => setTbaKey(e.target.value)} 
            disabled={isImporting}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isImporting}>
          {isImporting ? "Importing..." : "Import Event Configuration"}
        </Button>
      </form>

      {currentUser?.role === "Admin" && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">Customize user roles.</p>
          </div>
          
          <div className="space-y-2">
            {users?.map((user) => (
              <div key={user._id} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium">{user.name || "Anonymous"}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                <Select value={user.role || "Scout"} onValueChange={(val) => handleRoleChange(user._id, val)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Strategist">Strategist</SelectItem>
                    <SelectItem value="Scout">Scout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
