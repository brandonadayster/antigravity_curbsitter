"use client";

import React, { useRef, useState } from "react";
import { 
  motion, 
  AnimatePresence, 
  useScroll, 
  useMotionValueEvent, 
  useTransform, 
  useReducedMotion,
  useSpring
} from "framer-motion";
import { 
  Navigation, 
  Shield, 
  CheckCircle2, 
  Key, 
  Trash2, 
  Check, 
  CheckCircle
} from "lucide-react";
import { GlassCard } from "../ui/glass-card";

export const HowItWorksPhone = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  // Track the scroll of our 300vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out scroll progression using useSpring to eliminate trackpad jitter
  const smoothScrollYProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Listen to progress changes to trigger screen swaps (optimized to complete earlier)
  useMotionValueEvent(smoothScrollYProgress, "change", (latest) => {
    if (prefersReducedMotion) return;
    if (latest < 0.33) {
      if (activeIndex !== 0) setActiveIndex(0);
    } else if (latest < 0.66) {
      if (activeIndex !== 1) setActiveIndex(1);
    } else {
      if (activeIndex !== 2) setActiveIndex(2);
    }
  });

  // Sub-scroll progress for the runner's dot on Screen 1 (0 to 0.33 maps to 0 to 1)
  const runnerProgress = useTransform(smoothScrollYProgress, [0, 0.33], [0, 1]);
  
  // Calculate X & Y coordinates along a mock street grid path
  // Segment 1: Go up from (140, 310) to (140, 220)
  // Segment 2: Turn right from (140, 220) to (200, 220)
  // Segment 3: Go up from (200, 220) to (200, 130)
  const runnerX = useTransform(runnerProgress, (t) => {
    if (t <= 0.333) return 140;
    if (t <= 0.666) return 140 + ((t - 0.333) / 0.333) * 60;
    return 200;
  });

  const runnerY = useTransform(runnerProgress, (t) => {
    if (t <= 0.333) return 310 - (t / 0.333) * 90;
    if (t <= 0.666) return 220;
    return 220 - ((t - 0.666) / 0.334) * 90;
  });

  const runnerWidthPercent = useTransform(runnerProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    {
      index: 0,
      phase: "Phase 01",
      title: "Real-Time Dispatch",
      subtitle: "Tracker Active",
      icon: <Navigation className="w-5 h-5 text-electric-cyan" />,
      desc: "Our runners sync with municipal collection schedules to arrive at the optimal time. Through your dashboard, watch your CurbSitter en route in real-time with live ETA calculations.",
      highlight: "Watch the tracker map update coordinates live."
    },
    {
      index: 1,
      phase: "Phase 02",
      title: "Valet check-in & Access",
      subtitle: "Arrival & Verification",
      icon: <Shield className="w-5 h-5 text-neon-blue" />,
      desc: "Marcus, your background-checked runner, checks in at your boundary. The runner portal displays your secure gate codes, retrieve locations, and custom bin rollout details automatically.",
      highlight: "Runner checks access codes and notes."
    },
    {
      index: 2,
      phase: "Phase 03",
      title: "Verified Proof of Work",
      subtitle: "Secured & Confirming",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      desc: "Bins are secured at your garage. Gate latches are double-verified and locked. Instantly receive a timestamped photo verification direct to your device for absolute peace of mind.",
      highlight: "Twilio SMS notification sent with image proof."
    }
  ];

  // If user prefers reduced motion, render a standard premium grid list
  if (prefersReducedMotion) {
    return (
      <section id="how-it-works" className="py-24 sm:py-32 border-t border-white/5 pt-20 max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-electric-cyan">
            The Concierge Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest uppercase leading-[1.2]">
            Trash Day, Handled. How It Works.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-light">
            We bridge the gap between municipal waste trucks and your property boundary. Complete rollout and return, with zero homeowner effort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <GlassCard key={step.index} className="p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-electric-cyan uppercase tracking-wider">{step.phase}</span>
                  <h3 className="text-xl font-bold text-white">{step.title}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-light">{step.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works" ref={containerRef} className="relative h-[300vh] w-full border-t border-white/5 bg-black/20">
      <div className="sticky top-0 h-screen overflow-hidden w-full flex items-center justify-center">
        {/* Dynamic Neon Background Glows */}
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-electric-cyan/5 rounded-full blur-[160px] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-colors duration-1000 select-none z-0" 
             style={{ 
               backgroundColor: activeIndex === 0 
                 ? "rgba(6, 182, 212, 0.05)" 
                 : activeIndex === 1 
                   ? "rgba(59, 130, 246, 0.05)" 
                   : "rgba(16, 185, 129, 0.05)" 
             }} 
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Step Copy */}
          <div className="lg:col-span-6 flex flex-col justify-center relative min-h-[360px] sm:min-h-[400px]">
            <div className="absolute inset-0 pointer-events-none select-none border-l border-white/5 ml-2 pl-8 hidden lg:block" />

            <div className="space-y-4 mb-8">
              <span className="text-xs font-semibold uppercase tracking-widest text-electric-cyan">
                The Concierge Process
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest uppercase">
                How It Works
              </h2>
            </div>

            <div className="relative w-full">
              {steps.map((step) => {
                const isActive = activeIndex === step.index;
                return (
                  <div 
                    key={step.index} 
                    className={`transition-all duration-300 ease-out space-y-4 ${
                      isActive 
                        ? "opacity-100 translate-x-0 relative z-20" 
                        : "opacity-0 translate-x-8 absolute inset-0 pointer-events-none select-none z-0"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        {step.icon}
                      </div>
                      <span className="text-sm font-semibold uppercase tracking-widest text-electric-cyan">
                        {step.phase}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                      {step.title}
                    </h3>

                    <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed max-w-xl">
                      {step.desc}
                    </p>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/5 text-xs text-slate-300 font-medium font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan animate-pulse" />
                      {step.highlight}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Visual Progress Dots (Left side navigation) */}
            <div className="flex items-center gap-2 mt-12 relative z-20">
              {steps.map((step) => (
                <div 
                  key={step.index} 
                  onClick={() => {
                    const scrollPercent = step.index === 0 ? 0.16 : step.index === 1 ? 0.50 : 0.83;
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      const scrollTop = window.scrollY + rect.top + (scrollPercent * rect.height);
                      window.scrollTo({ top: scrollTop, behavior: "smooth" });
                    }
                  }}
                  className={`h-1.5 rounded-full cursor-pointer transition-all duration-500 ${
                    activeIndex === step.index 
                      ? "w-8 bg-electric-cyan" 
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Sticky Phone Mockup */}
          <div className="lg:col-span-6 flex items-center justify-center h-[50vh] lg:h-[70vh]">
            <div className="relative scale-[0.8] sm:scale-95 lg:scale-100 transition-transform duration-500">
              
              {/* Glowing Phone Aura shadow overlay */}
              <div className="absolute inset-4 rounded-[40px] bg-electric-cyan/10 blur-xl opacity-50 z-0" 
                   style={{
                     boxShadow: activeIndex === 0 
                       ? "0 0 80px rgba(6, 182, 212, 0.25)" 
                       : activeIndex === 1 
                         ? "0 0 80px rgba(59, 130, 246, 0.25)" 
                         : "0 0 80px rgba(16, 185, 129, 0.25)"
                   }}
              />

              {/* iPhone Mockup Shell */}
              <div className="relative w-[300px] h-[600px] rounded-[44px] border-4 border-slate-800 bg-deep-onyx shadow-2xl overflow-hidden flex flex-col z-10">
                {/* Dynamic Island Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-40 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 absolute right-4" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="relative flex-1 w-full h-full overflow-hidden bg-[#0a0f1d] flex flex-col pt-12 pb-6 px-4 select-none">
                  {/* Status Bar */}
                  <div className="absolute top-3 left-6 right-6 flex items-center justify-between text-[10px] text-slate-400 font-bold z-30">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span>LTE</span>
                      <div className="w-4 h-2 border border-slate-400 rounded-sm p-[1px] flex items-center">
                        <div className="w-full h-full bg-slate-400 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeIndex === 0 && (
                      <motion.div 
                        key="tracker"
                        initial={{ opacity: 0, scale: 0.97, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="flex-1 flex flex-col justify-between"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-electric-cyan flex items-center justify-center">
                              <Navigation className="w-3.5 h-3.5 text-deep-onyx rotate-45" />
                            </div>
                            <span className="text-xs font-bold text-white">Live Route Tracker</span>
                          </div>
                          <span className="text-[10px] text-electric-cyan px-2 py-0.5 rounded bg-electric-cyan/10 border border-electric-cyan/20 animate-pulse font-medium">GPS Active</span>
                        </div>

                        {/* SVG Live Map */}
                        <div className="flex-1 relative my-4 rounded-xl border border-white/5 overflow-hidden bg-[#0A0F1D] flex items-center justify-center">
                          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
                          
                          <svg className="w-full h-full p-2" viewBox="0 0 280 400" fill="none">
                            {/* Streets grid lines */}
                            <path d="M 0,120 L 280,120" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" />
                            <path d="M 0,220 L 280,220" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="10" />
                            <path d="M 0,310 L 280,310" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" />
                            <path d="M 140,0 L 140,400" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="8" />
                            <path d="M 200,0 L 200,400" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" />

                            {/* Service Route Path Base */}
                            <path
                              d="M 140,310 L 140,220 L 200,220 L 200,130"
                              stroke="rgba(6, 182, 212, 0.15)"
                              strokeWidth="3"
                              strokeDasharray="4 4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Active/Traced Route Line */}
                            <motion.path
                              d="M 140,310 L 140,220 L 200,220 L 200,130"
                              stroke="#06b6d4"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                pathLength: runnerProgress,
                              }}
                            />

                            {/* Client House Destination Pin */}
                            <g transform="translate(200, 130)">
                              <circle r="12" fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="1" />
                              <circle r="4" fill="#3b82f6" />
                              <motion.circle
                                r="16"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="1"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                              />
                            </g>

                            {/* Dispatch Depot Hub Pin */}
                            <g transform="translate(140, 310)">
                              <circle r="8" fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                              <circle r="3" fill="#ffffff" />
                            </g>

                            {/* Moving Runner locator badge */}
                            <motion.g style={{ x: runnerX, y: runnerY }}>
                              <circle r="8" fill="rgba(6, 182, 212, 0.25)" stroke="#06b6d4" strokeWidth="1.5" />
                              <circle r="3" fill="#06b6d4" />
                              <motion.circle
                                r="14"
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="1"
                                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              />
                            </motion.g>
                          </svg>
                        </div>

                        {/* Status Overlay card */}
                        <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">Marcus (Runner)</span>
                            <span className="text-electric-cyan font-bold">En Route</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">804 Shoreline Dr.</span>
                            <span className="text-xs text-white/80 font-bold">ETA: 3m</span>
                          </div>
                          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-gradient-to-r from-electric-cyan to-neon-blue h-full"
                              style={{ width: runnerWidthPercent }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeIndex === 1 && (
                      <motion.div 
                        key="details"
                        initial={{ opacity: 0, scale: 0.97, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="flex-1 flex flex-col justify-between"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-neon-blue flex items-center justify-center">
                              <Shield className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs font-bold text-white">Runner Work Order</span>
                          </div>
                          <span className="text-[10px] text-neon-blue px-2 py-0.5 rounded bg-neon-blue/10 border border-neon-blue/20 font-medium">Checked In</span>
                        </div>

                        {/* Work details card list */}
                        <div className="flex-1 my-4 space-y-3 overflow-y-auto no-scrollbar py-1">
                          
                          {/* Property Details */}
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Active stop</span>
                            <h4 className="text-sm font-bold text-white">804 Shoreline Dr.</h4>
                            <p className="text-[10px] text-slate-400">Concierge Rollout & Return Plan</p>
                          </div>

                          {/* Access Details */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5 text-neon-blue">
                                <Key className="w-3 h-3" />
                                <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Gate Code</span>
                              </div>
                              <span className="text-xs font-bold text-white">#4810</span>
                              <span className="text-[8px] text-emerald-400 block font-medium">✓ Verified</span>
                            </div>
                            <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                              <div className="flex items-center gap-1.5 text-neon-blue">
                                <Trash2 className="w-3 h-3" />
                                <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Service bins</span>
                              </div>
                              <span className="text-xs font-bold text-white">2 Trash, 1 Rec.</span>
                              <span className="text-[8px] text-slate-400 block">Garage Wall</span>
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="p-2.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Property notes</span>
                            <p className="text-[10px] text-slate-300 font-light leading-relaxed">
                              &quot;Watch for gate latch lock at side fence. Double-check latch clicks and locks shut.&quot;
                            </p>
                          </div>

                          {/* Interactive Checklist Checklist */}
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Service check</span>
                            
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 text-[10px] text-white/80">
                                <div className="w-4 h-4 rounded bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                                <span className="font-medium">Area check-in completed</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-white/80">
                                <div className="w-4 h-4 rounded bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                                  <Check className="w-2.5 h-2.5" />
                                </div>
                                <span className="font-medium">Bins located at garage wall</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <span className="w-4 h-4 rounded bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center text-neon-blue">
                                  <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
                                </span>
                                <span className="font-semibold text-white/90">Rolling bins to street</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Action Status Bar */}
                        <div className="p-2.5 bg-neon-blue/10 border border-neon-blue/20 rounded-xl flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-neon-blue animate-ping" />
                          <span className="text-[10px] text-neon-blue font-bold">Marcus performing task...</span>
                        </div>
                      </motion.div>
                    )}

                    {activeIndex === 2 && (
                      <motion.div 
                        key="proof"
                        initial={{ opacity: 0, scale: 0.97, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -8 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="flex-1 flex flex-col justify-between relative"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-emerald-400 flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-deep-onyx" />
                            </div>
                            <span className="text-xs font-bold text-white">Proof of Work Verified</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/20 font-medium">Completed</span>
                        </div>

                        {/* Completed Stop Info */}
                        <div className="flex-1 my-3 space-y-3 overflow-y-auto no-scrollbar py-0.5">
                          
                          {/* Photo Verification Thumbnail (CSS representation of bins at side gate) */}
                          <div className="relative h-28 rounded-xl border border-white/10 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center p-3">
                            <div className="absolute inset-0 bg-[#0B111E] opacity-90" />
                            
                            {/* SVG Blueprint of Gate + Bins */}
                            <svg className="relative z-10 w-full h-full" viewBox="0 0 200 100" fill="none">
                              {/* Background wall */}
                              <line x1="0" y1="80" x2="200" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                              
                              {/* Fence gate blueprint */}
                              <path d="M 20,20 L 20,80" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                              <path d="M 20,40 L 70,40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                              <path d="M 20,60 L 70,60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                              {/* Slats */}
                              <line x1="30" y1="30" x2="30" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                              <line x1="40" y1="30" x2="40" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                              <line x1="50" y1="30" x2="50" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                              <line x1="60" y1="30" x2="60" y2="80" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                              <path d="M 70,20 L 70,80" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                              
                              {/* Latch */}
                              <circle cx="70" cy="50" r="3" fill="#10B981" />
                              <path d="M 66,50 L 70,50" stroke="#10B981" strokeWidth="1.5" />
                              
                              {/* Trash Bins blueprints */}
                              {/* Bin 1: Trash */}
                              <rect x="90" y="45" width="22" height="35" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                              <line x1="90" y1="52" x2="112" y2="52" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                              <circle cx="94" cy="78" r="2.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                              <circle cx="108" cy="78" r="2.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
                              {/* Bin 2: Recycle */}
                              <rect x="120" y="40" width="22" height="40" rx="3" fill="rgba(6, 182, 212, 0.05)" stroke="#06b6d4" strokeWidth="1" />
                              <line x1="120" y1="47" x2="142" y2="47" stroke="#06b6d4" strokeWidth="1" />
                              <circle cx="124" cy="78" r="2.5" fill="none" stroke="#06b6d4" strokeWidth="0.8" />
                              <circle cx="138" cy="78" r="2.5" fill="none" stroke="#06b6d4" strokeWidth="0.8" />
                              {/* Small recycling icon symbol representation (triangular strokes) */}
                              <path d="M 131,58 L 134,63 L 128,63 Z" stroke="#06b6d4" strokeWidth="0.8" fill="none" />
                            </svg>
                            
                            {/* Overlay checkmark pop */}
                            <div className="absolute inset-0 bg-[#0B111E]/40 backdrop-blur-3xs flex items-center justify-center z-20">
                              <motion.div 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
                                className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"
                              >
                                <svg className="w-6 h-6 text-[#0A0F1D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <motion.path 
                                    d="M 6 12 L 10 16 L 18 8" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.4, delay: 0.4 }}
                                  />
                                </svg>
                              </motion.div>
                            </div>
                            <span className="absolute bottom-1 right-2 text-[8px] text-slate-500 font-mono">Timestamped: 7:14 AM</span>
                          </div>

                          {/* Completed Checklist */}
                          <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] text-slate-300">
                              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                              <span className="font-medium text-white/90">Bins secure at garage side</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-300">
                              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                              <span className="font-medium text-white/90">Side gate locked & latched</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-300">
                              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                              <span className="font-medium text-white/90">Photo verification uploaded</span>
                            </div>
                          </div>

                        </div>

                        {/* Twilio SMS Notification Slide-Down overlay */}
                        <motion.div 
                          initial={{ y: -60, opacity: 0, scale: 0.9 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.5 }}
                          className="absolute -top-6 left-0 right-0 bg-[#0E1726]/95 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-2xl space-y-1 z-30"
                        >
                          <div className="flex items-center justify-between text-[8px]">
                            <div className="flex items-center gap-1">
                              <div className="w-3.5 h-3.5 rounded bg-electric-cyan flex items-center justify-center">
                                <Navigation className="w-2 h-2 text-deep-onyx rotate-45" />
                              </div>
                              <span className="font-bold text-white">CurbSitter</span>
                            </div>
                            <span className="text-slate-400 font-semibold">now</span>
                          </div>
                          <p className="text-[9.5px] text-slate-200 leading-tight">
                            <span className="font-bold text-white">CurbSitter:</span> Bins returned & side gate locked at 804 Shoreline Dr. View photo verification: <span className="text-electric-cyan underline">curbsitter.com/p/8a92</span>
                          </p>
                        </motion.div>

                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400 font-bold">HOA Compliance Achieved</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Home Indicator bar */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full z-30" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
