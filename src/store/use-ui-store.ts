import { create } from "zustand";

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
}

export const useUIStore = create<UIState>((set) => ({
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
}));
