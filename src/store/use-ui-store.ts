import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Navigation
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Scouting Context
  currentEventId: string | null;
  setCurrentEventId: (id: string | null) => void;
  selectedTeamNumber: number | null;
  setSelectedTeamNumber: (num: number | null) => void;
  
  // Modals
  isTeamDetailOpen: boolean;
  setTeamDetailOpen: (open: boolean) => void;

  // Customization (Options 2-5)
  defaultLandingPage: string;
  setDefaultLandingPage: (page: string) => void;
  layoutDensity: "compact" | "comfortable";
  setLayoutDensity: (density: "compact" | "comfortable") => void;
  enableHaptics: boolean;
  setEnableHaptics: (enable: boolean) => void;
  enableSounds: boolean;
  setEnableSounds: (enable: boolean) => void;
  autoSaveInterval: number; // in seconds
  setAutoSaveInterval: (interval: number) => void;
  warnOnLeave: boolean;
  setWarnOnLeave: (warn: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      activeTab: "dashboard",
      setActiveTab: (tab) => set({ activeTab: tab }),

      currentEventId: null,
      setCurrentEventId: (id) => set({ currentEventId: id }),
      selectedTeamNumber: null,
      setSelectedTeamNumber: (num) => set({ selectedTeamNumber: num }),

      isTeamDetailOpen: false,
      setTeamDetailOpen: (open) => set({ isTeamDetailOpen: open }),

      // Customization Defaults
      defaultLandingPage: "/",
      setDefaultLandingPage: (page) => set({ defaultLandingPage: page }),
      layoutDensity: "comfortable",
      setLayoutDensity: (density) => set({ layoutDensity: density }),
      enableHaptics: true,
      setEnableHaptics: (enable) => set({ enableHaptics: enable }),
      enableSounds: true,
      setEnableSounds: (enable) => set({ enableSounds: enable }),
      autoSaveInterval: 30,
      setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
      warnOnLeave: true,
      setWarnOnLeave: (warn) => set({ warnOnLeave: warn }),
    }),
    {
      name: "ui-storage",
    }
  )
);
