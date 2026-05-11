import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Clock, CheckCircle, Trash2, Maximize2, Minimize2 } from "lucide-react";

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
  const [hudMode, setHudMode] = useState(false);

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

  if (hudMode) {
    return (
      <div className="fixed inset-0 bg-black text-white z-50 p-6 flex flex-col space-y-6 overflow-auto">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-4xl font-black uppercase text-red-500">DRIVE TEAM HUD</h1>
            <p className="text-neutral-400 text-lg mt-1">High-Contrast Live Operations</p>
          </div>
          <Button variant="outline" size="lg" onClick={() => setHudMode(false)} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-lg font-bold">
            <Minimize2 className="mr-2 h-6 w-6" /> EXIT HUD
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Active Tasks / Pending Requests */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-amber-500">
              <Clock className="w-6 h-6" /> ACTIVE REQUESTS ({pendingRequests.length})
            </h2>
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
              {pendingRequests.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-neutral-800 rounded-xl">
                  <p className="text-neutral-500 text-xl">No active requests.</p>
                </div>
              )}
              {pendingRequests.map((req) => (
                <div key={req._id} className={`p-6 rounded-xl border-2 ${req.priority === "critical" ? "border-red-600 bg-red-950/20" : "border-neutral-800 bg-neutral-900"} space-y-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-4xl text-white">TEAM {req.targetTeamNumber}</span>
                      <p className="text-xl text-neutral-400 uppercase mt-1">{req.type} • {req.priority} PRIORITY</p>
                    </div>
                    <span className={`text-sm font-bold uppercase px-3 py-1 rounded-full ${
                      req.priority === "critical" ? "bg-red-600 text-white" : "bg-amber-500 text-black"
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  {req.note && <p className="text-2xl text-neutral-200 border-l-4 border-red-500 pl-4 py-2 bg-neutral-800/50 rounded-r-md">{req.note}</p>}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button size="lg" variant="secondary" onClick={() => handleRespond(req._id, "On the way")} className="text-lg font-bold bg-neutral-700 text-white hover:bg-neutral-600">On the way</Button>
                    <Button size="lg" variant="secondary" onClick={() => handleRespond(req._id, "Ready")} className="text-lg font-bold bg-green-600 text-white hover:bg-green-700">Ready</Button>
                    <Button size="lg" variant="secondary" onClick={() => handleRespond(req._id, "Broken")} className="text-lg font-bold bg-red-600 text-white hover:bg-red-700">Broken</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Request Form */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">QUICK REQUEST</h2>
            <form onSubmit={handleCreateRequest} className="space-y-4 bg-neutral-900 p-6 rounded-xl border-2 border-neutral-800">
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase text-neutral-400">Team Number</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 5025" 
                  value={targetTeam} 
                  onChange={(e) => setTargetTeam(e.target.value)} 
                  required 
                  className="bg-neutral-800 border-neutral-700 text-white text-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium uppercase text-neutral-400">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white text-lg h-12"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="location">Find Robot</SelectItem>
                    <SelectItem value="repair">Repair Status</SelectItem>
                    <SelectItem value="strategy">Strategy Sync</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium uppercase text-neutral-400">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white text-lg h-12"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium uppercase text-neutral-400">Note</label>
                <Input 
                  placeholder="e.g. Broken intake" 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  className="bg-neutral-800 border-neutral-700 text-white text-lg h-12"
                />
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-black h-14 uppercase">
                <Send className="mr-2 h-6 w-6" /> Send
              </Button>
            </form>

            <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
              <h3 className="font-bold text-lg mb-2 text-green-500">RECENTLY COMPLETED</h3>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                {completedRequests.slice(0, 3).map((req) => (
                  <div key={req._id} className="text-sm border-b border-neutral-800 pb-2">
                    <span className="font-bold">Team {req.targetTeamNumber}</span>: <span className="text-neutral-400">{req.response}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drive Team Hub</h1>
          <p className="text-muted-foreground">Live operations, match tracking, and pit crew coordination.</p>
        </div>
        <Button onClick={() => setHudMode(true)} variant="outline">
          <Maximize2 className="mr-2 h-4 w-4" /> HUD Mode
        </Button>
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

export default DriveTeamHub;
