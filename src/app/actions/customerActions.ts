"use server";

import { createClient } from "@supabase/supabase-js";

/**
 * Updates the service status of a customer in Supabase (e.g. Vacation Hold).
 * Pausing/unpausing valet bin service.
 */
export async function toggleVacationHold(userId: string, isPaused: boolean) {
  try {
    console.log(`--- Server Action: toggleVacationHold: User ${userId}, isPaused ${isPaused} ---`);

    // 1. Validate environment configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase connection settings in environment.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const targetStatus = isPaused ? "Paused" : "Active";

    // 2. Perform table update on public.waitlist table
    const { error } = await supabase
      .from("waitlist")
      .update({ service_status: targetStatus })
      .eq("id", userId);

    if (error) {
      console.error(`[toggleVacationHold error] Supabase status update failed for user ${userId}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[toggleVacationHold success] User ${userId} status updated to ${targetStatus}`);
    return { success: true };

  } catch (error) {
    console.error("toggleVacationHold exception:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred." };
  }
}

/**
 * Approves a pending exception surcharge for a completed stop.
 */
export async function approveSurcharge(logId: string) {
  try {
    console.log(`--- Server Action: approveSurcharge: LogId ${logId} ---`);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Bypass RLS to update
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials in environment");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("service_logs")
      .update({ surcharge_approved: true, exception_resolved: true })
      .eq("id", logId);

    if (error) {
      console.error(`[approveSurcharge error] failed for log ${logId}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[approveSurcharge success] Surcharge approved for log ${logId}`);
    return { success: true };
  } catch (error) {
    console.error("approveSurcharge exception:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred." };
  }
}

/**
 * Updates a customer's gate/lockbox credentials and auto-resolves gate-locked exceptions.
 */
export async function updatePropertyAccess(
  propertyId: string, 
  gateCode: string, 
  lockboxInfo: string, 
  specialNotes?: string
) {
  try {
    console.log(`--- Server Action: updatePropertyAccess: PropertyId ${propertyId} ---`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials in environment");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Update properties table
    const { error: propError } = await supabase
      .from("properties")
      .update({
        gate_code: gateCode,
        lockbox_combination: lockboxInfo,
        custom_instructions: specialNotes || null
      })
      .eq("id", propertyId);

    if (propError) {
      console.error(`[updatePropertyAccess error] failed properties update for ID ${propertyId}:`, propError.message);
      return { success: false, error: propError.message };
    }

    // 2. Automatically resolve any pending gate_locked exceptions for this property!
    try {
      const { error: resolveErr } = await supabase
        .from("service_logs")
        .update({ exception_resolved: true })
        .eq("property_id", propertyId)
        .eq("exception_logged", "gate_locked")
        .eq("exception_resolved", false);

      if (resolveErr) {
        console.warn("[updatePropertyAccess warning] Failed to auto-resolve gate exceptions:", resolveErr.message);
      } else {
        console.log(`[updatePropertyAccess] Auto-resolved pending gate_locked exceptions for property ${propertyId}`);
      }
    } catch (innerErr) {
      console.warn("Exception resolving gate exceptions:", innerErr);
    }

    console.log(`[updatePropertyAccess success] Property ${propertyId} details updated successfully.`);
    return { success: true };
  } catch (error) {
    console.error("updatePropertyAccess exception:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred." };
  }
}
