"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Navigation, Crown, Building2, Home, 
  Mail, Phone, MapPin, Layers, 
  AlertCircle, Users, Briefcase, Map as MapIcon, Table
} from "lucide-react";
import { StatusDropdown } from "./StatusDropdown";
import { CopyButton } from "./CopyButton";
import "mapbox-gl/dist/mapbox-gl.css";

interface WaitlistLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  zip_code: string | null;
  property_type: string;
  entity_type: string | null;
  organization_name: string | null;
  account_type: string | null;
  portfolio_size: string | null;
  status: string | null;
  created_at: string;
  service_status?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface AdminDashboardClientProps {
  initialLeads: WaitlistLead[];
  fetchError: string | null;
  isMock: boolean;
}

export default function AdminDashboardClient({ 
  initialLeads, 
  fetchError, 
  isMock 
}: AdminDashboardClientProps) {
  const [leads, setLeads] = useState<WaitlistLead[]>(initialLeads);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

  // Dynamic status update sync
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Mapbox Initialization
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapboxToken || !mapContainerRef.current) return;

      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        mapboxgl.accessToken = mapboxToken;

        if (!isMounted) return;

        // Clean up previous map if exists
        if (mapRef.current) {
          mapRef.current.remove();
        }

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [-112.4685, 34.5400], // Prescott, AZ center
          zoom: 11,
          attributionControl: false
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        mapRef.current = map;

        // Render markers once map style loads
        map.on("load", () => {
          if (!isMounted) return;
          renderMarkers(mapboxgl, map);
        });

      } catch (err) {
        console.error("Mapbox load error:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      // Clean up markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leads, mapboxToken]);

  // Render Custom Electric Cyan Markers
  const renderMarkers = (mapboxgl: any, map: any) => {
    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Filter active leads with coordinates
    const activeLeadsWithCoords = leads.filter(
      lead => 
        (lead.service_status?.toLowerCase() === "active" || lead.status?.toLowerCase() === "active") && 
        lead.lat && 
        lead.lng
    );

    if (activeLeadsWithCoords.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    activeLeadsWithCoords.forEach((lead) => {
      const lng = Number(lead.lng);
      const lat = Number(lead.lat);

      if (isNaN(lng) || isNaN(lat)) return;

      // Create Custom HTML element for marker
      const el = document.createElement("div");
      el.className = "group relative flex items-center justify-center cursor-pointer";
      el.style.width = "28px";
      el.style.height = "28px";

      // Cyan outer pulse glow ring
      const pulseRing = document.createElement("div");
      pulseRing.className = "absolute inset-0 rounded-full bg-cyan-500/30 animate-ping pointer-events-none";
      el.appendChild(pulseRing);

      // Cyan solid outer border
      const markerPin = document.createElement("div");
      markerPin.className = "w-6 h-6 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-transform duration-200";
      
      // Cyan inner dot
      const innerDot = document.createElement("div");
      innerDot.className = "w-2.5 h-2.5 rounded-full bg-cyan-400";
      markerPin.appendChild(innerDot);
      el.appendChild(markerPin);

      // Setup Popup
      const popupHTML = `
        <div class="p-3 bg-[#0b111e]/95 text-slate-100 rounded-xl border border-cyan-500/20 shadow-2xl font-sans" style="min-width: 180px;">
          <div class="font-extrabold text-sm uppercase tracking-wide border-b border-white/10 pb-1.5 mb-2 text-cyan-400">
            ${lead.first_name} ${lead.last_name}
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-300 font-light mb-1">
            <span class="font-bold text-slate-400">Address:</span>
            <span>${lead.address || "Prescott, AZ"}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-300 font-light mb-1">
            <span class="font-bold text-slate-400">Account:</span>
            <span>${lead.account_type === "multi_property" ? "VIP B2B" : "B2C Residential"}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-slate-300 font-light">
            <span class="font-bold text-slate-400">Status:</span>
            <span class="capitalize text-emerald-400 font-bold">${lead.status || "active"}</span>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({ 
        offset: 15, 
        closeButton: false,
        className: "custom-mapbox-popup"
      }).setHTML(popupHTML);

      // Create and mount marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    // Fit bounds with padding
    if (activeLeadsWithCoords.length > 0) {
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
        duration: 1000
      });
    }
  };

  // Metrics calculations
  const totalLeads = leads.length;
  const b2bLeads = leads.filter(l => l.account_type === "multi_property").length;
  const b2cLeads = leads.filter(l => l.account_type === "single_home" || !l.account_type).length;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-foreground relative overflow-hidden flex flex-col lg:flex-row">
      {/* Background twilight overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/95 via-[#0a0f1d]/90 to-[#131b2e] pointer-events-none z-0" />
      
      {/* Glow shapes */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-cyan/5 rounded-full blur-[150px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
      
      {/* Left Panel: Metrics & Lead List */}
      <div className="relative z-10 w-full lg:w-7/12 xl:w-8/12 p-6 lg:p-10 overflow-y-auto h-screen flex flex-col justify-between scrollbar-thin">
        <div>
          {/* Header Block */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 border-b border-white/5 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-xs font-semibold uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5" /> Operations Console
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-widest uppercase mt-2">
                CurbSitter Command Center
              </h1>
              <p className="text-sm text-slate-400 font-light">
                Real-time waitlist database records, B2B lead routing, and regional service queue indicators.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-electric-cyan flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Navigation className="w-5 h-5 text-deep-onyx rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white uppercase">
                Curb<span className="text-electric-cyan">Sitter</span>
              </span>
            </div>
          </header>

          {isMock && (
            <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-medium">
                Running in mock local fallback mode. Supabase environment variables are missing in your local scope.
              </p>
            </div>
          )}

          {fetchError && (
            <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-medium">
                Database Fetch Error: {fetchError}. Check your network configurations or Supabase environment variables.
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-electric-cyan/15 border border-electric-cyan/25 flex items-center justify-center text-electric-cyan">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Leads</span>
                <span className="text-2xl font-extrabold text-white mt-0.5 block">{totalLeads}</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">B2B Portfolios</span>
                <span className="text-2xl font-extrabold text-white mt-0.5 block">{b2bLeads}</span>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-slate-500/15 border border-slate-500/25 flex items-center justify-center text-slate-400">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Single Homes</span>
                <span className="text-2xl font-extrabold text-white mt-0.5 block">{b2cLeads}</span>
              </div>
            </div>
          </section>

          {/* Table Container Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-electric-cyan to-transparent pointer-events-none" />
            
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-electric-cyan flex items-center gap-2">
                <Table className="w-4 h-4" /> Lead Management Queue
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full">
                Live Queue
              </span>
            </div>

            <div className="overflow-x-auto max-h-[50vh] overflow-y-auto scrollbar-thin">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md">
                  <tr className="text-[#E5E7EB] border-b border-white/10">
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Submitted</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Contact Name</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Contact Info</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Address / ZIP</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Account Type</th>
                    <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm font-light">
                        No waitlist leads found.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const isB2B = lead.account_type === "multi_property";
                      const rowClass = `border-b border-white/5 transition-all duration-150 relative ${
                        isB2B 
                          ? 'bg-electric-cyan/[0.02] hover:bg-electric-cyan/[0.05]' 
                          : 'hover:bg-white/[0.01]'
                      }`;

                      return (
                        <tr key={lead.id} className={rowClass}>
                          {/* Submitted Date */}
                          <td className="relative px-5 py-4 text-xs text-slate-300 font-light whitespace-nowrap">
                            {isB2B && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                            )}
                            {formatDate(lead.created_at)}
                          </td>

                          {/* Contact Name & Org */}
                          <td className="px-5 py-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#E5E7EB] text-sm whitespace-nowrap">
                                  {lead.first_name} {lead.last_name}
                                </span>
                                {isB2B ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-electric-cyan/20 border border-electric-cyan/35 text-[8px] font-extrabold text-electric-cyan uppercase tracking-wider shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                                    <Crown className="w-2 h-2" /> B2B
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-500/10 border border-white/5 text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                                    Home
                                  </span>
                                )}
                              </div>
                              {isB2B && lead.organization_name && (
                                <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-500" />
                                  {lead.organization_name}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1 text-sm text-[#E5E7EB] hover:text-electric-cyan transition-colors">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <a href={`mailto:${lead.email}`} className="font-light text-xs">{lead.email}</a>
                                </div>
                                <CopyButton text={lead.email} />
                              </div>
                              {lead.phone && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-light">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  <a href={`tel:${lead.phone}`} className="font-light">{lead.phone}</a>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Address / ZIP Code */}
                          <td className="px-5 py-4">
                            {lead.address ? (
                              <div className="space-y-0.5 max-w-[180px] overflow-hidden text-ellipsis">
                                <span className="text-xs font-semibold text-white block whitespace-nowrap">
                                  {lead.address.split(",")[0]}
                                </span>
                                <span className="text-[10px] text-slate-400 font-light block whitespace-nowrap">
                                  {lead.address.split(",").slice(1).join(",").trim()}
                                </span>
                              </div>
                            ) : lead.zip_code ? (
                              <span className="inline-flex items-center gap-1 font-mono text-electric-cyan text-xs font-bold bg-electric-cyan/5 border border-electric-cyan/20 px-2 py-0.5 rounded-lg">
                                <MapPin className="w-3 h-3 text-electric-cyan" />
                                {lead.zip_code}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-light text-xs">—</span>
                            )}
                          </td>

                          {/* Account Type / Property Type */}
                          <td className="px-5 py-4">
                            <div className="space-y-0.5">
                              <span className="text-xs font-medium text-[#E5E7EB] block">
                                {isB2B ? "Business" : "Single Home"}
                              </span>
                              {isB2B && lead.portfolio_size && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-400">
                                  {lead.portfolio_size}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <StatusDropdown recordId={lead.id} currentStatus={lead.status || "pending"} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Control Footer */}
        <footer className="relative z-10 w-full py-6 border-t border-white/5 text-center text-xs text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} CurbSitter Operations LLC. Command access authorized for internal roles only.
        </footer>
      </div>

      {/* Right Panel: Interactive Mapbox Map */}
      <div className="w-full lg:w-5/12 xl:w-4/12 h-[350px] lg:h-screen lg:sticky lg:top-0 border-t lg:border-t-0 lg:border-l border-white/10 relative z-20 bg-slate-950 flex flex-col">
        {/* Map Header Overlay */}
        <div className="absolute top-4 left-4 z-30 bg-[#0A0F1D]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-lg flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-electric-cyan" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Active Regional Service Map</span>
        </div>

        {!mapboxToken ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-slate-900 text-slate-400 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500" />
            <p className="font-bold text-white text-md">Mapbox API Key Missing</p>
            <p className="text-xs max-w-xs font-light">Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to environment variables to render operations map.</p>
          </div>
        ) : (
          <div ref={mapContainerRef} className="flex-grow w-full h-full" />
        )}
      </div>

      <style jsx global>{`
        /* Mapbox Popup custom styling */
        .mapboxgl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .mapboxgl-popup-tip {
          border-bottom-color: rgba(11, 17, 30, 0.95) !important;
          border-top-color: rgba(11, 17, 30, 0.95) !important;
        }
      `}</style>
    </div>
  );
}
