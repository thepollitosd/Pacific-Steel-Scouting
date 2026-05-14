import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useUIStore } from "../store/use-ui-store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Users, Settings, Trash2, Globe, MapPin, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

export function EventSetup() {
  const importEvent = useAction(api.tba.importEvent);
  const importPits = useAction(api.nexus.importPitLocations);
  const activeEvent = useQuery(api.events.getActiveEvent);
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
    const id = toast.loading("Connecting to The Blue Alliance...");
    try {
      await importEvent({ eventKey: tbaKey });
      toast.success("Event database synchronized", { id });
      setTbaKey("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Handshake failed", { id });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportPits = async () => {
    if (!activeEvent) return;
    setIsImportingPits(true);
    const id = toast.loading("Mapping pit locations from Nexus...");
    try {
      const res = await importPits({ eventKey: activeEvent.key });
      toast.success(`Synced ${res.count} pit coordinates`, { id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Mapping failed", { id });
    } finally {
      setIsImportingPits(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm("CRITICAL: Wipe all scouting and match data? This is irreversible.")) return;
    try {
      await resetAllData();
      toast.success("Database purged");
    } catch (err) {
      toast.error("Purge sequence failed");
    }
  };

  const handleRoleChange = async (userId: any, newRole: string) => {
    try {
      await updateRole({ userId, role: newRole });
      toast.success(`Privileges updated to ${newRole}`);
    } catch (err) {
      toast.error("Privilege update failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2 py-1 bg-muted rounded text-[10px] font-black uppercase tracking-widest text-muted-foreground border">
            <Settings className="h-3 w-3" /> System Configuration
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Event Setup</h1>
          <p className="text-muted-foreground font-medium">Initialize and manage the competition dataset.</p>
        </div>
        
        {activeEvent && (
          <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/20">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-bold text-foreground">Active: {activeEvent.key}</span>
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          {/* Event Import */}
          <Card className="border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">TBA Integration</CardTitle>
                  <CardDescription>Fetch match schedules and team rosters.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <form onSubmit={handleImport} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">TBA Event Key</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. 2025nvlv" 
                      className="h-12 bg-muted/20 border-2 focus-visible:ring-primary"
                      value={tbaKey} 
                      onChange={(e) => setTbaKey(e.target.value)} 
                      disabled={isImporting}
                    />
                    <Button type="submit" size="lg" className="h-12 font-bold px-8 shadow-lg shadow-primary/20" disabled={isImporting}>
                      {isImporting ? "Syncing..." : "Sync"}
                    </Button>
                  </div>
                </div>
              </form>

              {activeEvent && (
                <div className="p-4 rounded-xl bg-muted/10 border space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Synchronized Event</p>
                      <h4 className="text-xl font-black text-foreground">{activeEvent.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {activeEvent.city}, {activeEvent.state}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Button onClick={handleImportPits} disabled={isImportingPits} variant="outline" className="h-10 font-bold border-2">
                      <Database className="mr-2 h-4 w-4" />
                      {isImportingPits ? "Mapping..." : "Map Nexus Pits"}
                    </Button>
                    <Button onClick={handleResetData} variant="ghost" className="h-10 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Purge All Data
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <div className="space-y-8">
          <Card className="border-2 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-muted/30 border-b">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Access Control</CardTitle>
                  <CardDescription>Manage user privileges and roles.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 overflow-y-auto max-h-[500px] space-y-4">
              {users?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No users detected in the cloud.</p>
                </div>
              )}
              {users?.map((user) => (
                <motion.div 
                  key={user._id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border-2 rounded-2xl flex items-center justify-between gap-4 bg-muted/5 group hover:border-primary/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-foreground truncate">{user.name || "Anonymous"}</div>
                    <div className="text-[10px] font-medium text-muted-foreground truncate">{user.email}</div>
                  </div>
                  <Select value={user.role || "Scout"} onValueChange={(val) => handleRoleChange(user._id, val)}>
                    <SelectTrigger className="w-32 h-10 font-bold rounded-xl border-2">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin" className="font-bold text-destructive">Admin</SelectItem>
                      <SelectItem value="Strategist" className="font-bold text-primary">Strategist</SelectItem>
                      <SelectItem value="Scout" className="font-bold">Scout</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
