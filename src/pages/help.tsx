import { LifeBuoy, Mail, MessageSquare, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HelpSupport() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Get help with the Pacific Scout app or report issues during the competition.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileQuestion className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-xl">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">What if I lose internet in the pits?</h4>
              <p className="text-sm text-muted-foreground">
                The app will cache your data locally. Once you reconnect to Wi-Fi or cellular data, it will automatically sync with the Convex backend. Keep an eye on the Wi-Fi icon in the top right.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">How do I edit a mistake in a match?</h4>
              <p className="text-sm text-muted-foreground">
                Currently, you should contact the lead scout to manually correct the database, or resubmit the form with a note in the comments section.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Why am I seeing "Backend disconnected"?</h4>
              <p className="text-sm text-muted-foreground">
                This means the Convex backend isn't reachable. Ensure you are connected to the internet and the server is running.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LifeBuoy className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Contact Lead Scout</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              If you have a critical issue on the field or in the pits, reach out immediately.
            </p>
            <div className="flex flex-col gap-3">
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message on Slack / Discord
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Email Support Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
