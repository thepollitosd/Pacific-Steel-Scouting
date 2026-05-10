import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Paintbrush, Home, Maximize, Bell, Save, Users } from "lucide-react";
import { useUIStore } from "../store/use-ui-store";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Customization() {
  const { theme, setTheme } = useTheme();
  const {
    defaultLandingPage,
    setDefaultLandingPage,
    layoutDensity,
    setLayoutDensity,
    enableHaptics,
    setEnableHaptics,
    enableSounds,
    setEnableSounds,
    autoSaveInterval,
    setAutoSaveInterval,
    warnOnLeave,
    setWarnOnLeave,
  } = useUIStore();

  const currentUser = useQuery(api.users.current);
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Customization</h1>
        <p className="text-muted-foreground">Personalize your scouting experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Profile</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Customize your public profile.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name"
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={isUpdating} className="w-full">
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Theme Card */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Paintbrush className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Theme</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Choose how the app looks to you.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors cursor-pointer ${
                theme === "light" ? "bg-accent border-primary" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <Sun className="h-6 w-6" />
              <span className="text-xs font-semibold">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors cursor-pointer ${
                theme === "dark" ? "bg-accent border-primary" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <Moon className="h-6 w-6" />
              <span className="text-xs font-semibold">Dark</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors cursor-pointer ${
                theme === "system" ? "bg-accent border-primary" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <Monitor className="h-6 w-6" />
              <span className="text-xs font-semibold">System</span>
            </button>
          </div>
        </div>

        {/* Default Landing Page */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Home className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Default Landing Page</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Choose which page you see when you open the app.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Dashboard", value: "/" },
              { label: "Match Scouting", value: "/scouting" },
              { label: "Pit Scouting", value: "/pit" },
              { label: "Drive Team Hub", value: "/hub" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setDefaultLandingPage(item.value)}
                className={`p-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                  defaultLandingPage === item.value ? "bg-accent border-primary" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layout Density */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Maximize className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Layout Density</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Adjust the spacing of lists and tables.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLayoutDensity("comfortable")}
              className={`p-4 rounded-xl border font-semibold transition-colors cursor-pointer ${
                layoutDensity === "comfortable" ? "bg-accent border-primary" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              Comfortable
            </button>
            <button
              onClick={() => setLayoutDensity("compact")}
              className={`p-4 rounded-xl border font-semibold transition-colors cursor-pointer ${
                layoutDensity === "compact" ? "bg-accent border-primary" : "bg-muted/50 hover:bg-muted"
              }`}
            >
              Compact
            </button>
          </div>
        </div>

        {/* Feedback & Sounds */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Feedback & Sounds</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Configure interactions during scouting.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div>
                <span className="font-semibold text-sm">Haptic Feedback</span>
                <p className="text-xs text-muted-foreground">Vibrate on button clicks</p>
              </div>
              <button
                onClick={() => setEnableHaptics(!enableHaptics)}
                className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  enableHaptics ? "bg-primary" : "bg-muted"
                } relative`}
              >
                <div className={`w-4 h-4 bg-background rounded-full absolute top-1 transition-all ${
                  enableHaptics ? "left-7" : "left-1"
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
              <div>
                <span className="font-semibold text-sm">Audio Cues</span>
                <p className="text-xs text-muted-foreground">Play sounds on score actions</p>
              </div>
              <button
                onClick={() => setEnableSounds(!enableSounds)}
                className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  enableSounds ? "bg-primary" : "bg-muted"
                } relative`}
              >
                <div className={`w-4 h-4 bg-background rounded-full absolute top-1 transition-all ${
                  enableSounds ? "left-7" : "left-1"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Auto-Save & Drafts */}
        <div className="p-6 rounded-2xl border bg-card shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Save className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Auto-Save & Drafts</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Manage how your scouting data is saved.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-xl">
              <label className="text-sm font-semibold block mb-2">Auto-Save Interval</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={autoSaveInterval}
                  onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-bold w-12 text-right">{autoSaveInterval}s</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">How often forms save drafts.</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div>
                <span className="font-semibold text-sm">Warn on Leave</span>
                <p className="text-xs text-muted-foreground">Alert if leaving unsaved form</p>
              </div>
              <button
                onClick={() => setWarnOnLeave(!warnOnLeave)}
                className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                  warnOnLeave ? "bg-primary" : "bg-muted"
                } relative`}
              >
                <div className={`w-4 h-4 bg-background rounded-full absolute top-1 transition-all ${
                  warnOnLeave ? "left-7" : "left-1"
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
