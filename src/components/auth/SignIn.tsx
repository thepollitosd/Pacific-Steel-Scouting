import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { isConvexConfigured } from "../../lib/convex";

export function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConvexConfigured) {
      toast.error("Convex project is not configured. Ask your administrator to run 'npx convex dev' and set VITE_CONVEX_URL in production.");
      return;
    }
    setLoading(true);
    try {
      if (step === "signIn") {
        await signIn("password", { email, password, flow: "signIn" });
      } else {
        await signIn("password", { email, password, flow: "signUp" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed. Make sure your Convex backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {step === "signIn" ? "Welcome back to Team 5025" : "Create an account for Team 5025"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {!isConvexConfigured ? (
              <span className="text-destructive font-semibold">Backend disconnected. Please run the setup commands.</span>
            ) : step === "signIn"
              ? "Enter your credentials to access the hub"
              : "Sign up to start scouting"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="scout@team5025.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : step === "signIn" ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <button
            onClick={() => setStep(step === "signIn" ? "signUp" : "signIn")}
            className="text-primary hover:underline font-medium"
          >
            {step === "signIn"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
