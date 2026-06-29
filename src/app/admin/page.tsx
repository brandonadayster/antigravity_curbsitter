import React from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Navigation, Crown, Building2, Home, 
  Mail, Phone, MapPin, Layers, 
  AlertCircle, Users, Briefcase
} from "lucide-react";
import { StatusDropdown } from "./StatusDropdown";
import { CopyButton } from "./CopyButton";
import MapWrapper from "./MapWrapper";

export const dynamic = 'force-dynamic';
export const revalidate = 0; // force dynamic rendering

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
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  exception_logged?: string | null;
  surcharge_applied?: number | null;
  latest_log_status?: string | null;
  latest_log_date?: string | null;
}

export default async function AdminPage() {
  console.log("--- RENDERING ADMIN DASHBOARD (SERVER SIDE) ---");

  // 1. Initialize Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = supabaseUrl && supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey) 
    : null;

  let leads: WaitlistLead[] = [];
  let fetchError: string | null = null;
  let isMock = false;

  // 2. Fetch Data
  if (supabase) {
    try {
      const { data: waitlistData, error: leadsError } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (leadsError) {
        throw leadsError;
      }

      const { data: logsData, error: logsError } = await supabase
        .from("service_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (logsError) {
        console.warn("Failed to fetch service logs for admin dashboard:", logsError);
      }

      if (waitlistData) {
        leads = waitlistData.map((lead: any) => {
          const propertyLogs = (logsData || []).filter(l => l.property_id === lead.id);
          const latestLog = propertyLogs[0] || null;
          const activeExceptionLog = propertyLogs.find(l => l.exception_resolved === false && l.exception_logged && l.exception_logged !== "none");

          return {
            ...lead,
            exception_logged: activeExceptionLog ? activeExceptionLog.exception_logged : null,
            surcharge_applied: activeExceptionLog ? activeExceptionLog.surcharge_applied : 0.00,
            latest_log_status: latestLog ? latestLog.status : null,
            latest_log_date: latestLog ? latestLog.created_at : null
          };
        });
      }
    } catch (err) {
      console.error("Supabase fetch error:", err);
      fetchError = err instanceof Error ? err.message : "Database fetch failed.";
    }
  } else {
    isMock = true;
    // Premium Mock Leads Fallback for Dev Mode
    leads = [
      {
        id: "1",
        first_name: "Bruce",
        last_name: "Wayne",
        email: "bruce@waynecorp.com",
        phone: "(928) 555-1939",
        zip_code: null,
        property_type: "Property Management",
        entity_type: "Property Management",
        organization_name: "Wayne Enterprises Estates",
        account_type: "multi_property",
        portfolio_size: "50+ Properties",
        status: "pending",
        created_at: "2026-06-20T10:15:00.000Z",
        address: "1001 E Gurley St, Prescott, AZ 86301",
        latitude: 34.5441,
        longitude: -112.4518
      },
      {
        id: "2",
        first_name: "Clark",
        last_name: "Kent",
        email: "clark@dailyplanet.com",
        phone: "(928) 555-1938",
        zip_code: "86302",
        property_type: "residential",
        entity_type: "residential",
        organization_name: null,
        account_type: "single_home",
        portfolio_size: null,
        status: "pending",
        created_at: "2026-06-19T14:30:00.000Z",
        address: "220 W Goodwin St, Prescott, AZ 86303",
        latitude: 34.5412,
        longitude: -112.4715,
        exception_logged: "gate_locked",
        surcharge_applied: 0.00
      },
      {
        id: "3",
        first_name: "Diana",
        last_name: "Prince",
        email: "diana@themyscira.gov",
        phone: "(928) 555-1212",
        zip_code: null,
        property_type: "HOA/Community Board",
        entity_type: "HOA/Community Board",
        organization_name: "Themyscira Sanctuary HOA",
        account_type: "multi_property",
        portfolio_size: "16-50 Properties",
        status: "pending",
        created_at: "2026-06-19T09:12:00.000Z",
        address: "1200 Commerce Dr, Prescott, AZ 86305",
        latitude: 34.5714,
        longitude: -112.4930
      },
      {
        id: "4",
        first_name: "Tony",
        last_name: "Stark",
        email: "tony@starkindustries.com",
        phone: "(928) 555-3000",
        zip_code: null,
        property_type: "Short-Term Rental Host",
        entity_type: "Short-Term Rental Host",
        organization_name: "Stark Luxury Rentals",
        account_type: "multi_property",
        portfolio_size: "6-15 Properties",
        status: "active",
        created_at: "2026-06-18T16:45:00.000Z",
        address: "300 S Montezuma St, Prescott, AZ 86303",
        latitude: 34.5398,
        longitude: -112.4705,
        exception_logged: "overflow_trash",
        surcharge_applied: 20.00
      },
      {
        id: "5",
        first_name: "Selina",
        last_name: "Kyle",
        email: "selina@gotham.org",
        phone: null,
        zip_code: "86301",
        property_type: "residential",
        entity_type: "residential",
        organization_name: null,
        account_type: "single_home",
        portfolio_size: null,
        status: "active",
        created_at: "2026-06-17T11:22:00.000Z",
        address: "1901 Prescott Lakes Pkwy, Prescott, AZ 86301",
        latitude: 34.5682,
        longitude: -112.4410
      }
    ];
  }

  // Calculate Metrics
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
    <div className="min-h-screen bg-[#0A0F1D] text-foreground flex flex-col md:flex-row relative overflow-hidden">
      {/* Left side panel (40%) */}
      <div className="w-full md:w-[40%] flex flex-col h-[50vh] md:h-screen border-b md:border-b-0 md:border-r border-white/5 overflow-y-auto p-6 md:p-8 z-10 custom-scrollbar relative">
        {/* Glow shapes inside left pane */}
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-electric-cyan/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
        
        <div className="relative z-10 flex-grow space-y-8">
          {/* Header Block */}
          <header className="flex items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-electric-cyan text-[10px] font-semibold uppercase tracking-widest">
                <Layers className="w-3 h-3" /> Console
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-wider uppercase mt-1">
                CurbSitter Command
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-electric-cyan flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                <Navigation className="w-4 h-4 text-deep-onyx rotate-45" />
              </div>
            </div>
          </header>

          {isMock && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-amber-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-[11px] font-medium leading-relaxed">
                Running in mock local fallback mode. Supabase environment variables are missing.
              </p>
            </div>
          )}

          {fetchError && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-[11px] font-medium leading-relaxed">
                Database Fetch Error: {fetchError}. Check your local Supabase configurations.
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <section className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Leads</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{totalLeads}</span>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">B2B</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{b2bLeads}</span>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Single</span>
              <span className="text-2xl font-extrabold text-white mt-1 block">{b2cLeads}</span>
            </div>
          </section>

          {/* Table Container Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-electric-cyan">Lead Queue</h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-black/20 text-[#E5E7EB]">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">Submitted</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">Contact Name</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">Contact Info</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">ZIP Code</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">Account Type</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">Portfolio</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs font-light">
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
                          <td className="relative px-4 py-4 text-[11px] text-slate-300 font-light whitespace-nowrap">
                            {isB2B && (
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-electric-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                            )}
                            {formatDate(lead.created_at)}
                          </td>

                          {/* Contact Name & Org */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#E5E7EB] text-xs whitespace-nowrap">
                                  {lead.first_name} {lead.last_name}
                                </span>
                                <a 
                                  href={`/customer-dashboard?customerId=${lead.id}`} 
                                  target="_blank"
                                  rel="noopener noreferrer" 
                                  className="text-[9px] text-slate-500 hover:text-electric-cyan underline font-medium transition-colors"
                                >
                                  Portal ↗
                                </a>
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
                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-slate-500" />
                                  {lead.organization_name}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1">
                                <div className="flex items-center gap-1 text-xs text-[#E5E7EB] hover:text-electric-cyan transition-colors">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <a href={`mailto:${lead.email}`} className="font-light text-[11px]">{lead.email}</a>
                                </div>
                                <CopyButton text={lead.email} />
                              </div>
                              {lead.phone && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-light">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  <a href={`tel:${lead.phone}`} className="font-light">{lead.phone}</a>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* ZIP Code */}
                          <td className="px-4 py-4 text-center">
                            {lead.zip_code ? (
                              <span className="inline-flex items-center gap-0.5 font-mono text-electric-cyan text-xs font-bold bg-electric-cyan/5 border border-electric-cyan/20 px-2 py-0.5 rounded-lg">
                                <MapPin className="w-3 h-3 text-electric-cyan" />
                                {lead.zip_code}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-light text-[11px]">—</span>
                            )}
                          </td>

                          {/* Account Type / Property Type */}
                          <td className="px-4 py-4">
                            <div className="space-y-0.5">
                              <span className="text-xs font-medium text-[#E5E7EB] block">
                                {isB2B ? "Business" : "Single Home"}
                              </span>
                              {isB2B && lead.property_type && (
                                <span className="text-[10px] text-slate-400 font-light block">
                                  {lead.property_type}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Portfolio Size */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            {isB2B && lead.portfolio_size ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                                <Briefcase className="w-3 h-3 text-amber-500" />
                                {lead.portfolio_size}
                              </span>
                            ) : (
                              <span className="text-slate-600 font-light text-[11px]">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-1.5">
                              <StatusDropdown recordId={lead.id} currentStatus={lead.status || "pending"} />
                              {lead.exception_logged && lead.exception_logged !== "none" && (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-[8px] font-extrabold text-red-400 uppercase tracking-wider shadow-[0_0_8px_rgba(239,68,68,0.15)]">
                                    ⚠ Anomaly
                                  </span>
                                  <span className="block text-[8px] text-red-400/80 font-bold capitalize">
                                    {lead.exception_logged.replace("_", " ")}
                                  </span>
                                  {lead.surcharge_applied && Number(lead.surcharge_applied) > 0 && (
                                    <span className="block text-[8px] text-red-400 font-semibold">
                                      +${Number(lead.surcharge_applied).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <footer className="py-4 text-[10px] text-slate-500 font-light leading-normal">
            &copy; {new Date().getFullYear()} CurbSitter Operations LLC. Authorized access only.
          </footer>
        </div>
      </div>

      {/* Right side interactive map (60%) */}
      <div className="w-full md:w-[60%] h-[50vh] md:h-screen relative bg-deep-onyx z-10">
        <MapWrapper leads={leads} />
      </div>
    </div>
  );
}
