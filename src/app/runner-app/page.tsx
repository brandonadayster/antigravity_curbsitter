export const dynamic = "force-dynamic";
export const revalidate = 0; // force dynamic rendering

import React from "react";
import { createClient } from "@supabase/supabase-js";
import RunnerAppClient from "./RunnerAppClient";
import { PropertyStop } from "@/types/operations";

export default async function RunnerAppPage() {
  console.log("--- RENDERING RUNNER APP DASHBOARD (SERVER SIDE) ---");

  let stops: PropertyStop[] = [];
  let dbStatus = "offline";

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      dbStatus = "online";

      // 1. Fetch active waitlist customers directly from waitlist table
      const { data: activeCustomers, error: queryError } = await supabase
        .from("waitlist")
        .select("*")
        .ilike("service_status", "active");

      if (queryError) throw queryError;

      if (activeCustomers && activeCustomers.length > 0) {
        // Fetch properties to get actual gate codes and custom instructions
        const { data: dbProperties } = await supabase
          .from("properties")
          .select("id, gate_code, custom_instructions");

        const propertiesMap = new Map(
          (dbProperties || []).map((p) => [p.id, p])
        );

        // 2. Fetch service logs to check which properties have been visited/completed
        const { data: dbLogs } = await supabase
          .from("service_logs")
          .select("property_id");

        const completedPropertyIds = new Set((dbLogs || []).map(log => log.property_id));

        // 3. Map waitlist records with physical addresses directly to PropertyStop format
        stops = activeCustomers
          .filter((c) => c.address && c.address.trim().length > 0) // if a stop has an address, render it
          .map((c) => {
            const prop = propertiesMap.get(c.id);
            return {
              id: c.id,
              address: c.address,
              gateCode: prop?.gate_code || "No Code Required",
              binLocation: "Side Gate",
              specialNotes: prop?.custom_instructions || undefined,
              isFirstVisit: !completedPropertyIds.has(c.id),
              status: c.status || undefined,
              serviceStatus: c.service_status || undefined,
            };
          });
      }
    }
  } catch (err) {
    console.error("Failed to load route deck on server:", err);
  }

  return (
    <RunnerAppClient 
      initialStops={stops}
      dbStatus={dbStatus}
      isMock={false}
    />
  );
}
