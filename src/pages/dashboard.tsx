import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const requests = useQuery(api.driveTeamHub.getRequests, { eventId: activeEvent?._id });
  const teams = useQuery(api.teams.getByEvent, { eventId: activeEvent?._id });
  const user = useQuery(api.users.current);
  const userRole = user?.role || "Scout";
  const leaderboard = useQuery(api.users.getLeaderboard);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border">
            Role: {userRole}
          </span>
          {activeEvent && (
            <span className="text-sm font-medium text-primary uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {activeEvent.name}
            </span>
          )}
        </div>
      </div>

      {!activeEvent ? (
        <div className="p-8 text-center rounded-xl border border-dashed text-muted-foreground">
          No active event found. Go to Event Setup to import an event.
        </div>
            ) : (
        <>
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
              <p className="text-4xl font-black text-green-500">
                {leaderboard?.find(u => u._id === user?._id)?.matchesScouted ?? 0}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Scouter Leaderboard</h2>
              <p className="text-sm text-muted-foreground">Top scouters based on activity.</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {leaderboard?.slice(0, 5).map((u, index) => (
                  <div key={u._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.matchesScouted} matches • {u.pitsScouted} pits</p>
                      </div>
                    </div>
                    <span className="font-black text-primary">{u.points} pts</span>
                  </div>
                ))}
                {(!leaderboard || leaderboard.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center">No activity yet.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}


      {/* Upcoming operations or quick links could go here */}
    </div>
  );
}
