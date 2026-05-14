import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import {
  Zap,
  Target,
  BarChart3,
  Users,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Monitor,
  PenTool,
  Film,
  Plus,
  Minus,
  Trophy,
  Activity,
  Flame,
  LayoutDashboard,
  type LucideIcon,
  Search,
  ClipboardList,
  Wifi,
  Settings
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TiltWrapper({ children, className, subtle = false }: { children: React.ReactNode, className?: string, subtle?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [subtle ? "5deg" : "15deg", subtle ? "-5deg" : "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [subtle ? "-5deg" : "-15deg", subtle ? "5deg" : "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: LucideIcon, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <TiltWrapper className="group h-full">
        <div className="p-8 rounded-3xl bg-muted/20 border border-border/50 group-hover:border-primary/30 group-hover:bg-muted/30 transition-all duration-500 h-full flex flex-col">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </TiltWrapper>
    </motion.div>
  );
}

function MockDashboard() {
  const [autoCount, setAutoCount] = useState(4);
  const [teleopCount, setTeleopCount] = useState(12);
  const [time, setTime] = useState(135);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 150));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-background border rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full text-left">
      {/* Real TopHeader Style */}
      <div className="h-12 border-b bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-foreground">
            Match Scouting
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Wifi className="h-3.5 w-3.5 text-green-500" />
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-foreground">
            <Users className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Real Sidebar Style */}
        <div className="w-16 md:w-48 border-r bg-muted/10 flex flex-col p-2 gap-1 shrink-0">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: false },
            { icon: Search, label: "Match Scouting", active: true },
            { icon: Zap, label: "Strategy Hub", active: false },
            { icon: ClipboardList, label: "Team List", active: false },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.active ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" : "text-muted-foreground hover:bg-muted"
                }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="text-xs font-medium hidden md:block">{item.label}</span>
            </div>
          ))}
          <div className="mt-auto pt-2 border-t">
            <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground opacity-50">
              <Settings className="h-4 w-4" />
              <span className="text-xs font-medium hidden md:block">Settings</span>
            </div>
          </div>
        </div>

        {/* Real Content Style */}
        <div className="flex-1 overflow-y-auto bg-muted/5 p-4 md:p-6 space-y-6">
          <div className="flex items-end justify-between border-b pb-4">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Match Scouting</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rapid data collection for 5025</p>
            </div>
            <div className="text-xl font-black tabular-nums bg-muted/50 px-3 py-1 rounded-lg border text-foreground">
              {formatTime(time)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm">
              <CardHeader className="py-3 px-4 border-b text-foreground">
                <CardTitle className="text-[10px] uppercase tracking-widest text-primary font-bold">Team Selection</CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-foreground">
                <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl border border-dashed">
                  <div>
                    <p className="text-[8px] uppercase font-bold text-muted-foreground">Match</p>
                    <p className="text-sm font-black">QUAL 42</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground">Team</p>
                    <p className="text-sm font-black text-primary">5025</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm shadow-sm">
              <CardHeader className="py-3 px-4 border-b text-foreground">
                <CardTitle className="text-[10px] uppercase tracking-widest font-bold">Autonomous</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col items-center p-3 bg-muted/20 border rounded-xl">
                  <span className="text-[10px] font-bold uppercase mb-2 text-center text-muted-foreground">Balls Shot in Auto</span>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" onClick={(e) => { e.stopPropagation(); setAutoCount(Math.max(0, autoCount - 1)); }}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-2xl font-black w-8 text-center tabular-nums text-foreground">{autoCount}</span>
                    <Button variant="default" size="icon" className="h-10 w-10 rounded-full" onClick={(e) => { e.stopPropagation(); setAutoCount(autoCount + 1); }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Teleop Scoring</h4>
            </div>
            {/* Real BallCounter Style */}
            <div className="flex flex-col items-center p-5 bg-muted/20 border rounded-xl space-y-4">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Balls Shot in Teleop</span>
              <div className="text-4xl font-black tabular-nums text-primary">{teleopCount}</div>
              <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
                {[1, 5, 25].map(inc => (
                  <Button
                    key={`plus-${inc}`}
                    variant="default"
                    size="sm"
                    className="h-10 font-bold text-xs"
                    onClick={(e) => { e.stopPropagation(); setTeleopCount(teleopCount + inc); }}
                  >
                    +{inc}
                  </Button>
                ))}
                {[1, 5, 25].map(inc => (
                  <Button
                    key={`minus-${inc}`}
                    variant="outline"
                    size="sm"
                    className="h-10 font-bold text-xs"
                    onClick={(e) => { e.stopPropagation(); setTeleopCount(Math.max(0, teleopCount - inc)); }}
                  >
                    -{inc}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t">
            <Button size="sm" className="h-10 px-6 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
              Submit Match Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // SEO & AI platform optimization
  useEffect(() => {
    document.title = "Pacific Steel Scouting | Elite FRC Data Intelligence";
    
    const updateMeta = (name: string, content: string, isProperty = false) => {
      let el = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const updateLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    updateMeta("description", "Professional-grade FRC scouting and strategy platform for Team 5025. Real-time data sync, advanced analytics, and strategic visualization.");
    updateMeta("keywords", "FRC Scouting, Team 5025, Pacific Steel, Robotics Analytics, FRC Strategy, The Blue Alliance, Scouting App");
    updateMeta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    updateMeta("theme-color", "#000000"); // Pitch black for the steel aesthetic
    
    // Canonical
    updateLink("canonical", "https://pacificscouting.vercel.app/");

    // OpenGraph
    updateMeta("og:title", "Pacific Steel Scouting | Elite Data Intelligence", true);
    updateMeta("og:description", "The official scouting platform of Team 5025. Transform match data into winning strategies.", true);
    updateMeta("og:type", "website", true);
    updateMeta("og:image", "https://pacificscouting.vercel.app/og-image.png", true);
    updateMeta("og:url", "https://pacificscouting.vercel.app/", true);
    
    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", "Pacific Steel Scouting");
    updateMeta("twitter:description", "Advanced FRC data intelligence for Team 5025.");

    // JSON-LD for AI & Search Engines
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "json-ld-schema";
    script.innerHTML = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Pacific Steel Scouting",
        "alternateName": "5025 Scouting App",
        "operatingSystem": "Web",
        "applicationCategory": "AnalyticsApplication",
        "description": "Elite FRC scouting platform for Team 5025 Pacific Steel, featuring real-time synchronization, advanced strategic analytics, and pit display systems.",
        "softwareVersion": "2.1.0",
        "featureList": [
          "Real-time Match Scouting",
          "Strategic Data Visualization",
          "Pit Mapping & Coordination",
          "Match Replay Analysis",
          "Offline Synchronization"
        ],
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Pacific Steel Team 5025",
        "url": "https://team5025.com",
        "logo": "https://pacificscouting.vercel.app/logo.svg",
        "sameAs": [
          "https://github.com/thepollitosd",
          "https://instagram.com/team5025"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://pacificscouting.vercel.app/"
        }]
      }
    ]);
    document.head.appendChild(script);

    return () => {
      const oldScript = document.getElementById("json-ld-schema");
      if (oldScript) oldScript.remove();
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1000px] pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/4 -right-24 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[160px]" />
      </div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center">
        <motion.div style={{ opacity, scale }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Zap className="h-3 w-3 fill-current" />
            Empowering Team 5025
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 max-w-4xl leading-[0.9]"
          >
            THE FUTURE OF <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto] animate-gradient">
              SCOUTING IS HERE.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Advanced analytics, real-time strategy, and precision scouting for Pacific Steel. Gain the competitive edge that defines champions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="h-14 px-10 rounded-full text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate("/signin")}
            >
              Access the Hub
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-10 rounded-full text-lg font-bold border-2"
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Features
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Interactive Element - Real Component Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 w-full max-w-5xl mx-auto perspective-2000 px-4"
        >
          <TiltWrapper subtle className="relative w-full rounded-[2rem] md:rounded-[3rem] p-1 bg-gradient-to-tr from-primary/20 via-border/50 to-primary/20 shadow-2xl group overflow-hidden">
            <div className="relative h-[450px] md:h-[650px] w-full rounded-[1.8rem] md:rounded-[2.8rem] overflow-hidden">
              <MockDashboard />
              
              {/* Overlay for glass effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent pointer-events-none" />
              
              {/* Tooltip Hover Effect */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl backdrop-blur-md pointer-events-none z-50 border border-white/20 text-sm flex items-center gap-3"
              >
                <Monitor className="h-4 w-4" />
                Live Interaction Enabled
              </motion.div>
            </div>
          </TiltWrapper>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tighter">BUILT FOR ELITE COMPETITION.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto italic">
            "Software is the most important component of a modern FRC team." — Anonymous Steel Member
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Target}
            title="Strategic Analytics"
            description="Deep-dive into team performance metrics with multi-event data normalization and trend analysis."
            delay={0.1}
          />
          <FeatureCard
            icon={Monitor}
            title="Pit Display System"
            description="Broadcast real-time match data and strategy updates across the pit for maximum team coordination."
            delay={0.2}
          />
          <FeatureCard
            icon={PenTool}
            title="Strategic Whiteboard"
            description="Draw over field maps in real-time. Share strategies instantly with the drive team."
            delay={0.3}
          />
          <FeatureCard
            icon={Film}
            title="Match Replay & HUD"
            description="Analyze match videos with overlayed scouting data. Pinpoint exactly where the game was won or lost."
            delay={0.4}
          />
          <FeatureCard
            icon={Users}
            title="Seamless Collaboration"
            description="Optimized for offline use at events with instant sync once connected to the mesh network."
            delay={0.5}
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Steel-Grade Security"
            description="Protected data integrity ensures your scouting strategies remain within Team 5025."
            delay={0.6}
          />
        </div>
      </section>

      {/* Interactive CTA */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3" />
        <div className="max-w-4xl mx-auto relative text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 md:p-20 rounded-[3rem] bg-background border-2 border-primary/20 shadow-2xl relative overflow-hidden"
          >
            {/* Animated Logo background */}
            <img src="/logo.svg" alt="" className="absolute -bottom-10 -right-10 h-64 w-64 opacity-5 pointer-events-none" />

            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-none">READY TO <br />DOMINATE?</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
              Join the elite scouts of Pacific Steel and transform data into trophies. Restricted to authorized personnel only.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-14 px-12 rounded-full text-lg font-bold group"
                onClick={() => navigate("/signin")}
              >
                Launch Dashboard
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Ticker */}
      <div className="py-8 border-y bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 overflow-hidden flex whitespace-nowrap gap-12 text-sm font-black tracking-widest text-muted-foreground/30 uppercase items-center">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-12 shrink-0 animate-scroll">
              <span>Pacific Steel</span>
              <span>Team 5025</span>
              <span>Regional Finalist</span>
              <span>Strategic Excellence</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-20 px-4 border-t bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="5025 Logo" className="h-10 w-10" />
              <span className="text-xl font-black uppercase tracking-tighter">Pacific Steel</span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-8">
              The premier data intelligence platform for Team 5025. Engineering victory through advanced analytics and strategic discipline since 2014.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10" asChild>
                <a href="https://github.com" target="_blank" rel="noreferrer"><Search className="h-4 w-4" /></a>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10" asChild>
                <a href="https://instagram.com" target="_blank" rel="noreferrer"><Users className="h-4 w-4" /></a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Protocol</h4>
            <ul className="space-y-4">
              <li><button onClick={() => navigate("/privacy")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Directive</button></li>
              <li><button onClick={() => navigate("/terms")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Service Terms</button></li>
              <li><button onClick={() => navigate("/help")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Support Nexus</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Operations</h4>
            <ul className="space-y-4">
              <li><button onClick={() => navigate("/signin")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Fleet Login</button></li>
              <li><button onClick={() => navigate("/help")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">System Status</button></li>
              <li><button onClick={() => navigate("/setup")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">Event Synchronization</button></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            © 2025 Team 5025 Pacific Steel. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Status: Optimal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
