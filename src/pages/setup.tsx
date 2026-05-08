import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUIStore } from "../store/use-ui-store";

export function EventSetup() {
  const importEvent = useAction(api.tba.importEvent);
  const activeEvent = useQuery(api.events.getActiveEvent);
  const setCurrentEventId = useUIStore((state) => state.setCurrentEventId);

  const [tbaKey, setTbaKey] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tbaKey || !apiKey) return toast.error("Both keys are required");

    setIsImporting(true);
    toast.info("Importing event from TBA...");
    try {
      await importEvent({ eventKey: tbaKey, apiKey });
      toast.success("Event imported successfully");
      setTbaKey("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Event Setup</h1>
        <p className="text-muted-foreground">Import your TBA event key to initialize the database.</p>
      </div>

      {activeEvent && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col gap-1">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Active Event</span>
          <span className="text-xl font-bold">{activeEvent.name}</span>
          <span className="text-sm text-foreground/80">{activeEvent.location}</span>
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
        <div className="space-y-2">
          <label className="text-sm font-medium">TBA Read API Key</label>
          <Input 
            placeholder="Enter your TBA API key" 
            type="password"
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            disabled={isImporting}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isImporting}>
          {isImporting ? "Importing..." : "Import Event Configuration"}
        </Button>
      </form>
    </div>
  );
}
