/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation } from "react-router";
import { ThemeProvider } from "next-themes";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { useTheme } from "next-themes";
import { useAuthActions } from "@convex-dev/auth/react";
import { Toaster } from "@/components/ui/sonner";
import { convex } from "./lib/convex";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUIStore } from "./store/use-ui-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  Map as MapIcon,
  ClipboardList,
  ListOrdered,
  Zap,
  Settings,
  Users,
  Paintbrush,
  Moon,
  Sun,
  LogOut,
  Wifi,
  WifiOff,
  HelpCircle,
  ShieldCheck,
  FileText,
  Target,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SignIn } from "./components/auth/SignIn";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

import { EventSetup } from "./pages/setup";
import { TeamList } from "./pages/team-list";
import { TeamDetail } from "./pages/team-detail";
import { PitMap } from "./pages/pit-map";
import { Dashboard } from "./pages/dashboard";
import { MatchScouting } from "./pages/match-scouting";
import { PitScouting } from "./pages/pit-scouting";
import { PickLists } from "./pages/pick-lists";
import { PicklistHome } from "./pages/picklist-home";
import { DriveTeamHub } from "./pages/drive-team-hub";
import { Customization } from "./pages/customization";
import { NotFound } from "./pages/not-found";
import { HelpSupport } from "./pages/help";
import { PrivacyPolicy } from "./pages/privacy";
import { TermsOfService } from "./pages/terms";
import { MatchStrategy } from "./pages/match-strategy";
import { DataExport } from "./pages/data-export";

function NavItem({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <button
      onClick={() => navigate(href)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function MobileNavItem({ icon: Icon, label, href }: { icon: any, label: string, href: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <button
      onClick={() => navigate(href)}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors w-full h-full",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

function TopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuthActions();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/scouting")) return "Match Scouting";
    if (pathname.startsWith("/pit")) return "Pit Scouting";
    if (pathname.startsWith("/map")) return "Pit Map";
    if (pathname.startsWith("/teams/")) return `Team ${pathname.split("/")[2]}`;
    if (pathname.startsWith("/teams")) return "Team List";
    if (pathname.startsWith("/pick-lists")) return "Pick Lists";
    if (pathname.startsWith("/hub")) return "Drive Team Hub";
    if (pathname.startsWith("/setup")) return "Event Setup";
    if (pathname.startsWith("/customization")) return "Customization";
    if (pathname.startsWith("/help")) return "Help & Support";
    if (pathname.startsWith("/privacy")) return "Privacy Policy";
    if (pathname.startsWith("/terms")) return "Terms of Service";
    return "Overview";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/teams/${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b px-4 bg-background/95 backdrop-blur-sm z-10 gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {getPageTitle(location.pathname)}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <form onSubmit={handleSearch} className="hidden sm:block relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Go to team..."
            className="w-40 md:w-64 pl-9 h-9 bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-1 shrink-0">
          <TooltipProvider>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-destructive" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}

function RootLayout() {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const defaultLandingPage = useUIStore((state) => state.defaultLandingPage);
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.current);
  const userRole = user?.role || "Scout";
  const isAdmin = userRole === "Admin";
  const isStrategist = userRole === "Strategist";
  const navigate = useNavigate();
  const location = useLocation();

  console.log("RootLayout auth state:", { isAuthenticated, isLoading });

  useEffect(() => {
    if (location.pathname === "/" && defaultLandingPage !== "/") {
      navigate(defaultLandingPage);
    }
  }, []);

  if (isLoading) return null;
  if (!isAuthenticated) return <SignIn />;

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <aside className={cn(
        "hidden border-r bg-muted/20 md:flex md:flex-col shrink-0 transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="flex h-14 items-center border-b px-4 font-bold tracking-tight">
          <Zap className="h-5 w-5 text-primary mr-2 shrink-0" />
          {isSidebarOpen && <span className="truncate">Pacific Scout 2026</span>}
        </div>
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Dashboard" href="/" />
          <NavItem icon={Search} label="Match Scouting" href="/scouting" />
          <NavItem icon={Users} label="Pit Scouting" href="/pit" />
          <NavItem icon={MapIcon} label="Pit Map" href="/map" />
          <NavItem icon={ClipboardList} label="Team List" href="/teams" />
          <NavItem icon={ListOrdered} label="Pick Lists" href="/pick-lists" />
          <NavItem icon={Zap} label="Drive Team Hub" href="/hub" />
          <NavItem icon={Target} label="Match Strategy" href="/strategy" />
          <NavItem icon={Download} label="Data Export" href="/export" />
          <NavItem icon={Paintbrush} label="Customization" href="/customization" />
        </nav>
        <div className="border-t p-2 space-y-1">
          <NavItem icon={HelpCircle} label="Help & Support" href="/help" />
          <NavItem icon={ShieldCheck} label="Privacy Policy" href="/privacy" />
          <NavItem icon={FileText} label="Terms of Service" href="/terms" />
          {isAdmin && <NavItem icon={Settings} label="Event Setup" href="/setup" />}
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/5 flex flex-col overscroll-none">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <nav className="flex md:hidden border-t bg-background/95 backdrop-blur-sm h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] items-center justify-around shrink-0 touch-none">
        <MobileNavItem icon={LayoutDashboard} label="Dash" href="/" />
        
        {isAdmin ? (
          <>
            <MobileNavItem icon={Zap} label="Hub" href="/hub" />
            <MobileNavItem icon={Settings} label="Setup" href="/setup" />
            <MobileNavItem icon={Paintbrush} label="Colors" href="/customization" />
          </>
        ) : isStrategist ? (
          <>
            <MobileNavItem icon={Target} label="Strategy" href="/strategy" />
            <MobileNavItem icon={ListOrdered} label="Picks" href="/pick-lists" />
            <MobileNavItem icon={Download} label="Export" href="/export" />
          </>
        ) : (
          <>
            <MobileNavItem icon={Search} label="Scout" href="/scouting" />
            <MobileNavItem icon={Users} label="Pit" href="/pit" />
            <MobileNavItem icon={MapIcon} label="Map" href="/map" />
          </>
        )}
        
        <MobileNavItem icon={ClipboardList} label="Teams" href="/teams" />
      </nav>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

// Pages are imported from src/pages

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "scouting", element: <MatchScouting /> },
      { path: "pit", element: <PitScouting /> },
      { path: "map", element: <PitMap /> },
      { path: "teams", element: <TeamList /> },
      { path: "teams/:teamNumber", element: <TeamDetail /> },
      { path: "pick-lists", element: <PicklistHome /> },
      { path: "pick-lists/edit", element: <PickLists /> },
      { path: "hub", element: <DriveTeamHub /> },
      { path: "strategy", element: <MatchStrategy /> },
      { path: "export", element: <DataExport /> },
      { path: "setup", element: <EventSetup /> },
      { path: "customization", element: <Customization /> },
      { path: "help", element: <HelpSupport /> },
      { path: "privacy", element: <PrivacyPolicy /> },
      { path: "terms", element: <TermsOfService /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <ConvexAuthProvider client={convex}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </ThemeProvider>
      <Analytics />
    </ConvexAuthProvider>
  );
}


