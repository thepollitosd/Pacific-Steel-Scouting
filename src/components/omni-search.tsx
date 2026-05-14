import * as React from "react";
import { useNavigate } from "react-router";
import { useTheme } from "next-themes";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Zap,
  Target,
  Users,
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Command as CommandIcon,
  MessageSquare,
  Sparkles,
  Moon,
  Sun,
  Plus,
  BarChart3,
  Map as MapIcon,
  History,
  Download,
  HelpCircle
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function OmniSearch() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const teams = useQuery(api.teams.list) || [];
  const [modKey, setModKey] = React.useState("⌘");

  React.useEffect(() => {
    setModKey(navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl+');
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      // Toggle search with Cmd+K or Ctrl+K
      if (e.key === "k" && isMod) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      // Handle other global shortcuts if search is NOT open
      if (!open && isMod) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            navigate("/scouting");
            break;
          case 'p':
            e.preventDefault();
            navigate("/map");
            break;
          case 'd':
            e.preventDefault();
            navigate("/dashboard");
            break;
          case 't':
            e.preventDefault();
            navigate("/teams");
            break;
          case '/':
            e.preventDefault();
            navigate("/help");
            break;
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, navigate]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline-flex">Search systems...</span>
        <span className="lg:hidden">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
          <span className="text-xs">{modKey.replace('+', '')}</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search teams..." />
        <CommandList className="max-h-[450px]">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="System Commands">
            <CommandItem onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>Toggle Interface Theme</span>
              <CommandShortcut>{modKey}⇧T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/help"))}>
              <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
              <span>Show Help & Shortcuts</span>
              <CommandShortcut>{modKey}/</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Scouting Tools">
            <CommandItem onSelect={() => runCommand(() => navigate("/scouting"))}>
              <Zap className="mr-2 h-4 w-4 text-amber-500" />
              <span>Match Scouting Terminal</span>
              <CommandShortcut>{modKey}S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/map"))}>
              <MapIcon className="mr-2 h-4 w-4 text-emerald-500" />
              <span>Pit Map (Nexus)</span>
              <CommandShortcut>{modKey}P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/schedule"))}>
              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
              <span>Match Schedule</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Analytics">
            <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
              <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Global Dashboard</span>
              <CommandShortcut>{modKey}D</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/teams"))}>
              <Users className="mr-2 h-4 w-4 text-rose-500" />
              <span>Team Intelligence</span>
              <CommandShortcut>{modKey}T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/match-history"))}>
              <History className="mr-2 h-4 w-4 text-slate-500" />
              <span>Match History</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Teams">
            {teams.map((team: any) => (
              <CommandItem
                key={team.number}
                onSelect={() => runCommand(() => navigate(`/teams/${team.number}`))}
              >
                <div className="flex min-w-[2.5rem] px-2 h-6 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary mr-3">
                  {team.number}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{team.name}</span>
                  <span className="text-[10px] text-muted-foreground">{team.location}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="System">
            <CommandItem onSelect={() => runCommand(() => navigate("/customization"))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>App Settings</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/export"))}>
              <Download className="mr-2 h-4 w-4" />
              <span>Export Raw Data</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/help"))}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Documentation & Support</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/setup"))}>
              <Settings className="mr-2 h-4 w-4 text-destructive" />
              <span>Event Setup (Admin)</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <div className="flex items-center justify-between p-3 border-t bg-muted/50 text-[10px] text-muted-foreground">
          <div className="flex gap-4">
            <span><kbd className="px-1 border rounded bg-background">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 border rounded bg-background">↵</kbd> Select</span>
          </div>
          <span className="font-medium tracking-tight">PACIFIC STEEL v4.0</span>
        </div>
      </CommandDialog>
    </>
  );
}
