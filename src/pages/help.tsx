import { useEffect } from "react";
import { motion } from "motion/react";
import { LifeBuoy, Mail, MessageSquare, FileQuestion, ChevronRight, Zap, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function HelpSupport() {
  // SEO & FAQ Structured Data
  useEffect(() => {
    document.title = "Help & Support | Pacific Steel Scouting";
    
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-schema";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What if I lose internet in the pits?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The app will cache your data locally. Once you reconnect to Wi-Fi or cellular data, it will automatically sync with the Convex backend."
          }
        },
        {
          "@type": "Question",
          "name": "How do I edit a mistake in a match report?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Currently, you should contact the lead scout or drive team lead to manually correct the database."
          }
        },
        {
          "@type": "Question",
          "name": "Why am I seeing 'Backend disconnected'?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "This means the Convex backend isn't reachable. Ensure you are connected to a stable network."
          }
        }
      ]
    });
    document.head.appendChild(script);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", "https://pacificscouting.vercel.app/help");

    return () => {
      const oldScript = document.getElementById("faq-schema");
      if (oldScript) oldScript.remove();
    };
  }, []);

  const faqs = [
    {
      q: "What if I lose internet in the pits?",
      a: "The app will cache your data locally. Once you reconnect to Wi-Fi or cellular data, it will automatically sync with the Convex backend. Keep an eye on the Wi-Fi icon in the top right for live connection status.",
      icon: Zap
    },
    {
      q: "How do I edit a mistake in a match report?",
      a: "Currently, you should contact the lead scout or drive team lead to manually correct the database. Alternatively, you can resubmit the form with a detailed note in the comments section.",
      icon: BookOpen
    },
    {
      q: "Why am I seeing 'Backend disconnected'?",
      a: "This means the Convex backend isn't reachable. Ensure you are connected to a stable network. If the problem persists, the platform may be undergoing maintenance or the API quota has been reached.",
      icon: Shield
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          <LifeBuoy className="h-3 w-3" /> Support Center
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">Mission Control Help</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium italic">
          Ensuring peak performance for Team 5025 on and off the field.
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* FAQ Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] border bg-card/50 backdrop-blur-sm p-8 md:p-12 shadow-sm">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-foreground">
              <FileQuestion className="h-6 w-6 text-primary" />
              Technical Intel
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl px-6 bg-muted/20">
                  <AccordionTrigger className="hover:no-underline py-6">
                    <span className="text-left font-bold text-lg flex items-center gap-4 text-foreground">
                      <faq.icon className="h-5 w-5 text-primary shrink-0" />
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-muted-foreground text-base leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Contact Sidebar */}
        <div className="space-y-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="rounded-[2.5rem] border bg-primary text-primary-foreground p-8 shadow-2xl shadow-primary/20 relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
            <div className="relative z-10">
              <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Direct Channel</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Need immediate field support or have a critical bug? Connect with the engineering team.
              </p>
              <div className="space-y-3">
                <Button className="w-full justify-between bg-white text-primary hover:bg-white/90 rounded-xl h-12 font-bold px-6 group" variant="secondary">
                  Slack / Discord
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button className="w-full justify-between bg-primary-foreground/10 hover:bg-primary-foreground/20 border-white/20 text-white rounded-xl h-12 font-bold px-6 group" variant="outline">
                  Email Support
                  <Mail className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="rounded-[2.5rem] border bg-muted/30 p-8">
            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">System Status</h4>
            <div className="space-y-4">
              {[
                { label: "Convex API", status: "Operational", color: "bg-green-500" },
                { label: "TBA Sync", status: "Operational", color: "bg-green-500" },
                { label: "Nexus Pits", status: "Maintenance", color: "bg-amber-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{item.status}</span>
                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
