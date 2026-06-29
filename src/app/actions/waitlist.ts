"use server";

import { supabase } from "@/lib/supabase";

export interface WaitlistPayload {
  name: string;
  email?: string;
  phone?: string;
  zipCode: string;
}

export async function submitToWaitlist(payload: WaitlistPayload) {
  // 1. Validation checks
  if (!payload.name.trim()) {
    return { success: false, error: "Name is required." };
  }
  if (!payload.email?.trim() && !payload.phone?.trim()) {
    return { success: false, error: "Either Email or Phone must be provided." };
  }

  // 2. Supabase Insert
  if (supabase) {
    try {
      const { error } = await supabase.from("leads").insert([
        {
          name: payload.name.trim(),
          email: payload.email?.trim() || null,
          phone: payload.phone?.trim() || null,
          zip_code: payload.zipCode.trim(),
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase error during lead creation:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Unexpected error in server action:", err);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
  }

  // 3. Fallback for Local Dev
  console.log("Mock waitlist submission registered (Supabase offline):", payload);
  return { success: true, isMock: true };
}

export interface WaitlistNewPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  zipCode: string;
  propertyType: string;
  userRole: string;
  organizationName?: string;
}

export async function submitNewWaitlist(payload: WaitlistNewPayload) {
  // 1. Validation checks
  if (!payload.firstName?.trim()) {
    return { success: false, error: "First name is required." };
  }
  if (!payload.lastName?.trim()) {
    return { success: false, error: "Last name is required." };
  }
  if (!payload.email?.trim()) {
    return { success: false, error: "Email is required." };
  }
  if (!payload.zipCode?.trim()) {
    return { success: false, error: "Zip code is required." };
  }
  if (payload.userRole === "hoa_pm" && !payload.organizationName?.trim()) {
    return { success: false, error: "Organization name is required for HOA/Property Management." };
  }

  // 2. High-Priority B2B Notification trigger
  if (payload.userRole === "hoa_pm") {
    console.log(`[ADMIN NOTIFICATION] High-Priority B2B Lead Registered! Organization: ${payload.organizationName?.trim()}, Contact: ${payload.firstName.trim()} ${payload.lastName.trim()} (${payload.email.trim()})`);
  }

  // 3. Supabase Insert
  if (supabase) {
    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          first_name: payload.firstName.trim(),
          last_name: payload.lastName.trim(),
          email: payload.email.trim(),
          phone: payload.phone?.trim() || null,
          zip_code: payload.zipCode.trim(),
          property_type: payload.propertyType || null,
          user_role: payload.userRole,
          organization_name: payload.userRole === "hoa_pm" ? payload.organizationName?.trim() : null,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase error during waitlist creation:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error("Unexpected error in server action:", err);
      return { success: false, error: "An unexpected error occurred. Please try again." };
    }
  }

  // 4. Fallback for Local Dev
  console.log("Mock waitlist table B2B submission registered (Supabase offline):", payload);
  return { success: true, isMock: true };
}
