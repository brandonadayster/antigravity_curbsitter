"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_ACCESS_TOKEN } from "@/utils/mapbox";

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

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
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  exception_logged?: string | null;
  surcharge_applied?: number | null;
}

interface AdminMapProps {
  leads: WaitlistLead[];
}

export default function AdminMap({ leads }: AdminMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // initialize map only once

    // Initialize Mapbox map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-112.4685, 34.5400], // Prescott, AZ center
      zoom: 11,
      attributionControl: false,
    });

    // Add navigation controls (zoom, rotate)
    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when leads list or map is loaded
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter leads that have coordinates
    const geocodedLeads = leads.map((lead) => {
      // Return coordinates from db, or fallback to mock coordinates based on ZIP or ID
      let lat = lead.latitude;
      let lng = lead.longitude;

      if (lat === null || lat === undefined || lng === null || lng === undefined) {
        // Fallback coordinates for visual placement of historical or mock items in Prescott, AZ
        if (lead.zip_code === "86301") {
          lat = 34.5582 + (hashCode(lead.id) % 100) * 0.0002;
          lng = -112.4410 + (hashCode(lead.id) % 87) * 0.0002;
        } else if (lead.zip_code === "86303") {
          lat = 34.5312 + (hashCode(lead.id) % 100) * 0.0002;
          lng = -112.4715 + (hashCode(lead.id) % 87) * 0.0002;
        } else if (lead.zip_code === "86305") {
          lat = 34.5814 + (hashCode(lead.id) % 100) * 0.0002;
          lng = -112.4930 + (hashCode(lead.id) % 87) * 0.0002;
        } else {
          // Default Prescott center scattered slightly
          lat = 34.5400 + (hashCode(lead.id) % 100) * 0.0003;
          lng = -112.4685 + (hashCode(lead.id) % 87) * 0.0003;
        }
      }

      return { ...lead, latitude: lat, longitude: lng };
    });

    // Create bounds to fit map to markers if there are any
    if (geocodedLeads.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidCoords = false;

      geocodedLeads.forEach((lead) => {
        const lat = lead.latitude;
        const lng = lead.longitude;

        if (lat !== null && lng !== null) {
          bounds.extend([lng, lat]);
          hasValidCoords = true;

          const isException = lead.exception_logged && lead.exception_logged !== "none";
          const isActive = lead.status === "active";

          // Create custom marker DOM element
          const el = document.createElement("div");
          if (isException) {
            el.className = "marker-exception";
          } else if (isActive) {
            el.className = "marker-active";
          } else {
            el.className = "marker-pending";
          }

          // Create standard popup
          const statusText = isException ? `anomaly: ${lead.exception_logged?.replace('_', ' ')}` : (lead.status || "pending");
          const statusColor = isException ? "#FF3B30" : (isActive ? "#00FFFF" : "#94A3B8");
          const statusBg = isException ? "rgba(255,59,48,0.12)" : (isActive ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.05)");
          const statusBorder = isException ? "rgba(255,59,48,0.25)" : (isActive ? "rgba(0,255,255,0.25)" : "rgba(255,255,255,0.1)");

          const popup = new mapboxgl.Popup({ offset: 15, className: "dark-popup" })
            .setHTML(`
              <div style="color: white; background: #0A0F1D; padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); font-family: sans-serif; min-width: 200px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                  <span style="font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #FFFFFF;">
                    ${lead.first_name} ${lead.last_name}
                  </span>
                  <span style="font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder};">
                    ${statusText}
                  </span>
                </div>
                ${
                  lead.organization_name
                    ? `<div style="font-size: 11px; font-weight: 600; color: #00FFFF; margin-bottom: 4px;">🏢 ${lead.organization_name}</div>`
                    : ""
                }
                <div style="font-size: 11px; color: #94A3B8; margin-bottom: 6px; font-weight: 300;">
                  📍 ${lead.address || `ZIP: ${lead.zip_code || "N/A"}`}
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748B;">
                  <span>👤 ${lead.account_type === "multi_property" ? "B2B Portfolio" : "Residential"}</span>
                  <a href="/customer-dashboard?customerId=${lead.id}" target="_blank" style="color: #00FFFF; text-decoration: underline; font-weight: 600;">Portal ↗</a>
                </div>
              </div>
            `);

          const marker = new mapboxgl.Marker({ element: el })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(map.current!);

          markersRef.current.push(marker);
        }
      });

      // Fit map to bounds (with padding)
      if (hasValidCoords && map.current) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 14,
          duration: 1000,
        });
      }
    }
  }, [leads]);

  // Simple string hashing helper for deterministic coordinates offsets
  function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full rounded-2xl border border-white/5 shadow-2xl" />

      {/* Styled inject block */}
      <style jsx global>{`
        .marker-active {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #00FFFF;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF;
          cursor: pointer;
          animation: pulse-cyan 2s infinite;
          transform: translate(-50%, -50%);
        }

        .marker-exception {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #FF3B30;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px #FF3B30, 0 0 20px #FF3B30;
          cursor: pointer;
          animation: pulse-red 2s infinite;
          transform: translate(-50%, -50%);
        }

        .marker-pending {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #64748B;
          border: 1.5px solid rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        @keyframes pulse-cyan {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(0, 255, 255, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(0, 255, 255, 0);
          }
        }

        @keyframes pulse-red {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(255, 59, 48, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
          }
        }

        /* Mapbox custom dark popup style override */
        .dark-popup .mapboxgl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 16px;
        }
        
        .dark-popup .mapboxgl-popup-tip {
          border-bottom-color: #0A0F1D !important;
          border-top-color: #0A0F1D !important;
          border-left-color: #0A0F1D !important;
          border-right-color: #0A0F1D !important;
        }
        
        .mapboxgl-popup-close-button {
          color: #64748B !important;
          right: 8px !important;
          top: 8px !important;
          font-size: 14px !important;
          padding: 4px !important;
          border-radius: 50% !important;
          background: transparent !important;
          border: none !important;
        }
        
        .mapboxgl-popup-close-button:hover {
          color: #FFFFFF !important;
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
