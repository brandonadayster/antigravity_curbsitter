"use client";

import React, { useState } from "react";
import { PropertyStop } from "@/types/operations";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Navigation, MessageSquare, X, AlertTriangle, 
  MapPin, Camera, ChevronLeft, ChevronRight, CheckCircle, 
  Map, List, Compass, Check, Loader2
} from "lucide-react";
import { GlassCard } from "../../../components/ui/glass-card";
import { submitServiceStop } from "../actions/runnerActions";

interface HeaderProps {
  routeProgress: number;
  totalStops: number;
  showMap: boolean;
  setShowMap: (val: boolean) => void;
}

function Header({ routeProgress, totalStops, showMap, setShowMap }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-electric-cyan flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Navigation className="w-5 h-5 text-deep-onyx rotate-45" />
        </div>
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Prescott North Route</span>
          <span className="text-xl font-black text-white">
            Progress: <span className="text-electric-cyan">{routeProgress}</span> / {totalStops} Stops
          </span>
        </div>
      </div>

      <button 
        onClick={() => setShowMap(!showMap)}
        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all shadow-lg"
        aria-label={showMap ? "Switch to stop view" : "Switch to map view"}
      >
        {showMap ? <List className="w-6 h-6 text-electric-cyan" /> : <Map className="w-6 h-6 text-electric-cyan" />}
      </button>
    </header>
  );
}

interface MapPlaceholderProps {
  setShowMap: (val: boolean) => void;
}

function MapPlaceholder({ setShowMap }: MapPlaceholderProps) {
  return (
    <motion.div
      key="mapView"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 flex-grow flex flex-col justify-between"
    >
      <GlassCard className="flex-grow flex flex-col items-center justify-center text-center p-12 space-y-6">
        <div className="w-20 h-20 rounded-full bg-electric-cyan/15 flex items-center justify-center text-electric-cyan shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Map className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold uppercase tracking-widest text-white leading-tight">Mapbox Integration Pending</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Real-time runner routing and geographic boundary tracking are currently being configured.
          </p>
        </div>
      </GlassCard>

      {/* Return button */}
      <button
        onClick={() => setShowMap(false)}
        className="w-full h-18 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-white rounded-2xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
      >
        <List className="w-5 h-5 text-electric-cyan" />
        Return to Active Card Deck
      </button>
    </motion.div>
  );
}

interface ActiveStopCardProps {
  stop: PropertyStop;
  currentIndex: number;
  totalStopsCount: number;
  isAlreadyCompleted: boolean;
  isPinged: boolean;
  isGpsLogged: boolean;
  gpsStatus: "idle" | "loading" | "success" | "error";
  proofPhoto: string | null;
  photoUrl: string | undefined;
  isSubmitting: boolean;
  setProofPhotos: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handlePingCustomer: () => void;
  handleLogGpsPin: () => void;
  handlePhotoCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleComplete: () => void;
  handlePrevStop: () => void;
  handleNextStop: () => void;
  handleRetakePhoto: () => void;
  currentException: { type: string; bags: number };
  onOpenExceptionDrawer: () => void;
}

function ActiveStopCard({
  stop,
  currentIndex,
  totalStopsCount,
  isAlreadyCompleted,
  isPinged,
  isGpsLogged,
  gpsStatus,
  proofPhoto,
  photoUrl,
  isSubmitting,
  setProofPhotos,
  handlePingCustomer,
  handleLogGpsPin,
  handlePhotoCapture,
  handleComplete,
  handlePrevStop,
  handleNextStop,
  handleRetakePhoto,
  currentException,
  onOpenExceptionDrawer
}: ActiveStopCardProps) {
  return (
    <motion.div
      key="stopView"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 flex-grow flex flex-col justify-between"
    >
      {/* Active Stop Card */}
      <div className="bg-slate-800/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden flex-grow flex flex-col justify-between">
        
        {/* Status Indicator Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A0F1D] border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-electric-cyan" />
            Stop #{currentIndex + 1}
          </span>
          {isAlreadyCompleted ? (
            <span className="text-emerald-400 font-bold text-sm uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Completed
            </span>
          ) : (
            <span className="text-electric-cyan font-bold text-sm uppercase tracking-wide flex items-center gap-1.5 animate-pulse">
              ● Stop Active
            </span>
          )}
        </div>

        {/* Active Exception Badge */}
        {currentException.type !== "none" && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-red-400 flex items-center justify-between text-xs font-bold uppercase tracking-wider shadow-md">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>
                Exception: {currentException.type.replace("_", " ")}
                {currentException.type === "overflow_trash" && ` (+${currentException.bags} Bags)`}
              </span>
            </span>
            <span className="text-[10px] bg-red-500/20 border border-red-500/35 px-2.5 py-1 rounded-full">
              Surcharge: ${currentException.type === "overflow_trash" ? currentException.bags * 10 : currentException.type === "wildlife_mess" ? 25 : 0}
            </span>
          </div>
        )}

        {/* Address Section */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Service Address</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {stop.address}
          </h1>
        </div>

        {/* Location & Access Code Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0A0F1D]/60 border border-electric-cyan/30 p-5 rounded-2xl">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-electric-cyan mb-1">Bin Location</span>
            <span className="text-xl font-bold text-white">{stop.binLocation}</span>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-electric-cyan mb-1">Access Gate Code</span>
            <span className="text-xl font-mono font-bold text-white">{stop.gateCode}</span>
          </div>
        </div>

        {/* Special Notes - Sunset Amber Warning Box */}
        {stop.specialNotes && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl text-amber-300 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Special Instructions</span>
              <p className="text-lg leading-relaxed font-light">{stop.specialNotes}</p>
            </div>
          </div>
        )}

        {/* Proof of Work Photo Preview */}
        {photoUrl && (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="Captured Proof of Work" className="w-full h-full object-cover" />
            <button 
              onClick={() => setProofPhotos(prev => {
                const next = { ...prev };
                delete next[stop.id];
                return next;
              })}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-emerald-500/90 text-deep-onyx text-xs font-black uppercase py-2 px-4 flex items-center gap-1.5 justify-between">
              <span>✓ Verified Photo Attached</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Operations Action Panel */}
      <div className="space-y-4">
        {proofPhoto ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={proofPhoto} 
              alt="Proof" 
              className="w-full h-48 object-cover rounded-xl mb-4 border border-electric-cyan/30" 
            />
            
            <div className="space-y-3">
              {/* Massive full-width Electric Cyan Submit Button */}
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="w-full h-20 bg-electric-cyan text-deep-onyx hover:bg-electric-cyan/90 active:scale-98 rounded-2xl text-xl font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.4)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-deep-onyx" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Submit & Complete Stop</span>
                  </>
                )}
              </button>

              {/* Secondary Retake Photo Button */}
              <button
                onClick={handleRetakePhoto}
                disabled={isSubmitting}
                className="w-full h-16 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-white rounded-2xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <X className="w-5 h-5 text-red-400" />
                <span>Retake Photo</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Action 1: Ping Customer */}
            <button
              onClick={handlePingCustomer}
              disabled={isPinged || isAlreadyCompleted}
              className={`w-full h-18 px-6 rounded-2xl text-lg font-bold transition-all duration-300 border flex items-center justify-center gap-3 ${
                isPinged
                  ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
                  : isAlreadyCompleted
                  ? "bg-white/5 border-white/10 text-slate-600 cursor-not-allowed"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95"
              }`}
            >
              <MessageSquare className="w-5 h-5 text-electric-cyan" />
              {isPinged ? "Client Notified (SMS Sent)" : "Ping Customer: On My Way"}
            </button>

            {/* Action: Report Exception / Surcharge */}
            <button
              onClick={onOpenExceptionDrawer}
              disabled={isAlreadyCompleted}
              className="w-full h-18 px-6 rounded-2xl text-lg font-bold transition-all duration-300 border border-red-500/20 bg-red-950/10 text-red-400 hover:bg-red-950/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Report Exception / Surcharge</span>
            </button>

            {/* Action 2: First Visit Log GPS Pin */}
            {stop.isFirstVisit && (
              <button
                onClick={handleLogGpsPin}
                disabled={isGpsLogged || gpsStatus === "success" || isAlreadyCompleted}
                className={`w-full h-18 px-6 rounded-2xl text-lg font-bold transition-all duration-300 border flex items-center justify-center gap-3 ${
                  isGpsLogged || gpsStatus === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : gpsStatus === "loading"
                    ? "bg-white/5 border-white/10 text-slate-300 animate-pulse"
                    : gpsStatus === "error"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : isAlreadyCompleted
                    ? "bg-white/5 border-white/10 text-slate-600"
                    : "bg-neon-blue/10 border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                }`}
              >
                {gpsStatus === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-electric-cyan" />
                    <span>Acquiring...</span>
                  </>
                ) : gpsStatus === "error" ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>GPS unavailable in insecure context</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span>
                      {isGpsLogged || gpsStatus === "success"
                        ? "Pin Logged ✅"
                        : "First Visit: Log GPS Pin"}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Action 3: Proof-of-Work Photo Capture */}
            <div className="pt-2">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                id="cameraCapture"
                disabled={isAlreadyCompleted}
                onChange={handlePhotoCapture}
              />
              <label
                htmlFor="cameraCapture"
                className={`w-full h-20 rounded-2xl text-xl font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-lg ${
                  isAlreadyCompleted
                    ? "bg-slate-700/50 text-slate-500 cursor-not-allowed border border-white/5"
                    : "bg-electric-cyan text-deep-onyx hover:bg-electric-cyan/90 active:scale-98 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                }`}
              >
                <Camera className="w-6 h-6" />
                <span>Capture Proof-of-Work</span>
              </label>
            </div>
          </>
        )}
      </div>

      {/* Route Navigation controls */}
      <div className="flex gap-4 items-center justify-between border-t border-white/5 pt-4">
        <button
          onClick={handlePrevStop}
          disabled={currentIndex === 0 || isSubmitting}
          className="h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center"
          aria-label="Previous stop"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">Route Deck</span>
          <span className="text-lg font-black text-white">{currentIndex + 1} of {totalStopsCount} stops</span>
        </div>
        <button
          onClick={handleNextStop}
          disabled={currentIndex === totalStopsCount - 1 || isSubmitting}
          className="h-16 px-6 bg-white/5 border border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center"
          aria-label="Next stop"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </motion.div>
  );
}

interface RunnerAppClientProps {
  initialStops: PropertyStop[];
  dbStatus: string;
  isMock: boolean;
}

export default function RunnerAppClient({ initialStops, dbStatus, isMock }: RunnerAppClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [routeProgress, setRouteProgress] = useState(0);
  const [activeStop, setActiveStop] = useState<PropertyStop>(
    initialStops[0] || {
      id: "none",
      address: "No Active Stops Available",
      gateCode: "",
      binLocation: "",
      isFirstVisit: false
    }
  );
  
  // Interactive UI state
  const [pingedStops, setPingedStops] = useState<string[]>([]);
  const [gpsLoggedStops, setGpsLoggedStops] = useState<string[]>([]);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [loggedCoords, setLoggedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [proofPhotos, setProofPhotos] = useState<Record<string, string>>({});
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [completedStops, setCompletedStops] = useState<string[]>([]);
  
  // Exception and Surcharge states
  const [reportedExceptions, setReportedExceptions] = useState<Record<string, { type: string; bags: number }>>({});
  const [isExceptionDrawerOpen, setIsExceptionDrawerOpen] = useState(false);
  const [tempExceptionType, setTempExceptionType] = useState<string>("none");
  const [tempBagsCount, setTempBagsCount] = useState<number>(0);
  
  // Submission & Completion states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalStops = initialStops.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handlePrevStop = () => {
    if (currentIndex > 0) {
      setProofFile(null);
      setProofPhoto(prevPhoto => {
        if (prevPhoto) {
          const isSaved = Object.values(proofPhotos).includes(prevPhoto);
          if (!isSaved) {
            URL.revokeObjectURL(prevPhoto);
          }
        }
        return null;
      });
      setGpsStatus("idle");
      setLoggedCoords(null);
      const nextIndex = currentIndex - 1;
      setCurrentIndex(nextIndex);
      setActiveStop(initialStops[nextIndex]);
    }
  };

  const handleNextStop = () => {
    if (currentIndex < initialStops.length - 1) {
      setProofFile(null);
      setProofPhoto(prevPhoto => {
        if (prevPhoto) {
          const isSaved = Object.values(proofPhotos).includes(prevPhoto);
          if (!isSaved) {
            URL.revokeObjectURL(prevPhoto);
          }
        }
        return null;
      });
      setGpsStatus("idle");
      setLoggedCoords(null);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setActiveStop(initialStops[nextIndex]);
    }
  };

  const handlePingCustomer = () => {
    if (activeStop.id === "none") return;
    if (pingedStops.includes(activeStop.id)) return;
    setPingedStops(prev => [...prev, activeStop.id]);
    showToast(`SMS sent to customer: "CurbSitter runner is on the way!"`);
  };

  const handleLogGpsPin = () => {
    if (activeStop.id === "none") return;
    if (gpsLoggedStops.includes(activeStop.id) || gpsStatus === "success") return;
    
    setGpsStatus("loading");
    
    try {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        showToast("GPS unavailable in insecure context");
        setGpsStatus("error");
        return;
      }

      if (typeof window !== "undefined" && typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            try {
              const { latitude, longitude } = position.coords;
              console.log(`GPS Coordinate Logged: Lat: ${latitude}, Lng: ${longitude}`);
              
              setLoggedCoords({ latitude, longitude });
              setGpsLoggedStops(prev => [...prev, activeStop.id]);
              setGpsStatus("success");
              showToast("GPS Coordinate Locked & Synced");
            } catch (innerErr) {
              console.error("Error processing position:", innerErr);
              showToast("Failed to process GPS coordinates");
              setGpsStatus("error");
            }
          },
          (error) => {
            console.error("Geolocation Error callback:", error);
            showToast(`GPS Lock Failed: ${error.message}`);
            setGpsStatus("error");
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        showToast("GPS Not Supported by Browser");
        setGpsStatus("error");
      }
    } catch (err) {
      console.error("GPS fatal error:", err);
      showToast("GPS Fatal Error occurred");
      setGpsStatus("error");
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofPhoto(URL.createObjectURL(file));
    }
  };

  const handleComplete = async () => {
    if (activeStop.id === "none") return;
    if (!proofPhoto) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("propertyId", activeStop.id);
      
      if (proofFile) {
        formData.append("photo", proofFile);
      }
      
      if (loggedCoords) {
        formData.append("lat", loggedCoords.latitude.toString());
        formData.append("lng", loggedCoords.longitude.toString());
      }

      // Add Exception and Surcharge details
      const exceptionInfo = reportedExceptions[activeStop.id];
      if (exceptionInfo && exceptionInfo.type !== "none") {
        formData.append("exceptionType", exceptionInfo.type);
        formData.append("surchargeVolume", exceptionInfo.bags.toString());
      }
      
      const result = await submitServiceStop(formData);
      
      if (result.success) {
        let photoPath = proofPhoto;
        if (result.path && process.env.NEXT_PUBLIC_SUPABASE_URL) {
          photoPath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/proof_of_work_photos/${result.path}`;
        }

        if (photoPath) {
          setProofPhotos(prev => ({
            ...prev,
            [activeStop.id]: photoPath
          }));
        }
        
        setCompletedStops(prev => [...prev, activeStop.id]);
        setRouteProgress(prev => Math.min(prev + 1, totalStops));
        setIsCompleted(true);
        showToast("Proof verified and saved!");
      } else {
        console.error("Submission error:", result.error);
        showToast(`Upload failed: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Submit service stop fatal error:", err);
      showToast("Fatal error during stop submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakePhoto = () => {
    setProofPhoto(null);
    setProofFile(null);
  };

  const handleLoadNextStop = () => {
    setIsCompleted(false);
    setProofPhoto(null);
    setProofFile(null);
    setLoggedCoords(null);
    setGpsStatus("idle");
    if (currentIndex < initialStops.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setActiveStop(initialStops[nextIndex]);
    } else {
      showToast("All stops on the route completed!");
    }
  };

  const isPinged = pingedStops.includes(activeStop.id);
  const isGpsLogged = gpsLoggedStops.includes(activeStop.id);
  const photoUrl = proofPhotos[activeStop.id];
  const isAlreadyCompleted = completedStops.includes(activeStop.id);

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070')] bg-fixed bg-cover bg-center font-sans">
      <div className="min-h-screen bg-gradient-to-b from-black/80 via-[#0A0F1D]/90 to-[#0A0F1D] text-white flex flex-col relative overflow-hidden">
        
        {/* Background glow effects for premium contrast */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-cyan/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-neon-blue/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/3" />

        <Header 
          routeProgress={routeProgress} 
          totalStops={totalStops} 
          showMap={showMap} 
          setShowMap={setShowMap} 
        />

        {/* Mock/Status Notification Header */}
        {isMock && (
          <div className="mx-4 mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-400 text-xs text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Using premium mock route. Supabase environment variables are missing or table is empty.</span>
          </div>
        )}

        {/* Dynamic Toast Alerts */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 left-6 right-6 z-50 bg-slate-800 border border-electric-cyan/30 text-white px-5 py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-electric-cyan/15 flex items-center justify-center text-electric-cyan flex-shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-md font-bold">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex flex-col flex-grow p-4 max-w-lg mx-auto w-full relative z-20">
          <AnimatePresence mode="wait">
            {initialStops.length === 0 ? (
              <motion.div
                key="emptyView"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex-grow flex flex-col justify-between"
              >
                <GlassCard className="flex-grow flex flex-col items-center justify-center text-center p-12 space-y-8 min-h-[450px]">
                  <div className="w-24 h-24 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-extrabold uppercase tracking-widest text-white leading-tight">
                      Route Finished
                    </h2>
                    <p className="text-electric-cyan text-xl font-bold uppercase tracking-wider">
                      No active stops for today.
                    </p>
                    <p className="text-slate-400 text-md max-w-sm mx-auto">
                      All customers have been serviced, or there are no active routes scheduled at this time.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ) : isCompleted ? (
              <motion.div
                key="successView"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 flex-grow flex flex-col justify-between"
              >
                <GlassCard className="flex-grow flex flex-col items-center justify-center text-center p-12 space-y-8 min-h-[450px]">
                  <div className="w-24 h-24 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-pulse">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-extrabold uppercase tracking-widest text-white leading-tight">
                      Proof of Work
                    </h2>
                    <p className="text-electric-cyan text-xl font-bold uppercase tracking-wider">
                      Verified & Uploaded
                    </p>
                    <p className="text-slate-400 text-md max-w-sm mx-auto">
                      Timestamped photo and satellite GPS telemetry coordinates successfully synced with Supabase.
                    </p>
                  </div>
                </GlassCard>

                <button
                  onClick={handleLoadNextStop}
                  className="w-full h-20 bg-electric-cyan text-deep-onyx hover:bg-electric-cyan/90 active:scale-98 rounded-2xl text-xl font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                >
                  <span>Load Next Stop</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </motion.div>
            ) : showMap ? (
              <MapPlaceholder setShowMap={setShowMap} />
            ) : (
              <ActiveStopCard 
                stop={activeStop}
                currentIndex={currentIndex}
                totalStopsCount={initialStops.length}
                isAlreadyCompleted={isAlreadyCompleted}
                isPinged={isPinged}
                isGpsLogged={isGpsLogged}
                gpsStatus={gpsStatus}
                proofPhoto={proofPhoto}
                photoUrl={photoUrl}
                isSubmitting={isSubmitting}
                setProofPhotos={setProofPhotos}
                handlePingCustomer={handlePingCustomer}
                handleLogGpsPin={handleLogGpsPin}
                handlePhotoCapture={handlePhotoCapture}
                handleComplete={handleComplete}
                handlePrevStop={handlePrevStop}
                handleNextStop={handleNextStop}
                handleRetakePhoto={handleRetakePhoto}
                currentException={reportedExceptions[activeStop.id] || { type: "none", bags: 0 }}
                onOpenExceptionDrawer={() => {
                  const curr = reportedExceptions[activeStop.id] || { type: "none", bags: 0 };
                  setTempExceptionType(curr.type);
                  setTempBagsCount(curr.bags);
                  setIsExceptionDrawerOpen(true);
                }}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Exception & Surcharge slide-up drawer */}
        <AnimatePresence>
          {isExceptionDrawerOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExceptionDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              />
              
              {/* Drawer panel */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-slate-900 border-t border-white/10 rounded-t-3xl p-6 space-y-6 z-50 shadow-2xl font-sans text-white"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-xl font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Report Exception</span>
                  </h3>
                  <button 
                    onClick={() => setIsExceptionDrawerOpen(false)}
                    className="p-1 rounded-lg border border-white/10 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "none", label: "No Exception / Clear", desc: "Standard service stop" },
                    { id: "gate_locked", label: "Gate Locked", desc: "No perimeter entry possible" },
                    { id: "blocked_access", label: "Blocked Access", desc: "Driveway or bins obstructed" },
                    { id: "overflow_trash", label: "Overflow Trash", desc: "Surcharge: $10.00 / extra bag" },
                    { id: "wildlife_mess", label: "Wildlife / Javelina Mess", desc: "Surcharge: $25.00 cleanup fee" }
                  ].map((opt) => {
                    const isSelected = tempExceptionType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setTempExceptionType(opt.id);
                          if (opt.id !== "overflow_trash") {
                            setTempBagsCount(0);
                          }
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                          isSelected 
                            ? "bg-slate-800 border-red-500 text-white shadow-lg" 
                            : "bg-slate-950/40 border-white/5 text-gray-400 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${isSelected ? "text-red-400" : "text-white"}`}>
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                            {opt.id === "none" ? "clear" : "exception"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-light">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Surcharge volume inputs */}
                {tempExceptionType === "overflow_trash" && (
                  <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 space-y-3">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Select Number of Extra Bags
                    </span>
                    <div className="flex items-center justify-center gap-6">
                      <button
                        onClick={() => setTempBagsCount(prev => Math.max(0, prev - 1))}
                        className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold hover:bg-white/10 active:scale-90"
                      >
                        -
                      </button>
                      <span className="text-3xl font-black text-white w-8 text-center">
                        {tempBagsCount}
                      </span>
                      <button
                        onClick={() => setTempBagsCount(prev => prev + 1)}
                        className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-2xl font-bold hover:bg-white/10 active:scale-90"
                      >
                        +
                      </button>
                    </div>
                    <span className="block text-center text-xs text-red-400 font-semibold mt-1">
                      Total Surcharge: ${tempBagsCount * 10}.00 (Billed to customer)
                    </span>
                  </div>
                )}

                {tempExceptionType === "wildlife_mess" && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center text-red-400 text-xs font-bold uppercase tracking-wide">
                    ⚠️ Driveway Javelina Cleanup Surcharge: $25.00
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setReportedExceptions(prev => ({
                        ...prev,
                        [activeStop.id]: { type: tempExceptionType, bags: tempBagsCount }
                      }));
                      setIsExceptionDrawerOpen(false);
                      showToast(
                        tempExceptionType === "none"
                          ? "Stop status set to clear"
                          : `Logged exception: ${tempExceptionType.replace("_", " ")}`
                      );
                    }}
                    className="w-full h-16 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-lg font-black uppercase tracking-wider transition-all duration-200 active:scale-98"
                  >
                    Apply Exception
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Minimal Bottom Spacer */}
        <div className="h-6" />
      </div>
    </div>
  );
}
