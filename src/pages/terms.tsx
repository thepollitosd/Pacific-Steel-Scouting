import { FileText, ArrowLeft, Gavel, Scale, AlertCircle, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

import { useEffect } from "react";

export function TermsOfService() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Terms of Service | Pacific Steel Scouting";
    
    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://pacificscouting.vercel.app/terms");
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="mb-8 hover:bg-muted rounded-full px-4 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>
          <div className="inline-flex p-4 bg-primary/10 rounded-3xl mb-4 border border-primary/20">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Directive 5025.B // Revised May 2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-xl border-2 border-border/50 rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-16"
        >
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-black">01</span>
              User Authorization
            </h2>
            <div className="flex gap-4 p-6 bg-muted/30 border-2 border-dashed rounded-2xl">
              <AlertCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
              <p className="text-muted-foreground text-base leading-relaxed">
                Access to the Pacific Scout platform is strictly reserved for authorized members of <span className="text-foreground font-bold">Team 5025</span> and their verified guests. 
                Unauthorized usage, credential sharing, or de-compilation of the application is strictly prohibited.
              </p>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-black">02</span>
              Standard of Conduct
            </h2>
            <div className="grid gap-6">
              {[
                { title: "Data Integrity", desc: "Intentional submission of false, misleading, or malicious data is grounds for immediate account suspension.", icon: Gavel },
                { title: "Network Stability", desc: "Users must not attempt to disrupt the Convex backend or Nexus pit mapping infrastructure.", icon: Scale },
                { title: "Respectful Scouting", desc: "Observations of other teams must remain professional, objective, and compliant with FIRST core values.", icon: FileCheck }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-2xl hover:bg-muted/50 transition-colors group">
                  <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground mb-1 uppercase text-sm tracking-wide">{item.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-black">03</span>
              Liability & Warranty
            </h2>
            <div className="p-8 rounded-[2rem] border-2 border-primary/20 bg-primary/5 relative">
              <p className="text-muted-foreground leading-relaxed italic">
                The Pacific Scout platform is provided "AS IS" for competitive research purposes. Team 5025 does not guarantee 100% 
                uptime during field operations, though best efforts are made via local caching and offline synchronization protocols.
              </p>
            </div>
          </section>

          <footer className="pt-8 border-t border-border/50 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              By accessing the Pacific Scout interface, you acknowledge and agree to these terms.
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
