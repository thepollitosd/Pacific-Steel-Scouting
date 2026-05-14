import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { AlertTriangle, RefreshCcw, Home, ChevronRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = "An unexpected error occurred within the Pacific Scout ecosystem.";
  let errorStatus = "SYSTEM_FAILURE";
  let errorDetail = "Check console for stack trace or contact engineering HQ.";

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status} ${error.statusText}`;
    errorMessage = error.data?.message || "Operational anomaly detected in route synchronization.";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetail = error.stack || errorDetail;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Warning Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-destructive/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="rounded-[3rem] border-2 border-destructive/20 bg-card/50 backdrop-blur-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert className="h-24 w-24 text-destructive" />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                <AlertTriangle className="h-3 w-3" /> Critical Error Detected
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground">
                Protocol <span className="text-destructive">Breach</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium italic">
                "{errorMessage}"
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 font-mono text-xs space-y-2 overflow-auto max-h-40">
              <div className="flex justify-between items-center border-b border-border/50 pb-2 mb-2">
                <span className="text-muted-foreground uppercase font-black tracking-widest">Diagnostic Payload</span>
                <span className="text-destructive font-black">{errorStatus}</span>
              </div>
              <pre className="text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">
                {errorDetail}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => window.location.reload()}
                className="h-14 px-8 rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-lg shadow-xl shadow-destructive/20 transition-all active:scale-95 flex-1 group"
              >
                <RefreshCcw className="mr-2 h-5 w-5 transition-transform group-hover:rotate-180 duration-500" />
                Initialize Restart
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/")}
                className="h-14 px-8 rounded-2xl border-2 font-bold text-lg hover:bg-muted transition-all active:scale-95 flex-1 group"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to HQ
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em] opacity-40">
            Pacific Steel Engineering // Error Protocol 5025
          </p>
        </div>
      </motion.div>
    </div>
  );
}
