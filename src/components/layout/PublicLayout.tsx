import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useConvexAuth } from "convex/react";
import { ShieldCheck, FileText, LayoutDashboard, LogIn } from "lucide-react";
import { ThemeProvider } from "next-themes";

export function PublicLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to dashboard if authenticated and visiting public pages
  // But allow them to see the landing page if they explicitly want to? 
  // Usually, we want to skip landing if already logged in.
  useEffect(() => {
    if (!isLoading && isAuthenticated && (location.pathname === "/" || location.pathname === "/signin")) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img src="/logo.svg" alt="5025 Logo" className="h-10 w-10 transition-transform group-hover:scale-110 duration-300" />
            <span className="font-black text-xl tracking-tight hidden sm:block">
              PACIFIC <span className="text-primary italic">STEEL</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground hidden sm:flex"
              onClick={() => navigate("/privacy")}
            >
              Privacy
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-foreground hidden sm:flex"
              onClick={() => navigate("/terms")}
            >
              Terms
            </Button>
            {isAuthenticated ? (
              <Button 
                size="sm" 
                className="rounded-full px-5"
                onClick={() => navigate("/dashboard")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to Hub
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="rounded-full px-5"
                onClick={() => navigate("/signin")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="5025 Logo" className="h-12 w-12 grayscale opacity-50" />
              <span className="font-bold text-muted-foreground tracking-widest text-sm uppercase">Team 5025</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs text-center md:text-left">
              Advanced strategic analytics and scouting platform for Pacific Steel. Built for the modern FRC competitor.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="https://team5025.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Official Site</a>
          </div>

          <div className="text-muted-foreground text-xs font-mono">
            © 2026 PACIFIC STEEL SCOUTING
          </div>
        </div>
      </footer>
    </div>
  );
}
