import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Clock, CheckCircle, Trash2 } from "lucide-react";

export function DriveTeamHub() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const requests = useQuery(api.driveTeamHub.getRequests, { eventId: activeEvent?._id });
  const createRequest = useMutation(api.driveTeamHub.createRequest);
  const respondToRequest = useMutation(api.driveTeamHub.respondToRequest);
  const deleteRequest = useMutation(api.driveTeamHub.deleteRequest);

  const [targetTeam, setTargetTeam] = useState("");
  const [type, setType] = useState("location");
  const [priority, setPriority] = useState("medium");
  const [note, setNote] = useState("");

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !targetTeam) return;
    try {
      await createRequest({
        eventId: activeEvent._id,
        targetTeamNumber: parseInt(targetTeam),
        type,
        priority,
        note,
      });
      toast.success("Request sent to pit scouts");
      setTargetTeam("");
      setNote("");
    } catch (err) {
      toast.error("Failed to send request");
    }
  };

  const handleRespond = async (id: any, resp: string) => {
    try {
      await respondToRequest({ requestId: id, response: resp });
      toast.success("Response sent");
    } catch {
      toast.error("Failed to respond");
    }
  };

  const handleDeleteRequest = async (id: any) => {
    try {
      await deleteRequest({ requestId: id });
      toast.success("Request deleted");
    } catch {
      toast.error("Failed to delete request");
    }
  };

  const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
  const completedRequests = requests?.filter((r) => r.status === "completed") || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Drive Team Hub</h1>
        <p className="text-muted-foreground">Live operations, match tracking, and pit crew coordination.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Request Form */}
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">New Pit Request</h2>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Team</label>
              <Input type="number" placeholder="5025" value={targetTeam} onChange={(e) => setTargetTeam(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location">Find Robot</SelectItem>
                    <SelectItem value="repair">Repair Status</SelectItem>
                    <SelectItem value="strategy">Strategy Sync</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note (Optional)</label>
              <Input placeholder="e.g. Can they still climb?" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <Button type="submit" className="w-full">
              <Send className="mr-2 h-4 w-4" /> Send Request
            </Button>
          </form>
        </div>

        {/* Right Col: Active Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Pending Requests
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {pendingRequests.length === 0 && (
              <p className="text-muted-foreground text-sm">No pending requests.</p>
            )}
            {pendingRequests.map((req) => (
              <div key={req._id} className="p-4 rounded-xl border bg-muted/20 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-lg">Team {req.targetTeamNumber}</span>
                    <p className="text-sm text-muted-foreground capitalize">{req.type} • {req.priority} Priority</p>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full border border-amber-500/20">
                    Pending
                  </span>
                </div>
                {req.note && <p className="text-sm border-l-2 border-primary/50 pl-2 py-1">{req.note}</p>}

                {/* Simulated Quick Responses for Pit Scouts */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  <Button size="sm" variant="secondary" onClick={() => handleRespond(req._id, "On the way")} className="text-xs">On the way</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleRespond(req._id, "Ready")} className="text-xs">Ready</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleRespond(req._id, "Broken")} className="text-xs">Broken</Button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-semibold flex items-center gap-2 pt-4">
            <CheckCircle className="w-5 h-5 text-green-500" /> Completed
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {completedRequests.map((req) => (
              <div key={req._id} className="p-3 rounded-xl border bg-muted/5 opacity-75 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-sm">Team {req.targetTeamNumber}</span>
                  <p className="text-xs text-green-500 mt-1">{req.response}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteRequest(req._id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
