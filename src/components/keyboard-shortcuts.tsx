import * as React from "react";
import { 
  Command as CommandIcon, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  Map as MapIcon, 
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Keyboard,
  X
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? "⌘" : "Ctrl";

  // Navigation Shortcuts
  useHotkeys('mod+d', (e) => { e.preventDefault(); navigate("/dashboard"); onClose(); }, { enabled: !isOpen });
  useHotkeys('mod+s', (e) => { e.preventDefault(); navigate("/scouting"); onClose(); }, { enabled: !isOpen });
  useHotkeys('mod+t', (e) => { e.preventDefault(); navigate("/teams"); onClose(); }, { enabled: !isOpen });
  useHotkeys('mod+p', (e) => { e.preventDefault(); navigate("/pit-map"); onClose(); }, { enabled: !isOpen });
  useHotkeys('mod+l', (e) => { e.preventDefault(); navigate("/pick-lists"); onClose(); }, { enabled: !isOpen });
  
  // App Control
  useHotkeys('mod+shift+t', (e) => { e.preventDefault(); setTheme(theme === 'dark' ? 'light' : 'dark'); }, { enabled: !isOpen });
  useHotkeys('esc', () => onClose(), { enabled: isOpen });

  const shortcutGroups = [
    {
      title: "Navigation",
      items: [
        { keys: [modKey, "D"], label: "Go to Dashboard", icon: LayoutDashboard },
        { keys: [modKey, "S"], label: "Go to Scouting", icon: ClipboardList },
        { keys: [modKey, "T"], label: "Go to Teams", icon: Users },
        { keys: [modKey, "P"], label: "Go to Pit Map", icon: MapIcon },
        { keys: [modKey, "L"], label: "Go to Pick List", icon: ClipboardList },
      ]
    },
    {
      title: "Quick Actions",
      items: [
        { keys: [modKey, "K"], label: "Open OmniSearch", icon: CommandIcon },
        { keys: [modKey, "⇧", "T"], label: "Toggle Theme", icon: theme === 'dark' ? Sun : Moon },
        { keys: [modKey, "["], label: "Previous Match", icon: ChevronLeft },
        { keys: [modKey, "]"], label: "Next Match", icon: ChevronRight },
        { keys: [modKey, "/"], label: "Show Shortcuts Guide", icon: Keyboard },
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-[101] p-6"
          >
            <div className="bg-card border shadow-2xl rounded-2xl overflow-hidden glass-morphism border-primary/20">
              <div className="flex items-center justify-between p-6 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Keyboard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
                    <p className="text-sm text-muted-foreground">Boost your scouting speed</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {shortcutGroups.map((group) => (
                  <div key={group.title} className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {group.title}
                    </h3>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm">
                            <item.icon className="w-4 h-4 text-muted-foreground" />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex gap-1">
                            {item.keys.map((key) => (
                              <kbd key={key} className="px-2 py-1 bg-muted border rounded text-[10px] font-mono min-w-[24px] flex items-center justify-center">
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/30 border-t flex justify-center text-[10px] text-muted-foreground uppercase tracking-widest">
                Press ESC or Click outside to close
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
