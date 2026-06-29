"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { 
  Home, 
  CreditCard, 
  Shield, 
  MessageSquare, 
  Menu, 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  User, 
  Lock, 
  Bell, 
  AlertTriangle, 
  ExternalLink, 
  Check, 
  PhoneCall, 
  RefreshCw 
} from "lucide-react";
import { GlassCard } from "../../../components/ui/glass-card";
import { 
  toggleVacationHold,
  approveSurcharge,
  updatePropertyAccess
} from "../actions/customerActions";
import { createCustomerPortalSession } from "../actions/stripeActions";

interface Property {
  id: string;
  address: string;
  gate_code: string | null;
  lockbox_combination?: string | null;
  bin_location: string;
  special_notes: string | null;
  customer_id?: string | null;
}

interface ServiceLog {
  id: string;
  created_at: string;
  photo_url: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
}

interface CustomerDashboardProps {
  initialProperty: Property;
  initialServiceLog: ServiceLog;
  dbStatus: string;
  initialServiceStatus?: string;
  initialActiveException?: any;
}

export default function CustomerDashboard({
  initialProperty,
  initialServiceLog,
  dbStatus,
  initialServiceStatus = "Active",
  initialActiveException = null,
}: CustomerDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Active tab derived from URL query parameters (defaults to 'overview')
  const activeTab = searchParams.get("tab") || "overview";

  // Sidebar mobile drawer status
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Service Preferences State
  const [vacationHold, setVacationHold] = useState(initialServiceStatus === "Paused");
  const [showHoldWarning, setShowHoldWarning] = useState(initialServiceStatus === "Paused");

  // Property Form State
  const [gateCode, setGateCode] = useState(initialProperty.gate_code || "");
  const [lockboxInfo, setLockboxInfo] = useState("");
  const [smsOptInRollout, setSmsOptInRollout] = useState(true);
  const [smsOptInPOW, setSmsOptInPOW] = useState(true);
  const [smsOptInHolidays, setSmsOptInHolidays] = useState(true);

  // Exception handling states
  const [activeException, setActiveException] = useState<any>(initialActiveException);
  const [newGatePin, setNewGatePin] = useState<string>("");

  // Interactive UI Statuses
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [isBillingPortalLoading, setIsBillingPortalLoading] = useState(false);

  // Temporary message dismiss timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToastType(type);
    setToastMessage(message);
  };

  // Switch tabs using Next.js router transitions (enables deep links)
  const handleTabChange = (tabName: string) => {
    setMobileMenuOpen(false);
    startTransition(() => {
      router.push(`/customer-dashboard?tab=${tabName}`);
    });
  };

  // Vacation Hold Switch Controller
  const handleVacationToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const userId = initialProperty.customer_id || "mock-user-id";

    // Optimistically update UI
    setVacationHold(checked);
    setShowHoldWarning(checked);

    startTransition(async () => {
      const result = await toggleVacationHold(userId, checked);
      if (!result.success) {
        // Rollback state on failure
        setVacationHold(!checked);
        setShowHoldWarning(!checked);
        showToast(result.error || "Failed to update service status", "error");
      } else {
        if (checked) {
          showToast("Vacation Hold activated", "info");
        } else {
          showToast("Vacation Hold suspended. Normal service resumes.", "success");
        }
      }
    });
  };

  // Handle Stripe customer portal session redirection
  const handleManageSubscription = async () => {
    const userId = initialProperty.customer_id || "mock-user-id";
    setIsBillingPortalLoading(true);
    try {
      const result = await createCustomerPortalSession(userId);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        showToast(result.error || "Failed to launch billing portal.", "error");
      }
    } catch (err) {
      console.error("Billing portal error:", err);
      showToast("An unexpected error occurred loading the billing portal.", "error");
    } finally {
      setIsBillingPortalLoading(false);
    }
  };

  // Surcharge Approval Handler
  const handleApproveSurcharge = () => {
    if (!activeException) return;
    
    startTransition(async () => {
      const result = await approveSurcharge(activeException.id);
      if (result.success) {
        showToast("Surcharge approved successfully. Thank you!", "success");
        setActiveException(null);
      } else {
        showToast(result.error || "Failed to approve surcharge", "error");
      }
    });
  };

  // Resolve Gate Code Exception Handler
  const handleResolveGateCode = () => {
    if (!activeException || !newGatePin.trim()) return;

    startTransition(async () => {
      const result = await updatePropertyAccess(
        initialProperty.id, 
        newGatePin.trim(), 
        initialProperty.lockbox_combination || ""
      );
      if (result.success) {
        showToast("Access code updated and exception resolved!", "success");
        setGateCode(newGatePin.trim());
        setActiveException(null);
      } else {
        showToast(result.error || "Failed to update gate code", "error");
      }
    });
  };

  // Save Access credentials handler
  const handleSaveAccessInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateCode.trim()) {
      showToast("Gate code is required (or enter N/A)", "error");
      return;
    }

    startTransition(async () => {
      const result = await updatePropertyAccess(
        initialProperty.id,
        gateCode.trim(),
        lockboxInfo.trim()
      );
      if (result.success) {
        showToast("Access coordinates and preferences updated successfully!", "success");
        if (activeException && activeException.exception_logged === "gate_locked") {
          setActiveException(null);
        }
      } else {
        showToast(result.error || "Failed to save configuration details", "error");
      }
    });
  };

  // Navigation Links Definition
  const navigationItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "billing", label: "Billing & Invoices", icon: CreditCard },
    { id: "property", label: "Property & Access", icon: Shield },
    { id: "support", label: "Support Desk", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-1 relative z-10">
      
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0B111E]/95 border-r border-white/5 p-6 justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 px-2">
            <div className="h-9 w-9 bg-gradient-to-br from-electric-cyan to-neon-blue rounded-xl flex items-center justify-center shadow-lg shadow-electric-cyan/20">
              <span className="font-bold text-white text-base">C</span>
            </div>
            <div>
              <span className="font-semibold text-lg text-[#E5E7EB] tracking-wider uppercase">CurbSitter</span>
              <span className="block text-[10px] text-electric-cyan font-medium tracking-widest uppercase -mt-1">Concierge Portal</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative group ${
                    isActive 
                      ? "text-white bg-white/5 shadow-inner" 
                      : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Left Indicator Stripe */}
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-electric-cyan rounded-r-md" />
                  )}
                  <Icon className={`h-4 w-4 ${isActive ? "text-electric-cyan" : "text-gray-400 group-hover:text-electric-cyan"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info / Session Status */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center space-x-3 px-2">
            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-300">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-sm font-medium text-[#E5E7EB] truncate">Brandon</span>
              <span className="block text-[10px] text-gray-500 truncate">Customer Account</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2 text-[10px] text-gray-500">
            <span>Database Connection</span>
            <span className="flex items-center space-x-1">
              <span className={`h-2 w-2 rounded-full ${dbStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className="capitalize">{dbStatus}</span>
            </span>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm">
          <div className="w-72 bg-[#0A0F1D] border-r border-white/10 p-6 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 bg-gradient-to-br from-electric-cyan to-neon-blue rounded-xl flex items-center justify-center">
                    <span className="font-bold text-white text-base">C</span>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-[#E5E7EB] tracking-wider uppercase">CurbSitter</span>
                    <span className="block text-[10px] text-electric-cyan font-medium uppercase -mt-1">Concierge</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg border border-white/10 text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                        isActive 
                          ? "text-white bg-white/5 border border-white/10" 
                          : "text-gray-400 hover:text-white hover:bg-white/[0.02]"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-electric-cyan" : "text-gray-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center space-x-3 px-2">
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-300">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-[#E5E7EB]">Brandon</span>
                  <span className="block text-[10px] text-gray-500">Customer Account</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        
        {/* Header Toolbar */}
        <header className="sticky top-0 z-30 bg-[#0A0F1D]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-white/10 text-gray-300 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[#E5E7EB] capitalize tracking-wide">
                {activeTab === "overview" ? "Account Overview" : activeTab.replace("-", " ")}
              </h1>
              <span className="hidden sm:inline block text-xs text-gray-400">
                Service Address: <strong className="text-gray-300">{initialProperty.address}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sync spinner */}
            {isPending && (
              <RefreshCw className="h-4 w-4 text-electric-cyan animate-spin" />
            )}
            
            <button className="relative p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-electric-cyan shadow-md shadow-electric-cyan/50" />
            </button>
          </div>
        </header>

        {/* View Render Area */}
        <div className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Active Toast Alerts */}
          {toastMessage && (
            <div className={`p-4 rounded-xl border flex items-center space-x-3 shadow-lg animate-in fade-in duration-300 ${
              toastType === "success" 
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : toastType === "error"
                ? "bg-rose-950/40 border-rose-500/30 text-rose-300"
                : "bg-cyan-950/40 border-cyan-500/30 text-cyan-300"
            }`}>
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="text-sm">{toastMessage}</span>
            </div>
          )}

          {/* Active Exception Alert Center Banner */}
          {activeException && (
            <div className="p-6 rounded-2xl border border-red-500 bg-red-950/20 text-white relative shadow-xl overflow-hidden animate-in fade-in duration-300">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-red-400">
                      Action Required: Route Exception
                    </h3>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
                      {activeException.exception_logged === "gate_locked" && (
                        <>
                          <strong>Gate access code issue:</strong> Our valet runner encountered a locked gate or invalid access credentials at your property on {new Date(activeException.created_at).toLocaleDateString()}. Please update your gate access details below to auto-resolve this issue.
                        </>
                      )}
                      {activeException.exception_logged === "blocked_access" && (
                        <>
                          <strong>Access blocked:</strong> Our runner could not reach your bins due to a physical obstruction (e.g. parked vehicle or construction) on {new Date(activeException.created_at).toLocaleDateString()}. No action is required, but please ensure access is clear for your next rollout.
                        </>
                      )}
                      {activeException.exception_logged === "overflow_trash" && (
                        <>
                          <strong>Overflow waste surcharge:</strong> Our runner logged extra bins/bags at your property on {new Date(activeException.created_at).toLocaleDateString()}. A pending surcharge of <strong>${Number(activeException.surcharge_applied).toFixed(2)}</strong> requires your approval to process.
                        </>
                      )}
                      {activeException.exception_logged === "wildlife_mess" && (
                        <>
                          <strong>Driveway cleanup surcharge:</strong> Our runner logged and cleaned up a wildlife/javelina trash mess at your property on {new Date(activeException.created_at).toLocaleDateString()}. A pending surcharge of <strong>$25.00</strong> requires your approval to process.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 shrink-0">
                  {/* Approval button for surcharges */}
                  {(activeException.exception_logged === "overflow_trash" || activeException.exception_logged === "wildlife_mess") && (
                    <button
                      onClick={handleApproveSurcharge}
                      disabled={isPending}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isPending ? "Processing..." : "Approve & Pay Surcharge"}
                    </button>
                  )}

                  {/* Inline code updater for gate locked */}
                  {activeException.exception_logged === "gate_locked" && (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter new gate PIN" 
                        value={newGatePin}
                        onChange={(e) => setNewGatePin(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 w-44"
                      />
                      <button
                        onClick={handleResolveGateCode}
                        disabled={isPending || !newGatePin.trim()}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isPending ? "Saving..." : "Update & Resolve"}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveException(null)}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Service Proof Card */}
              <div className="lg:col-span-2 space-y-6">
                <GlassCard className="overflow-hidden p-0 border border-white/10 bg-white/5 relative">
                  
                  {/* Photo Canvas */}
                  <div className="relative h-96 w-full bg-slate-950 flex items-center justify-center group overflow-hidden">
                    {initialServiceLog.photo_url ? (
                      <>
                        <Image
                          src={initialServiceLog.photo_url}
                          alt="Proof-of-Work verification photo"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 66vw"
                        />
                        {/* Premium brand color overlay tint */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-electric-cyan/10 mix-blend-color pointer-events-none" />
                      </>
                    ) : (
                      <>
                        {/* Premium duotone lifestyle fallback banner */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] to-[#131B2E] pointer-events-none" />
                        <div className="absolute inset-0 bg-electric-cyan/20 mix-blend-color pointer-events-none" />
                        <div className="relative z-10 text-center px-6">
                          <div className="h-16 w-16 bg-white/5 rounded-full border border-white/15 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                            <Shield className="h-8 w-8" />
                          </div>
                          <h3 className="text-lg font-semibold text-[#E5E7EB] tracking-wide">Verification Image Loading</h3>
                          <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2">
                            The latest valet service is complete. A high-resolution Proof-of-Work snapshot will appear here.
                          </p>
                        </div>
                      </>
                    )}

                    {/* HUD Metadata Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <span className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
                        <CheckCircle2 className="h-3.5 w-3.5 text-electric-cyan" />
                        <span>Bins Returned & Locked</span>
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white">
                      <div className="flex items-center space-x-2 text-xs bg-black/50 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 w-fit">
                        <Clock className="h-3.5 w-3.5 text-electric-cyan" />
                        <span>Completed: {new Date(initialServiceLog.created_at).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}</span>
                      </div>
                      
                      {initialServiceLog.lat && initialServiceLog.lng && (
                        <div className="flex items-center space-x-2 text-xs bg-black/50 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10 w-fit">
                          <Lock className="h-3.5 w-3.5 text-electric-cyan" />
                          <span>GPS Pin: {initialServiceLog.lat.toFixed(4)}° N, {initialServiceLog.lng.toFixed(4)}° W</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#E5E7EB] tracking-wide">Most Recent Proof of Work</h3>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                      Every single checkout is cataloged with GPS coordinate matching and a timestamped high-resolution photo. This is our undeniable Proof-of-Work guarantee, keeping you in full compliance with HOA guidelines.
                    </p>
                  </div>
                </GlassCard>
              </div>

              {/* Status & Service Management Sidebar */}
              <div className="space-y-6">
                
                {/* Next Pickup Card */}
                <GlassCard className="p-6 border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-gray-400">Next Rollout</h3>
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-cyan opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-electric-cyan"></span>
                    </span>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-electric-cyan shrink-0">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block text-2xl font-bold text-white tracking-wide">Thursday</span>
                      <span className="block text-sm text-gray-400">June 25, 2026</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Service Plan:</span>
                      <span className="font-semibold text-gray-300">Dual Rollout & Return</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Trash Collection:</span>
                      <span className="font-semibold text-gray-300">Scheduled (Weekly)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Recycle Collection:</span>
                      <span className="font-semibold text-gray-300">Scheduled (Weekly)</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Vacation / Snowbird Hold */}
                <GlassCard className="p-6 border border-white/10 bg-white/5 relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold tracking-widest uppercase text-gray-400">Service Hold</h3>
                      <span className="text-xs text-gray-500 block mt-1">Snowbird / Vacation Hold Toggle</span>
                    </div>
                    
                    {/* Toggle Slider */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={vacationHold} 
                        onChange={handleVacationToggle}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-electric-cyan/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:bg-white peer-checked:bg-electric-cyan"></div>
                    </label>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Pauses all valet bin movements for your property during travel. Normal billing resumes when reactivated.
                    </p>
                  </div>

                  {/* Warning Banner */}
                  {showHoldWarning && (
                    <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/20 text-amber-300 rounded-xl flex items-start space-x-2 text-[11px] leading-relaxed">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>
                        <strong>Hold Active:</strong> Valet runners will bypass this property. Switch this off to restore service.
                      </span>
                    </div>
                  )}

                  {/* Disclaimer Text */}
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                      * Service pauses or cancellations must be made more than 24 hours prior to your next scheduled billing date to avoid incurring additional charges.
                    </p>
                  </div>
                </GlassCard>
              </div>

            </div>
          )}

          {/* TAB 2: BILLING */}
          {activeTab === "billing" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Invoice History Grid */}
              <div className="lg:col-span-2">
                <GlassCard className="p-6 border border-white/10 bg-white/5">
                  <h3 className="text-base font-semibold text-[#E5E7EB] tracking-wide mb-6">Payment History</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500 font-semibold text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Invoice #</th>
                          <th className="py-3 px-4">Billing Date</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr className="text-gray-300 hover:bg-white/[0.01]">
                          <td className="py-4 px-4 font-mono text-xs">INV-2026-003</td>
                          <td className="py-4 px-4">Jun 15, 2026</td>
                          <td className="py-4 px-4">$49.00</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                              Paid
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button className="text-xs text-electric-cyan hover:text-cyan-400 font-medium transition-colors">Download</button>
                          </td>
                        </tr>
                        <tr className="text-gray-300 hover:bg-white/[0.01]">
                          <td className="py-4 px-4 font-mono text-xs">INV-2026-002</td>
                          <td className="py-4 px-4">May 15, 2026</td>
                          <td className="py-4 px-4">$49.00</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                              Paid
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button className="text-xs text-electric-cyan hover:text-cyan-400 font-medium transition-colors">Download</button>
                          </td>
                        </tr>
                        <tr className="text-gray-300 hover:bg-white/[0.01]">
                          <td className="py-4 px-4 font-mono text-xs">INV-2026-001</td>
                          <td className="py-4 px-4">Apr 15, 2026</td>
                          <td className="py-4 px-4">$49.00</td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                              Paid
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button className="text-xs text-electric-cyan hover:text-cyan-400 font-medium transition-colors">Download</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>

              {/* Stripe Subscription Controls */}
              <div className="space-y-6">
                <GlassCard className="p-6 border border-white/10 bg-white/5 flex flex-col justify-between h-fit">
                  <div>
                    <h3 className="text-sm font-semibold tracking-widest uppercase text-gray-400 mb-4">Subscription Plan</h3>
                    
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 mb-6">
                      <span className="block text-xs text-gray-400">Current Plan:</span>
                      <strong className="block text-lg text-white font-semibold mt-1">Premium Weekly Valet</strong>
                      <span className="block text-2xl font-black text-electric-cyan mt-2">$49.00<span className="text-xs text-gray-400 font-normal">/month</span></span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Check className="h-4 w-4 text-electric-cyan shrink-0" />
                        <span>Bins out & returned weekly</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Check className="h-4 w-4 text-electric-cyan shrink-0" />
                        <span>Timestamped photo verification</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Check className="h-4 w-4 text-electric-cyan shrink-0" />
                        <span>HOA compliance guarantee</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                    {/* Placeholder space for Stripe Customer Portal Integration */}
                    <button 
                      onClick={handleManageSubscription}
                      disabled={isBillingPortalLoading}
                      className="w-full h-12 bg-gradient-to-r from-electric-cyan to-neon-blue hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-cyan-500/20 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBillingPortalLoading ? (
                        <span>Loading Portal...</span>
                      ) : (
                        <>
                          <span>Manage Subscription</span>
                          <ExternalLink className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <span className="block text-[10px] text-gray-500 text-center">
                      Payments secured via Stripe. Auto-renewing plan.
                    </span>
                  </div>
                </GlassCard>
              </div>

            </div>
          )}

          {/* TAB 3: PROPERTY DETAILS */}
          {activeTab === "property" && (
            <div className="max-w-3xl mx-auto">
              <GlassCard className="p-6 border border-white/10 bg-white/5">
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-[#E5E7EB] tracking-wide">Property Credentials & Preferences</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Update gate PIN numbers, key storage parameters, and dispatch message notifications.
                  </p>
                </div>

                <form onSubmit={handleSaveAccessInfo} className="space-y-6">
                  
                  {/* Gate access code */}
                  <div className="space-y-2">
                    <label htmlFor="gateCode" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Gate / Entry Access Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input 
                        type="text" 
                        id="gateCode"
                        value={gateCode}
                        onChange={(e) => setGateCode(e.target.value)}
                        placeholder="e.g. #1234 or Code 99"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-[#E5E7EB] focus:border-electric-cyan/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <span className="block text-[10px] text-gray-500">
                      Used by dispatch and valet runners to enter the property perimeter securely.
                    </span>
                  </div>

                  {/* Lockbox / Key Access info */}
                  <div className="space-y-2">
                    <label htmlFor="lockboxInfo" className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Lockbox or Key Storage Info (Optional)
                    </label>
                    <textarea 
                      id="lockboxInfo"
                      value={lockboxInfo}
                      onChange={(e) => setLockboxInfo(e.target.value)}
                      placeholder="e.g. Key is in lockbox beside garden hose, code 8820"
                      rows={3}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-sm text-[#E5E7EB] focus:border-electric-cyan/50 focus:outline-none transition-colors"
                    />
                    <span className="block text-[10px] text-gray-500">
                      Only visible to verified valet runners coordinates assigned to your service route.
                    </span>
                  </div>

                  {/* Notification preferences */}
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      SMS Telemetry Preferences
                    </h4>
                    
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={smsOptInRollout}
                          onChange={(e) => setSmsOptInRollout(e.target.checked)}
                          className="h-4 w-4 rounded border-white/10 text-electric-cyan focus:ring-electric-cyan/30 bg-slate-900"
                        />
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                          Notify me via text when my bins have been rolled out to the curb
                        </span>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={smsOptInPOW}
                          onChange={(e) => setSmsOptInPOW(e.target.checked)}
                          className="h-4 w-4 rounded border-white/10 text-electric-cyan focus:ring-electric-cyan/30 bg-slate-900"
                        />
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                          Text me timestamped photo confirmations when bins are returned & locked
                        </span>
                      </label>

                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={smsOptInHolidays}
                          onChange={(e) => setSmsOptInHolidays(e.target.checked)}
                          className="h-4 w-4 rounded border-white/10 text-electric-cyan focus:ring-electric-cyan/30 bg-slate-900"
                        />
                        <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                          Notify me of holiday schedule adjustments or local route exceptions
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Save CTA */}
                  <div className="pt-4 border-t border-white/5">
                    <button 
                      type="submit"
                      className="h-12 w-full bg-electric-cyan hover:bg-cyan-500 text-black font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-cyan-500/25 active:scale-98 cursor-pointer"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </GlassCard>
            </div>
          )}

          {/* TAB 4: SUPPORT */}
          {activeTab === "support" && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Emergency dispatch banner */}
              <GlassCard className="p-6 border border-amber-500/25 bg-amber-950/20 text-amber-300 relative">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Emergency Route Escalation</h3>
                    <p className="text-xs text-amber-400/80 mt-1 leading-relaxed">
                      Did the waste collector skip your bin or dump trash on your property? If you require urgent valet cleanup or re-rollout assistance, escalate a priority dispatch ticket here.
                    </p>
                    <button 
                      onClick={() => showToast("Emergency dispatch ticket opened. A coordinator has been alerted.", "success")}
                      className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Escalate Dispatch Ticket
                    </button>
                  </div>
                </div>
              </GlassCard>

              {/* Coordinator contact */}
              <GlassCard className="p-6 border border-white/10 bg-white/5">
                <h3 className="text-base font-semibold text-[#E5E7EB] tracking-wide mb-4">Contact Your Concierge Coordinator</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  Need custom vacation dates, multi-bin arrangements, or billing exceptions? Drop a direct message or call your dedicated CurbSitter route coordinator.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href="tel:5202259713"
                    className="flex items-center space-x-3 p-4 rounded-xl border border-white/5 bg-slate-900/50 hover:bg-slate-900 hover:border-electric-cyan/30 transition-all text-[#E5E7EB] group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-electric-cyan/10 border border-electric-cyan/20 flex items-center justify-center text-electric-cyan group-hover:bg-electric-cyan/20">
                      <PhoneCall className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">Direct Route Call</span>
                      <strong className="block text-sm group-hover:text-electric-cyan font-bold transition-colors">(520) 225-9713</strong>
                    </div>
                  </a>

                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-white/5 bg-slate-900/50">
                    <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="block text-xs text-gray-400">Online Chat Support</span>
                      <strong className="block text-sm text-gray-300">Mon - Fri, 8AM - 5PM</strong>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
