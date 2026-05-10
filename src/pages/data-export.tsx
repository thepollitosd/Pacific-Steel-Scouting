import { Download, Database, BarChart3, Cloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DataExport() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Export & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Export your scouting data for external analysis or sync with global APIs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CSV Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="w-5 h-5 mr-2 text-primary" />
              Export to CSV
            </CardTitle>
            <CardDescription>Download data for Excel, Tableau, or PowerBI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a flat CSV file containing all match scouting metrics, pit scouting data, and team metadata.
            </p>
            <div className="flex gap-4">
              <Button className="w-full">Export Match Data</Button>
              <Button variant="outline" className="w-full">Export Pit Data</Button>
            </div>
          </CardContent>
        </Card>

        {/* TBA Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cloud className="w-5 h-5 mr-2 text-blue-500" />
              The Blue Alliance Sync
            </CardTitle>
            <CardDescription>Pull match schedules and event data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect to TBA to automatically populate match numbers, alliances, and official API results.
            </p>
            <Button variant="secondary" className="w-full">
              Sync Event Schedule
            </Button>
          </CardContent>
        </Card>

        {/* Statbotics */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
              Statbotics EPA Integration
            </CardTitle>
            <CardDescription>Compare manual scouting with global EPA models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:flex md:items-center md:justify-between md:space-y-0">
            <p className="text-sm text-muted-foreground max-w-xl">
              Statbotics provides Expected Point Contribution (EPA) data for every team. Sync this data to compare our manual scouting averages against the global model.
            </p>
            <Button variant="outline" className="shrink-0">
              <Database className="w-4 h-4 mr-2" />
              Fetch EPA Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
