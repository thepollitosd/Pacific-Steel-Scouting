import { Target, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MatchStrategy() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Match Strategy Predictor</h1>
        <p className="text-muted-foreground mt-2">
          Compare alliance data, project scores, and formulate winning strategies.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Blue Alliance */}
        <Card className="border-blue-500/50 shadow-blue-500/10">
          <CardHeader className="bg-blue-500/10 rounded-t-xl pb-4">
            <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Blue Alliance
            </CardTitle>
            <CardDescription>Select 3 teams to analyze</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
              + Add Team 1
            </div>
            <div className="h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
              + Add Team 2
            </div>
            <div className="h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
              + Add Team 3
            </div>
          </CardContent>
        </Card>

        {/* Red Alliance */}
        <Card className="border-red-500/50 shadow-red-500/10">
          <CardHeader className="bg-red-500/10 rounded-t-xl pb-4">
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Red Alliance
            </CardTitle>
            <CardDescription>Select 3 teams to analyze</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
              + Add Team 1
            </div>
            <div className="h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
              + Add Team 2
            </div>
            <div className="h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
              + Add Team 3
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projection Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            Match Projection
          </CardTitle>
          <CardDescription>Estimated score based on historical averages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <Target className="w-12 h-12 text-muted-foreground/50" />
            <div className="text-xl font-medium text-muted-foreground">
              Select teams above to generate a projection.
            </div>
            <Button variant="outline" disabled>Run Simulation</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
