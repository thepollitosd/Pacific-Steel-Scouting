import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Clock, AlertTriangle, Trophy } from "lucide-react";

export function PitDisplay() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const requests = useQuery(api.driveTeamHub.getRequests, { eventId: activeEvent?._id });
  const teams = useQuery(api.teams.getByEvent, { eventId: activeEvent?._id });

  // Mock countdown for display
  const [timeLeft, setTimeLeft] = useState("12:45");
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const minutes = 15 - (now.getMinutes() % 15);
      const seconds = 59 - now.getSeconds();
      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingRequests = requests?.filter(r => r.status === "pending") || [];

  return (
    <div className="fixed inset-0 bg-background text-foreground p-8 flex flex-col space-y-8 z-50">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Logo" className="h-16 w-16" />
          <div>
            <h1 className="text-5xl font-black tracking-tight">TEAM 5025</h1>
            <p className="text-xl text-muted-foreground uppercase tracking-wider">{activeEvent?.name || "No Active Event"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-muted px-6 py-3 rounded-2xl border">
          <Clock className="w-10 h-10 text-primary" />
          <div>
            <p className="text-sm uppercase font-medium text-muted-foreground">Next Match In</p>
            <p className="text-4xl font-black font-mono">{timeLeft}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Column 1: Active Requests */}
        <div className="col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              Active Requests
            </h2>
            <span className="text-xl font-bold bg-amber-500/10 text-amber-500 px-4 py-1 rounded-full">
              {pendingRequests.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {pendingRequests.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-2xl text-2xl">
                No active requests. All systems nominal.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req._id} className="p-6 bg-card border rounded-2xl shadow-sm flex flex-col space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">Team {req.targetTeamNumber}</span>
                    <span className={`text-sm uppercase font-bold px-3 py-1 rounded-full ${
                      req.priority === "critical" ? "bg-red-500 text-white" :
                      req.priority === "high" ? "bg-orange-500 text-white" :
                      "bg-blue-500 text-white"
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-xl">{req.note}</p>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Type: {req.type.toUpperCase()}</span>
                    <span>{new Date(req.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Rankings or Teams */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Rankings
          </h2>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {teams?.slice(0, 10).map((team, index) => (
              <div key={team._id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                  <div>
                    <p className="text-xl font-bold">{team.number}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[150px]">{team.name}</p>
                  </div>
                </div>
                <span className="text-xl font-mono font-bold">--</span>
              </div>
            ))}
            {(!teams || teams.length === 0) && (
              <div className="h-full flex items-center justify-center text-muted-foreground border border-dashed rounded-2xl text-xl">
                No ranking data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-muted-foreground text-sm border-t pt-2">
        Pit Display Mode • Auto-updates in real-time
      </div>
    </div>
  );
}

export default PitDisplay;
