import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const requests = useQuery(api.driveTeamHub.getRequests, { eventId: activeEvent?._id });
  const teams = useQuery(api.teams.getByEvent, { eventId: activeEvent?._id });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        {activeEvent && (
          <span className="text-sm font-medium text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {activeEvent.name}
          </span>
        )}
      </div>

      {!activeEvent ? (
        <div className="p-8 text-center rounded-xl border border-dashed text-muted-foreground">
          No active event found. Go to Event Setup to import an event.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Teams</h3>
            <p className="text-4xl font-black">{teams?.length ?? "..."}</p>
          </div>
          
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Active Requests</h3>
            <p className="text-4xl font-black text-amber-500">
              {requests?.filter(r => r.status === "pending").length ?? "..."}
            </p>
          </div>
          
          <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Matches Scouted</h3>
            <p className="text-4xl font-black text-green-500">0</p>
          </div>
        </div>
      )}

      {/* Upcoming operations or quick links could go here */}
    </div>
  );
}
