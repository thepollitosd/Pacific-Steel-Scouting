import { ShieldCheck, ArrowLeft, Lock, Eye, Share2, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

import { useEffect } from "react";

export function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Privacy Protocol | Pacific Steel Scouting";
    
    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://pacific-steel-scouting.vercel.app/privacy");
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
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
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">Privacy Protocol</h1>
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Directive 5025.A // Revised May 2026</p>
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
              Intellectual Framework
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              The Pacific Scout ecosystem is an engineering resource developed by <span className="text-foreground font-bold">Team 5025</span>. 
              We prioritize data integrity and user confidentiality across all operational theaters.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4 text-foreground">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-black">02</span>
              Data Acquisition
            </h2>
            <div className="grid gap-4">
              {[
                { title: "Operator Identity", desc: "Encrypted email and credential mapping for secure access.", icon: Lock },
                { title: "Field Telemetry", desc: "Match performance, mechanical diagnostics, and strategic observations.", icon: Eye },
                { title: "System Analytics", desc: "Diagnostic payloads to optimize sync latency and offline reliability.", icon: Server }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors group">
                  <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6 text-primary" />
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
              Information Sharing
            </h2>
            <div className="p-8 rounded-[2rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="h-6 w-6" />
                <h3 className="text-xl font-bold italic">Alliance Interoperability</h3>
              </div>
              <p className="text-primary-foreground/90 leading-relaxed mb-6">
                Scouting intel is strictly classified for Team 5025 usage. During elimination bracket selection, 
                subsets of non-sensitive telemetry may be shared with designated alliance partners to optimize strategic output.
              </p>
              <div className="h-px bg-white/20 mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                Authorized By: Engineering Lead // Security Clearance Level 2
              </p>
            </div>
          </section>

          <footer className="pt-8 border-t border-border/50 text-center">
            <p className="text-muted-foreground text-sm">
              Questions regarding privacy protocols? <Button variant="link" className="font-bold text-primary p-0 h-auto">Contact HQ</Button>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
