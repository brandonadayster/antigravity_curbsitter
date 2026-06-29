"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Sparkles, CheckCircle2, Navigation, Calendar } from "lucide-react";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "../../components/ui/glass-card";
import { PricingGrid } from "../../components/sections/pricing-grid";
import { WaitlistFooter } from "../../components/sections/waitlist-footer";
import { HowItWorksPhone } from "../../components/sections/how-it-works-phone";
import { motion, useScroll } from "framer-motion";

const PHYSICAL_ZIPS = ["86301", "86303", "86305"];

export default function Home() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const [zipInput, setZipInput] = useState("");
  const [zipError, setZipError] = useState("");

  const isValidZip = /^\d{5}$/.test(zipInput);
  const isServiceable = !isValidZip || PHYSICAL_ZIPS.includes(zipInput);
  const cardTitle = isServiceable ? "Check Route Availability" : "Join the Priority Waitlist";
  const cardDesc = isServiceable 
    ? "Enter your ZIP code to verify coverage and calculate your custom monthly service rate."
    : "CurbSitter is currently outside your neighborhood. Join our priority waitlist to help us route your area.";
  const buttonText = isServiceable ? "Get a Quote" : "Join the Priority Waitlist";

  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      }
    }
  };

  const onboardingCardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        delay: 0.3
      }
    }
  };

  const valuePropsContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const valuePropCardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-parallax bg-grid flex flex-col justify-between" style={{ backgroundImage: "url('/images/hero_parallax_bg.png')" }}>
      {/* Dark overlay mask for Shoreline parallax readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/90 via-[#0a0f1d]/85 to-[#131b2e] pointer-events-none z-0" />

      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-electric-cyan to-neon-blue z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />
      
      {/* Background Neon Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-cyan/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-neon-blue/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2" />
      
      {/* Header / Navigation */}
      <header className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 z-30">
        <nav className="flex items-center justify-between h-16" aria-label="Global Navigation">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg bg-electric-cyan flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Navigation className="w-5 h-5 text-deep-onyx rotate-45" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Curb<span className="text-electric-cyan">Sitter</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" id="nav-how" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#proof-of-work" id="nav-proof" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Proof-of-Work
            </a>
            <a href="#pricing" id="nav-pricing" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#service-area" id="nav-area" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Prescott Area
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#login" id="nav-login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors hidden sm:inline-block">
              Client Login
            </a>
            <Button variant="glow" size="sm" id="btn-header-cta" onClick={() => router.push('/onboarding')}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col justify-center py-20 sm:py-36 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            
            {/* Left Column: Brand Copy & Headings */}
            <motion.div 
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-12 text-left"
            >
              <motion.div variants={heroItemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                The &quot;Uber Black&quot; of Waste Concierge
              </motion.div>
              
              <motion.h1 variants={heroItemVariants} className="text-4xl sm:text-6xl font-extrabold text-white tracking-widest leading-[1.1] max-w-xl">
                Never miss <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-neon-blue">
                  trash day again.
                </span>
              </motion.h1>
              
              <motion.p variants={heroItemVariants} className="text-lg sm:text-xl text-slate-400 max-w-lg leading-relaxed">
                Bins out. Bins back. Done. CurbSitter is the ultra-premium residential waste concierge for Prescott&apos;s finest homes. We sell absolute peace of mind.
              </motion.p>

              {/* Unique differentiators */}
              <motion.div variants={heroItemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-cyan flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-300">Timestamped Photo Proof</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-cyan flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-300">HOA Compliance Guaranteed</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-cyan flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-300">Background Checked Runners</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-electric-cyan flex-shrink-0" />
                  <span className="text-sm font-semibold text-slate-300">Fully Insured Valet</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Interactive Address Availability Card */}
            <motion.div 
              variants={onboardingCardVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-5 w-full"
            >
              <GlassCard className="w-full p-8 relative">
                
                {/* Visual Accent Corner Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-electric-cyan/20 to-transparent blur-md rounded-tr-2xl pointer-events-none" />

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white transition-all duration-350">{cardTitle}</h2>
                    <p className="text-sm text-slate-400 mt-1 transition-all duration-350">
                      {cardDesc}
                    </p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setZipError("");
                      const trimmed = zipInput.trim();
                      if (!/^\d{5}$/.test(trimmed)) {
                        setZipError("Please enter a valid 5-digit ZIP code.");
                        return;
                      }
                      router.push(`/onboarding?zip=${trimmed}`);
                    }}
                    className="space-y-4 pt-2"
                  >
                    <div>
                      <label htmlFor="zip-hero-field" className="block text-xs font-semibold text-slate-400 mb-1">ZIP Code</label>
                      <input 
                        id="zip-hero-field"
                        type="text"
                        value={zipInput}
                        onChange={(e) => {
                          setZipInput(e.target.value.replace(/\D/g, ""));
                          setZipError("");
                        }}
                        placeholder="e.g. 86301"
                        maxLength={5}
                        className={`w-full h-11 px-3 bg-black/40 text-foreground rounded border ${zipError ? 'border-red-500' : 'border-white/10'} focus:border-electric-cyan focus:outline-none placeholder-slate-600`}
                      />
                      {zipError && <span className="text-[10px] text-red-400 mt-1 block font-medium">{zipError}</span>}
                    </div>

                    <Button type="submit" variant="glow" className="w-full h-11">
                      {buttonText}
                    </Button>
                  </form>
                </div>
              </GlassCard>
            </motion.div>

          </div>

          {/* Interactive Sticky Phone Mockup How It Works Section */}
          <HowItWorksPhone />

          {/* Pricing Grid Section */}
          <PricingGrid />

          {/* Social Proof & Value Props Section */}
          <section className="mt-30 sm:mt-40 border-t border-white/5 pt-20">
            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-[#E5E7EB] mb-16">
              Designed For Affluent Homeowners, STR Owners & HOAs
            </h2>

            <motion.div 
              variants={valuePropsContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10"
            >
              
              <motion.div variants={valuePropCardVariants}>
                <GlassCard hoverGlowOnly={true} className="p-8 rounded-xl space-y-4 h-full transition-all duration-500">
                  <div className="w-12 h-12 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan">
                    <CameraIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#E5E7EB]">Proof-of-Work Verification</h3>
                  <p className="text-sm text-[#E5E7EB] leading-relaxed font-light">
                    Never wonder if the job was done. Receive instant, automated timestamped photos of your bins on the curb and back at your garage wall.
                  </p>
                </GlassCard>
              </motion.div>

              <motion.div variants={valuePropCardVariants}>
                <GlassCard hoverGlowOnly={true} className="p-8 rounded-xl space-y-4 h-full transition-all duration-500">
                  <div className="w-12 h-12 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#E5E7EB]">Strict HOA Compliance</h3>
                  <p className="text-sm text-[#E5E7EB] leading-relaxed font-light">
                    Seniors and second-home owners love our dependability. Bins are returned within hours of collection, keeping you clear of costly HOA violations.
                  </p>
                </GlassCard>
              </motion.div>

              <motion.div variants={valuePropCardVariants}>
                <GlassCard hoverGlowOnly={true} className="p-8 rounded-xl space-y-4 h-full transition-all duration-500">
                  <div className="w-12 h-12 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#E5E7EB]">Seamless Scheduling</h3>
                  <p className="text-sm text-[#E5E7EB] leading-relaxed font-light">
                    Tailored services for short-term rental checkout schedules, vacation holds, and multi-bin properties. Complete control in a single app.
                  </p>
                </GlassCard>
              </motion.div>

            </motion.div>
          </section>

          {/* Waitlist Footer Section */}
          <WaitlistFooter />

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-10 border-t border-white/5 relative z-20 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CurbSitter LLC. All rights reserved. Now Servicing Prescott, AZ and Expanding Rapidly.
          </p>
          <div className="flex items-center gap-6">
            <a href="#terms" id="footer-terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#privacy" id="footer-privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#support" id="footer-support" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      {/* Exit Intent Support Call Modal */}
      <ExitIntentModal />

    </div>
  );
}

// Custom simple Camera Icon
function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
