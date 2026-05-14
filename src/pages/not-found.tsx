import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, ArrowLeft, Terminal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20" 
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground)/0.5) 1px, transparent 0)", backgroundSize: "40px 40px" }} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center max-w-2xl px-6 py-12 rounded-[3rem] border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl"
      >
        <div className="mb-8 relative group">
          <motion.div
            animate={{ 
              x: [0, -2, 2, -1, 1, 0],
              y: [0, 1, -1, 2, -2, 0]
            }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
            className="text-[120px] md:text-[180px] font-black tracking-tighter leading-none select-none italic"
          >
            <span className="relative inline-block text-foreground after:content-['404'] after:absolute after:inset-0 after:text-primary/30 after:translate-x-1 after:translate-y-1 after:-z-10 before:content-['404'] before:absolute before:inset-0 before:text-destructive/30 before:-translate-x-1 before:-translate-y-1 before:-z-20 text-foreground">
              404
            </span>
          </motion.div>
          <div className="absolute -top-4 -right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
            System Failure
          </div>
        </div>
        
        <div className="space-y-4 mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            Autonomous mode failed
          </h2>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-[10px] font-mono text-muted-foreground border">
              <Terminal className="h-3 w-3" />
              ERROR_PAGE_NOT_FOUND_EXCEPTION
            </div>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed mx-auto">
              The robot seems to have wandered off the field. The requested module is non-existent or has been de-indexed.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
          <Button 
            size="lg" 
            variant="default" 
            onClick={() => navigate("/")}
            className="group font-bold h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            <Home className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
            Back to Base
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="group font-bold h-14 px-8 rounded-2xl border-2 hover:bg-muted transition-all text-foreground"
          >
            <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Resume Sequence
          </Button>
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute left-[50%] top-[50%] h-[60rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute -right-20 top-20 h-[30rem] w-[30rem] rounded-full bg-destructive/5 blur-[120px]" />
        <div className="absolute -left-20 bottom-20 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[120px]" />
      </div>
    </div>
  );
}
