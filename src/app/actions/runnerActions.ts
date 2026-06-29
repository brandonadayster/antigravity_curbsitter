"use server";

import { createClient } from "@supabase/supabase-js";
import { sendProofOfWorkSMS } from "@/lib/twilio";
import { PropertyStop } from "@/types/operations";


function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), ms)
    ),
  ]);
}

export async function submitServiceStop(formData: FormData) {
  try {
    console.log("--- STARTING STOP SUBMISSION ACTION ---");

    // 1. Validate Environment Variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase Environment Variables. Check .env.local");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Extract Fields
    const propertyId = formData.get("propertyId") as string | null;
    const latStr = formData.get("lat") as string | null;
    const lngStr = formData.get("lng") as string | null;
    const file = formData.get("photo") as File | null;
    const exceptionType = formData.get("exceptionType") as string | null;
    const surchargeVolumeStr = formData.get("surchargeVolume") as string | null;

    if (!propertyId) throw new Error("Property ID is required.");
    if (!file) throw new Error("No photo found in formData payload");

    const lat = latStr ? parseFloat(latStr) : null;
    const lng = lngStr ? parseFloat(lngStr) : null;
    const surchargeVolume = surchargeVolumeStr ? parseInt(surchargeVolumeStr, 10) : 0;

    // 3. Generate target file path
    const timestamp = Date.now();
    const safeId = propertyId.replace(/[^a-zA-Z0-9]/g, "");
    const filePath = `proof_${safeId}_${timestamp}.jpg`;

    console.log("Uploading file path to storage:", filePath);

    // 4. Convert File to ArrayBuffer for server action upload
    const buffer = await file.arrayBuffer();

    // 5. Upload to Supabase Storage Bucket with a 15-second timeout
    const uploadPromise = supabase.storage
      .from("proof_of_work_photos")
      .upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    const { data: uploadData, error: uploadError } = await withTimeout(
      uploadPromise,
      15000,
      "Supabase storage upload timed out after 15 seconds"
    );

    if (uploadError) {
      console.error("Supabase Storage Upload Error:", uploadError);
      return { success: false, error: uploadError.message };
    }

    console.log("Upload successful! Path:", uploadData.path);

    // 6. Generate a signed public URL for the proof-of-work photo (valid for 7 days)
    let finalUrl = "";
    const { data: signedData, error: signedError } = await supabase.storage
      .from("proof_of_work_photos")
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    if (signedError || !signedData) {
      console.warn("Signed URL generation failed, falling back to public URL:", signedError);
      const { data: publicUrlData } = supabase.storage
        .from("proof_of_work_photos")
        .getPublicUrl(filePath);
      finalUrl = publicUrlData.publicUrl;
    } else {
      finalUrl = signedData.signedUrl;
    }

    // Immediately trigger proof of work SMS notifications to the customer using real customer details
    try {
      let customerId = propertyId;
      
      const { data: property } = await supabase
        .from("properties")
        .select("customer_id")
        .eq("id", propertyId)
        .single();

      if (property?.customer_id) {
        customerId = property.customer_id;
      }

      // Fetch customer's name and phone details using Service Role Key client to bypass RLS
      const { data: customer, error: customerError } = await supabase
        .from("waitlist")
        .select("phone, first_name, last_name")
        .eq("id", customerId)
        .single();

      if (customerError || !customer) {
        throw new Error(`Failed to resolve customer data for SMS: ${customerError?.message || "Customer not found."}`);
      }

      if (!customer.phone) {
        throw new Error(`No phone number associated with customer ${customerId}`);
      }

      let formattedPhone = customer.phone.trim();
      const digitsOnly = formattedPhone.replace(/\D/g, "");
      if (digitsOnly.length === 10) {
        formattedPhone = `+1${digitsOnly}`;
      } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
        formattedPhone = `+${digitsOnly}`;
      } else if (!formattedPhone.startsWith("+") && digitsOnly.length > 0) {
        formattedPhone = `+${digitsOnly}`;
      }

      const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Valued Customer";

      console.log(`[IMMEDIATE SMS DISPATCH] Sending to: ${customerName} (${formattedPhone}) with photo URL: ${finalUrl}`);
      const smsResult = await sendProofOfWorkSMS(formattedPhone, customerName, finalUrl);
      if (!smsResult.success) {
        throw new Error(smsResult.error || "Twilio SMS dispatch failed");
      }
      console.log(`[IMMEDIATE SMS DISPATCH] SMS successfully triggered.`);
    } catch (smsError) {
      console.error("[IMMEDIATE SMS ERROR] Twilio SMS dispatch failed:", smsError);
      throw smsError;
    }

    // 7. Insert completion log into service_logs database
    let surchargeApplied = 0;
    let exceptionLogged: string | null = null;
    let serviceStatus = "completed";

    if (exceptionType && exceptionType !== "none") {
      exceptionLogged = exceptionType;
      serviceStatus = "exception";
      if (exceptionType === "overflow_trash") {
        surchargeApplied = surchargeVolume * 10.00;
      } else if (exceptionType === "wildlife_mess") {
        surchargeApplied = 25.00;
      }
    }

    const { data: logData, error: logError } = await supabase
      .from("service_logs")
      .insert([
        {
          property_id: propertyId,
          status: serviceStatus,
          photo_url: finalUrl,
          lat,
          lng,
          exception_logged: exceptionLogged,
          surcharge_applied: surchargeApplied,
          surcharge_approved: false,
          exception_resolved: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (logError) {
      console.error("Database insert failed for service_logs:", logError);
      throw new Error(`Database insert failed: ${logError.message}`);
    }

    // Update property first-visit and coordinates if captured
    try {
      const { data: prop } = await supabase
        .from("properties")
        .select("is_first_visit")
        .eq("id", propertyId)
        .single();

      const updateData: any = {};
      if (prop?.is_first_visit) {
        updateData.is_first_visit = false;
        if (lat !== null && lng !== null) {
          updateData.bin_coordinates = { latitude: lat, longitude: lng };
        }
        await supabase
          .from("properties")
          .update(updateData)
          .eq("id", propertyId);
        console.log(`[Properties Update] Set is_first_visit = false for property ${propertyId}`);
      }
    } catch (err) {
      console.warn("[Properties Update Warning] Failed to update properties details:", err);
    }

    // 8. 120-day Storage Auto-Delete Script
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 120);
      const cutoffIso = cutoffDate.toISOString();

      // Fetch service logs older than 120 days to clean up storage assets
      const { data: oldLogs } = await supabase
        .from("service_logs")
        .select("photo_url, photo_urls")
        .lt("created_at", cutoffIso);

      if (oldLogs && oldLogs.length > 0) {
        const filesToDelete: string[] = [];
        oldLogs.forEach((log) => {
          if (log.photo_url) {
            const parts = log.photo_url.split("/proof_of_work_photos/");
            if (parts.length > 1) {
              const fileName = parts[1].split("?")[0];
              filesToDelete.push(fileName);
            }
          }
          if (log.photo_urls && Array.isArray(log.photo_urls)) {
            log.photo_urls.forEach((url) => {
              const parts = url.split("/proof_of_work_photos/");
              if (parts.length > 1) {
                const fileName = parts[1].split("?")[0];
                filesToDelete.push(fileName);
              }
            });
          }
        });

        if (filesToDelete.length > 0) {
          console.log(`[Storage Cleanup] Deleting ${filesToDelete.length} obsolete proof-of-work assets:`, filesToDelete);
          const { error: deleteStorageErr } = await supabase.storage
            .from("proof_of_work_photos")
            .remove(filesToDelete);
          if (deleteStorageErr) {
            console.warn("[Storage Cleanup Warning] Storage file deletion failed:", deleteStorageErr);
          }
        }
      }

      // Delete database rows older than 120 days
      const { count, error: deleteDbErr } = await supabase
        .from("service_logs")
        .delete({ count: "exact" })
        .lt("created_at", cutoffIso);

      if (deleteDbErr) {
        console.error("[Storage Cleanup Error] DB rows deletion failed:", deleteDbErr);
      } else {
        console.log(`[Storage Cleanup Success] Deleted ${count || 0} obsolete service log rows from database.`);
      }
    } catch (cleanupErr) {
      console.error("[Storage Cleanup Error] Failed to execute 120-day auto-delete script:", cleanupErr);
    }

    // 9. Return immediately to the client terminal
    return { success: true, path: uploadData.path, log: logData };

  } catch (error) {
    console.error("Stop Submission Server Action Caught Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function getRouteDeck(): Promise<PropertyStop[]> {
  try {
    console.log("--- GETTING ROUTE DECK (SERVER ACTION) ---");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase URL or Service Role Key in environment variables.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let activeCustomers: any[] = [];

    // Query the waitlist table where service_status is active (case-insensitive)
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .ilike("service_status", "active");

      console.log("[GET_ROUTE_DECK RAW RESPONSE]:", { data, error });

      if (error) {
        throw error;
      }
      activeCustomers = data || [];
    } catch (queryErr) {
      console.error("Error executing waitlist query in getRouteDeck:", queryErr);
      throw queryErr;
    }

    if (activeCustomers.length === 0) {
      return [];
    }

    const customerIds = activeCustomers.map(c => c.id);

    // Query properties for active customers
    const { data: dbProperties, error: propertiesError } = await supabase
      .from("properties")
      .select("*")
      .in("customer_id", customerIds);

    if (propertiesError) throw propertiesError;

    if (!dbProperties || dbProperties.length === 0) {
      return [];
    }

    // Query service logs to determine first-visit status
    const { data: dbLogs } = await supabase
      .from("service_logs")
      .select("property_id");

    const completedPropertyIds = new Set((dbLogs || []).map(log => log.property_id));

    const customerMap = new Map(activeCustomers.map(c => [c.id, c]));

    const stops = dbProperties.map(prop => {
      const customer = customerMap.get(prop.customer_id);
      return {
        id: prop.id,
        address: prop.address,
        gateCode: prop.gate_code || "No Code Required",
        binLocation: prop.bin_location || "Not Specified",
        specialNotes: prop.special_notes || undefined,
        isFirstVisit: !completedPropertyIds.has(prop.id),
        status: customer?.status || undefined,
        serviceStatus: customer?.service_status || undefined
      };
    });

    return stops;
  } catch (error) {
    console.error("getRouteDeck server action error:", error);
    throw error;
  }
}

