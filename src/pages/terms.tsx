import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        </div>
        <p className="text-muted-foreground">Last updated: May 10, 2026</p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using the Pacific Scout App, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you do not have permission to access the service. These terms apply to all users, scouters, and mentors of Team 5025.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. User Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for any activity that occurs through your account. As a scouter, you agree to:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
            <li>Submit accurate, truthful, and unbiased data regarding match performance and pit interviews.</li>
            <li>Maintain the confidentiality of your account credentials.</li>
            <li>Refrain from submitting inappropriate, offensive, or unprofessional comments in notes or observations.</li>
            <li>Use the application solely for its intended purpose: to aid Team 5025 in strategic decisions.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Data Integrity and Offline Sync</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Pacific Scout App is designed to operate in environments with poor network connectivity by temporarily storing data on your device. You understand and agree that:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
            <li>You must ensure the app successfully synchronizes with the main server when a network connection is available.</li>
            <li>Team 5025 and the development team are not liable for data loss resulting from hardware failure, browser cache clearing, or unresolved sync conflicts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The codebase, design, layout, and aggregated scouting database are the intellectual property of Team 5025. You may not distribute, reproduce, or exploit any portion of the service for commercial purposes or share the database externally without explicit authorization from team leadership.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
