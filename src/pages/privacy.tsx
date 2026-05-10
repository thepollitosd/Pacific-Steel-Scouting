import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground">Last updated: May 10, 2026</p>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to the Pacific Scout App, developed and maintained by FIRST Robotics Competition Team 5025 ("we", "us", or "our"). We are committed to protecting the privacy of our team members, our users, and the data we collect. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of information when you use our scouting application.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Account Information:</strong> When you register an account, we collect your email address, name, and role on the team. This information is required for authentication and to attribute scouting data to the correct individual.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>Scouting Data:</strong> As part of the core functionality of the app, you will submit data regarding other robotics teams. This includes match performance metrics, pit scouting interviews, robot specifications, and personal observations. This data is related to public performances and is collected solely for strategic purposes during FRC events.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>Usage Data:</strong> We may collect diagnostic information about your usage of the application, including offline sync errors, crash reports, and basic analytics to improve the app's performance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the collected data for the following purposes:
          </p>
          <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
            <li>To provide, maintain, and improve the scouting application.</li>
            <li>To compile strategic databases for use during FRC competitions.</li>
            <li>To authenticate users and ensure data integrity.</li>
            <li>To monitor usage patterns and troubleshoot technical issues.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>Internal Use:</strong> The scouting data collected is considered the intellectual property of Team 5025. It is distributed internally among team members and mentors.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>Alliance Partners:</strong> During elimination rounds or for strategic negotiations, we may share specific subsets of our scouting data with our alliance partners. 
          </p>
          <p className="text-muted-foreground leading-relaxed mt-2">
            <strong>Third-Party Services:</strong> We use Convex as our backend provider and Vercel for hosting and analytics. Your data is stored on their secure servers and is subject to their respective privacy policies. We do not sell, rent, or trade your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            The security of your data is important to us. We implement standard security protocols, including encrypted databases and secure authentication flows, to protect against unauthorized access or alteration. However, no method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Changes to this Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>
      </div>
    </div>
  );
}
