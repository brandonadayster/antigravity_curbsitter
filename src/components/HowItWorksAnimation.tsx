"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Shield, Sparkles, ArrowRight } from "lucide-react";

export const HowItWorksAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out scroll progression using a spring
  const springConfig = { stiffness: 60, damping: 22, mass: 1 };

  // Runner X & Y Coordinate Mapping along the route
  const runnerX = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0],
    [80, 150, 200, 280, 380, 480, 480]
  );
  const runnerY = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0],
    [440, 410, 380, 310, 240, 200, 200]
  );

  // Trash Bin X & Y Coordinate Mapping (Static until grabbed at 40% scroll)
  const binX = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0],
    [150, 150, 200, 280, 380, 480, 480]
  );
  const binY = useTransform(
    scrollYProgress,
    [0, 0.4, 0.5, 0.6, 0.7, 0.8, 1.0],
    [410, 410, 380, 310, 240, 200, 200]
  );

  // Smooth transforms for coordinates
  const smoothRunnerX = useSpring(runnerX, springConfig);
  const smoothRunnerY = useSpring(runnerY, springConfig);
  const smoothBinX = useSpring(binX, springConfig);
  const smoothBinY = useSpring(binY, springConfig);

  // Side Gate Rotation Angle (Closed is 0deg, open is -45deg)
  const gateRotation = useTransform(scrollYProgress, [0.68, 0.8], [-45, 0]);
  const smoothGateRotation = useSpring(gateRotation, springConfig);

  // Latch Lock Visibility & Scale & Color Transitions
  const gateLockOpacity = useTransform(scrollYProgress, [0.75, 0.82], [0, 1]);
  const gateLockScale = useTransform(scrollYProgress, [0.75, 0.82], [0.6, 1]);
  const smoothLockScale = useSpring(gateLockScale, springConfig);

  const lockColor = useTransform(
    scrollYProgress,
    [0.78, 0.84],
    ["rgba(255, 255, 255, 0.2)", "#06b6d4"]
  );

  // Latch Lock Shake on lock confirmation (Scroll 80% to 85%)
  const lockShake = useTransform(
    scrollYProgress,
    [0.8, 0.81, 0.82, 0.83, 0.84, 0.85],
    [0, -12, 12, -8, 8, 0]
  );

  // Concierge iOS Notification Pop Card Transforms
  const notifyOpacity = useTransform(scrollYProgress, [0.88, 0.95], [0, 1]);
  const notifyScale = useTransform(scrollYProgress, [0.88, 0.95], [0.85, 1]);
  const notifyY = useTransform(scrollYProgress, [0.88, 0.95], [20, 0]);

  const smoothNotifyOpacity = useSpring(notifyOpacity, springConfig);
  const smoothNotifyScale = useSpring(notifyScale, springConfig);
  const smoothNotifyY = useSpring(notifyY, springConfig);

  // Path drawing indicator (dashed runner route outline)
  const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  // Update active step narrative indicator dynamically
  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.4) {
        setActiveStep(1);
      } else if (latest < 0.78) {
        setActiveStep(2);
      } else if (latest < 0.88) {
        setActiveStep(3);
      } else {
        setActiveStep(4);
      }
    });
  }, [scrollYProgress]);

  const steps = [
    {
      number: 1,
      title: "Runner Dispatched",
      description: "Our runner arrives in your neighborhood on scheduled collection mornings. Bins are located at your curb wireframe.",
    },
    {
      number: 2,
      title: "Rollback & Return",
      description: "After municipal collection, the runner securely returns your trash and recycle bins to their designated side gate storage.",
    },
    {
      number: 3,
      title: "Latch & Lock Verification",
      description: "We verify the side gate is closed, securing your yard and property from pests, HOA citations, and intruder access.",
    },
    {
      number: 4,
      title: "Proof-of-Work Notification",
      description: "Receive instant timestamped photo proof directly on your device. Bins returned, gate locked—complete peace of mind.",
    }
  ];

  return (
    <div ref={containerRef} className="relative h-[250vh] w-full">
      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-deep-onyx z-20 px-4">
        
        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-grid opacity-25 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-cyan/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-6xl glass-card rounded-2xl relative overflow-hidden p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center lg:items-stretch min-h-[580px] lg:min-h-[620px]">
          
          {/* Visual Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-cyan/15 to-transparent blur-md rounded-tr-2xl pointer-events-none" />

          {/* Left Column: Interactive Narrative Text */}
          <div className="w-full lg:w-5/12 flex flex-col justify-between space-y-6 z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Scroll Interactive Walkthrough
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                How It Works <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-neon-blue">
                  In Real-Time
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Scroll down slowly to watch the concierge valet process execute in our property wireframe simulation.
              </p>
            </div>

            {/* List of Steps */}
            <div className="space-y-4 py-2">
              {steps.map((s) => {
                const isActive = activeStep === s.number;
                return (
                  <motion.div
                    key={s.number}
                    className={`flex items-start gap-4 p-3.5 rounded-lg border transition-all ${
                      isActive
                        ? "bg-electric-cyan/5 border-electric-cyan/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                        : "bg-transparent border-transparent opacity-40"
                    }`}
                    animate={{ scale: isActive ? 1.02 : 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black tracking-wide ${
                      isActive ? "bg-electric-cyan text-deep-onyx" : "bg-white/10 text-white"
                    }`}>
                      {s.number}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{s.title}</h4>
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-slate-400 leading-relaxed mt-1"
                        >
                          {s.description}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Scroll Indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>Scroll Down</span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-90 text-electric-cyan" />
              </motion.div>
            </div>
          </div>

          {/* Right Column: Interactive Blueprint Canvas */}
          <div className="w-full lg:w-7/12 flex items-center justify-center relative min-h-[380px] lg:min-h-[460px] bg-deep-onyx/50 border border-white/5 rounded-xl overflow-hidden p-2 z-10">
            
            {/* SVG Blueprint */}
            <svg 
              className="w-full h-full max-w-[620px] max-h-[440px] text-slate-700" 
              viewBox="0 0 800 500" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Grid dots/crosses */}
              <defs>
                <pattern id="dotPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="15" cy="15" r="1" fill="rgba(255,255,255,0.07)" />
                </pattern>
              </defs>
              <rect width="800" height="500" fill="url(#dotPattern)" rx="10" />

              {/* Blueprint Labels */}
              <text x="50" y="40" fill="rgba(255,255,255,0.2)" className="text-[10px] font-bold font-mono tracking-widest">CS-SIMULATOR V1.2</text>
              <text x="690" y="470" fill="rgba(255,255,255,0.2)" className="text-[10px] font-bold font-mono tracking-widest">PROPERTY BLUEPRINT</text>

              {/* Driveway boundary outline */}
              <line x1={150} y1={440} x2={350} y2={220} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="6 6" />
              <line x1={230} y1={440} x2={430} y2={220} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" strokeDasharray="6 6" />

              {/* Main Street boundary Line */}
              <line x1={50} y1={440} x2={750} y2={440} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="3" />
              <text x="80" y="465" fill="rgba(255,255,255,0.15)" className="text-[9px] font-semibold tracking-wider font-sans uppercase">Street / Curb Boundary</text>

              {/* Property House Blueprint Wireframe */}
              <rect x={450} y={90} width={280} height={270} rx={8} stroke="rgba(255, 255, 255, 0.12)" strokeWidth="2" fill="rgba(11, 17, 30, 0.2)" />
              {/* Garage Door lines */}
              <rect x={480} y={260} width={100} height={100} rx={2} stroke="rgba(255,255,255,0.06)" fill="none" strokeWidth="1.5" />
              <line x1={480} y1={285} x2={580} y2={285} stroke="rgba(255,255,255,0.05)" />
              <line x1={480} y1={310} x2={580} y2={310} stroke="rgba(255,255,255,0.05)" />
              <line x1={480} y1={335} x2={580} y2={335} stroke="rgba(255,255,255,0.05)" />
              <text x={530} y={315} fill="rgba(255,255,255,0.05)" className="text-[10px] font-semibold text-center" textAnchor="middle">GARAGE</text>

              {/* Living Area text */}
              <text x={640} y={180} fill="rgba(255,255,255,0.05)" className="text-[10px] font-semibold text-center" textAnchor="middle">RESIDENCE</text>

              {/* Boundary Fence Outline */}
              <line x1={450} y1={90} x2={450} y2={220} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2.5" />
              <line x1={450} y1={290} x2={450} y2={360} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2.5" />
              <line x1={410} y1={220} x2={450} y2={220} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
              <line x1={410} y1={290} x2={450} y2={290} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
              <text x="375" y="150" fill="rgba(255,255,255,0.12)" className="text-[8px] font-semibold tracking-wider font-mono uppercase">Fence Line</text>

              {/* Dynamic Scroll-Drawing Route Path (Dashed path) */}
              <path 
                d="M 80,440 L 150,410 L 200,380 L 280,310 L 380,240 L 480,200" 
                fill="none" 
                stroke="rgba(6, 182, 212, 0.12)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
              
              <motion.path 
                d="M 80,440 L 150,410 L 200,380 L 280,310 L 380,240 L 480,200" 
                fill="none" 
                stroke="#06b6d4" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeDasharray="6 6"
                style={{ pathLength }}
              />

              {/* Gate door that rotates on scroll */}
              <motion.line 
                x1={450} 
                y1={220} 
                x2={450} 
                y2={290} 
                stroke="#06b6d4" 
                strokeWidth="4" 
                style={{ 
                  transformOrigin: "450px 220px", 
                  rotate: smoothGateRotation 
                }} 
              />
              <circle cx={450} cy={220} r={3} fill="#f8fafc" />

              {/* Latch Lock Indicator Badge on fence */}
              <motion.g 
                style={{ 
                  x: 450, 
                  y: 195, 
                  scale: smoothLockScale, 
                  rotate: lockShake,
                  opacity: gateLockOpacity
                }}
              >
                <motion.circle cx={0} cy={0} r={18} fill="#0a0f1d" stroke={lockColor} strokeWidth="2" />
                <motion.svg x={-9} y={-9} width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={lockColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </motion.svg>
              </motion.g>

              {/* Trash Bin Vector Icon (grabs and moves along driveway) */}
              <motion.g style={{ x: smoothBinX, y: smoothBinY }}>
                <circle cx={0} cy={0} r={18} fill="#0a0f1d" stroke="#3b82f6" strokeWidth="1.5" />
                <svg x={-11} y={-11} width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </motion.g>

              {/* Runner Badge (Pulse circle & icon moving along driveway) */}
              <motion.g style={{ x: smoothRunnerX, y: smoothRunnerY }}>
                {/* Outer Glow Pulse */}
                <motion.circle 
                  cx={0} 
                  cy={0} 
                  r={22} 
                  fill="rgba(6, 182, 212, 0.12)"
                  stroke="rgba(6, 182, 212, 0.25)"
                  strokeWidth="1.5"
                  animate={{ scale: [1, 1.18, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
                <circle cx={0} cy={0} r={14} fill="#0a0f1d" stroke="#06b6d4" strokeWidth="2.5" />
                {/* Custom Minimalist Runner Badge Icon */}
                <svg x={-8} y={-8} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="4" r="1.5" />
                  <path d="m9 16 3-3V7.5" />
                  <path d="M7 11h3l3 2" />
                  <path d="m14 18-2-3 3-5 3 2" />
                </svg>
              </motion.g>
            </svg>

            {/* Floating iOS Proof-of-Work Notification Card (pops in at > 88% scroll) */}
            <motion.div 
              style={{ 
                opacity: smoothNotifyOpacity, 
                scale: smoothNotifyScale, 
                y: smoothNotifyY 
              }}
              className="absolute top-4 right-4 w-[280px] p-3.5 glass-card rounded-xl flex items-start gap-3 pointer-events-none select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-electric-cyan/15 border border-electric-cyan/35 flex items-center justify-center text-electric-cyan flex-shrink-0">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-0.5 flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white tracking-wide">CURBSITTER</span>
                  <span className="text-[8px] text-slate-500 font-bold font-mono">JUST NOW</span>
                </div>
                <h4 className="text-[11px] font-extrabold text-white truncate">Bins returned & locked</h4>
                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <span className="text-emerald-400">✓</span> Photo verified (7:14 AM)
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};
