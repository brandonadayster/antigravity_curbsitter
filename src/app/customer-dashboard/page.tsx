import { createClient } from "@supabase/supabase-js";
import CustomerDashboard from "./CustomerDashboard";

export const revalidate = 0; // Disable server caching to ensure real-time telemetry

// Resolve environment variables safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; id?: string }>;
}) {
  const params = await searchParams;
  const targetCustomerId = params.customerId || params.id;

  let activeProperty = null;
  let latestServiceLog = null;
  let activeException = null;
  let connectionStatus = "offline";
  let serviceStatus = "Active";
  let fallbackCustomerId = targetCustomerId || "mock-user-id";

  try {
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      connectionStatus = "online";

      // 1. Fetch the primary property row
      let query = supabase.from("properties").select("*");
      if (targetCustomerId) {
        query = query.eq("customer_id", targetCustomerId);
      }
      const { data: properties } = await query.limit(1);

      if (properties && properties.length > 0) {
        activeProperty = properties[0];

        // 2. Fetch the most recent completed service log for this property
        const { data: logs } = await supabase
          .from("service_logs")
          .select("*")
          .eq("property_id", activeProperty.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          latestServiceLog = logs[0];
        }

        // 2b. Fetch any active unresolved exception for this property
        const { data: exceptionLogs } = await supabase
          .from("service_logs")
          .select("*")
          .eq("property_id", activeProperty.id)
          .eq("exception_resolved", false)
          .order("created_at", { ascending: false })
          .limit(1);

        if (exceptionLogs && exceptionLogs.length > 0) {
          activeException = exceptionLogs[0];
        }

        // 3. Fetch customer service status from waitlist table
        if (activeProperty.customer_id) {
          const { data: customer } = await supabase
            .from("waitlist")
            .select("service_status")
            .eq("id", activeProperty.customer_id)
            .single();
          if (customer?.service_status) {
            serviceStatus = customer.service_status;
          }
        }
      } else {
        // Fallback: Check if there are general service logs if properties is empty
        const { data: logs } = await supabase
          .from("service_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          latestServiceLog = logs[0];
        }
      }

      // 4. Resolve fallback customer ID from waitlist table
      const { data: waitlistItems } = await supabase
        .from("waitlist")
        .select("id, service_status")
        .limit(1);
      if (waitlistItems && waitlistItems.length > 0) {
        fallbackCustomerId = waitlistItems[0].id;
        if (!activeProperty) {
          serviceStatus = waitlistItems[0].service_status || "Active";
        }
      }
    }
  } catch (err) {
    console.error("Dashboard Server Side Fetching Error:", err);
  }

  const mappedProperty = activeProperty ? {
    id: activeProperty.id,
    address: activeProperty.address,
    gate_code: activeProperty.gate_code || "No Code Required",
    bin_location: "Side Gate",
    special_notes: activeProperty.custom_instructions || "",
    customer_id: activeProperty.user_id || activeProperty.id,
    lockbox_combination: activeProperty.lockbox_combination || "",
  } : null;

  // Ensure default mock values are provided if the Supabase instance is offline or empty
  const defaultProperty = mappedProperty || {
    id: "mock-prop-id",
    address: "123 Whiskey Row, Prescott, AZ 86301",
    gate_code: "#1880",
    bin_location: "Behind Right Gate Partition",
    special_notes: "Lock gate after returning bins. Watch out for neighbor's dog.",
    customer_id: fallbackCustomerId,
  };

  const defaultServiceLog = latestServiceLog || {
    id: "mock-log-id",
    created_at: "2026-06-21T07:14:00.000Z", // Static ISO string for purity
    photo_url: null, // Triggers duotone placeholder rendering
    lat: 34.5408,
    lng: -112.4685,
    status: "completed",
  };

  return (
    <CustomerDashboard
      initialProperty={defaultProperty}
      initialServiceLog={defaultServiceLog}
      dbStatus={connectionStatus}
      initialServiceStatus={serviceStatus}
      initialActiveException={activeException}
    />
  );
}
