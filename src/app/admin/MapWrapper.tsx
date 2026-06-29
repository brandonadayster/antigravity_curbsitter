"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./AdminMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0A0F1D] text-slate-400 border border-white/5 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-500 border-t-electric-cyan animate-spin" />
        <span className="text-xs uppercase tracking-wider font-semibold">Initializing Mapbox...</span>
      </div>
    </div>
  ),
});

export default function MapWrapper({ leads }: { leads: any[] }) {
  return <MapComponent leads={leads} />;
}
