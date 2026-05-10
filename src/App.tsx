/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider, createBrowserRouter, Outlet, useNavigate, useLocation } from "react-router";
import { ThemeProvider } from "next-themes";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
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
  Paintbrush
} from "lucide-react";

import { SignIn } from "./components/auth/SignIn";
import { useConvexAuth } from "convex/react";

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

function RootLayout() {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const defaultLandingPage = useUIStore((state) => state.defaultLandingPage);
  const { isAuthenticated, isLoading } = useConvexAuth();
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
          <NavItem icon={Paintbrush} label="Customization" href="/customization" />
        </nav>
        <div className="border-t p-2">
          <NavItem icon={Settings} label="Event Setup" href="/setup" />
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b px-4 bg-background/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Overview
            </h2>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/5 flex flex-col overscroll-none">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <nav className="flex md:hidden border-t bg-background/95 backdrop-blur-sm h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] items-center justify-around shrink-0 touch-none">
        <MobileNavItem icon={LayoutDashboard} label="Dash" href="/" />
        <MobileNavItem icon={Search} label="Scout" href="/scouting" />
        <MobileNavItem icon={Users} label="Pit" href="/pit" />
        <MobileNavItem icon={MapIcon} label="Map" href="/map" />
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
      { path: "setup", element: <EventSetup /> },
      { path: "customization", element: <Customization /> },
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


