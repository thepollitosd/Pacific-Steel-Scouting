import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Star } from "lucide-react";

export function DriverFeedback() {
  const activeEvent = useQuery(api.events.getActiveEvent);
  // We'll handle the mutation gracefully if it doesn't exist yet
  const submitFeedback = useMutation(api.driverFeedback?.submit as any || (() => Promise.resolve()));
  
  const [matchNumber, setMatchNumber] = useState("");
  const [drivetrainRating, setDrivetrainRating] = useState(0);
  const [intakeIssues, setIntakeIssues] = useState<boolean | null>(null);
  const [intakeNotes, setIntakeNotes] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) {
      toast.error("No active event selected");
      return;
    }
    if (!matchNumber) {
      toast.error("Please enter a match number");
      return;
    }
    if (drivetrainRating === 0) {
      toast.error("Please rate the drivetrain");
      return;
    }
    if (intakeIssues === null) {
      toast.error("Please indicate if there were intake issues");
      return;
    }

    setIsSubmitting(true);
    try {
      if (api.driverFeedback?.submit) {
        await submitFeedback({
          eventId: activeEvent._id,
          matchNumber: parseInt(matchNumber),
          drivetrainRating,
          intakeIssues,
          intakeNotes,
          generalNotes,
          submittedAt: Date.now(),
        });
        toast.success("Feedback submitted successfully!");
        // Reset form
        setMatchNumber("");
        setDrivetrainRating(0);
        setIntakeIssues(null);
        setIntakeNotes("");
        setGeneralNotes("");
      } else {
        toast.warning("Backend mutation not found. Data not saved.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Driver Feedback</h1>
        <p className="text-muted-foreground mt-2">Post-match feedback from the drive team.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border">
        <div className="space-y-2">
          <Label htmlFor="matchNumber">Match Number</Label>
          <Input
            id="matchNumber"
            type="number"
            placeholder="e.g. 42"
            value={matchNumber}
            onChange={(e) => setMatchNumber(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label>How was the drivetrain?</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setDrivetrainRating(star)}
                className={`p-2 rounded-full transition-colors ${
                  drivetrainRating >= star ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                }`}
              >
                <Star className="w-8 h-8" fill={drivetrainRating >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Any intake issues?</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={intakeIssues === true ? "default" : "outline"}
              onClick={() => setIntakeIssues(true)}
              className="flex-1 py-6 text-lg"
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={intakeIssues === false ? "default" : "outline"}
              onClick={() => setIntakeIssues(false)}
              className="flex-1 py-6 text-lg"
            >
              No
            </Button>
          </div>
        </div>

        {intakeIssues === true && (
          <div className="space-y-2">
            <Label htmlFor="intakeNotes">Describe intake issues</Label>
            <Textarea
              id="intakeNotes"
              placeholder="What went wrong?"
              value={intakeNotes}
              onChange={(e) => setIntakeNotes(e.target.value)}
              className="text-base"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="generalNotes">General Notes / Other Issues</Label>
          <Textarea
            id="generalNotes"
            placeholder="Any other comments about the match?"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            className="text-base min-h-[100px]"
          />
        </div>

        <Button type="submit" className="w-full py-6 text-lg" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </div>
  );
}

export default DriverFeedback;
