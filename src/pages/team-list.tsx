import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function TeamList() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  const teams = useQuery(api.teams.getByEvent, { eventId: activeEvent?._id });
  const [search, setSearch] = useState("");

  if (teams === undefined) return <div>Loading teams...</div>;
  if (!activeEvent) return <div>Please setup an event first.</div>;

  const filtered = teams.filter(t => 
    t.number.toString().includes(search) || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Teams ({filtered.length})</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-8 bg-background" 
            placeholder="Search teams..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(team => (
          <div key={team._id} className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <span className="text-2xl font-black">{team.number}</span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted">Unscouted</span>
            </div>
            <h3 className="font-semibold truncate">{team.name}</h3>
            <p className="text-xs text-muted-foreground truncate mt-1">{team.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
