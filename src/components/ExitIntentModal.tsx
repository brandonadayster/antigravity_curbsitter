"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X } from "lucide-react";

export const ExitIntentModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  useEffect(() => {
    // Prevent rendering on SSR and check session storage
    if (typeof window === "undefined") return;
    
    let hasSeenModal = false;
    try {
      hasSeenModal = sessionStorage.getItem("curbsitter-exit-intent-shown") === "true";
    } catch {
      // Graceful fallback if storage access is blocked by browser security
    }

    if (hasSeenModal || hasShownThisSession) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // clientY < 15 indicates the cursor is moving up out of the viewport (e.g. towards tabs/address bar)
      if (e.clientY < 15) {
        setIsVisible(true);
        setHasShownThisSession(true);
        try {
          sessionStorage.setItem("curbsitter-exit-intent-shown", "true");
        } catch {
          // Graceful fallback
        }
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShownThisSession]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-full max-w-md glass-card rounded-2xl p-8 overflow-hidden z-10"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-electric-cyan/10 blur-2xl pointer-events-none" />

            {/* Close icon */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Call content */}
            <div className="text-center space-y-6">
              <div className="mx-auto w-14 h-14 rounded-full bg-electric-cyan/10 border border-electric-cyan/25 flex items-center justify-center text-electric-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Phone className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Before You Go...</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Need immediate assistance? Call us directly at <span className="text-white font-semibold font-mono">(520) 225-9713</span>.
                </p>
                <p className="text-xs text-slate-400">
                  Our Prescott support specialists are available to answer queries about custom schedules, HOA compliance, or bulk packages.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <a
                  href="tel:5202259713"
                  id="exit-intent-call-btn"
                  className="inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-lg bg-electric-cyan text-deep-onyx hover:bg-electric-cyan-hover h-12 shadow-[0_0_20px_rgba(6,182,212,0.15)] active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Click to Call Now
                </a>
                <button
                  onClick={handleClose}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Return to CurbSitter
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
