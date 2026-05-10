import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center max-w-md"
      >
        <h1 className="mb-2 text-7xl font-black tracking-tighter sm:text-9xl">
          <span className="bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            404
          </span>
        </h1>
        
        <h2 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          Autonomous mode failed
        </h2>
        
        <p className="mb-8 text-muted-foreground">
          The robot seems to have wandered off the field. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button 
            size="lg" 
            variant="default" 
            onClick={() => navigate("/")}
            className="group font-medium"
          >
            <Home className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            Back to Dashboard
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="group font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[50%] top-[50%] h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[128px]" />
        <div className="absolute left-[20%] top-[20%] h-[20rem] w-[20rem] rounded-full bg-destructive/5 blur-[96px]" />
      </div>
    </div>
  );
}
