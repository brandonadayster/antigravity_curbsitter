'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function submitWaitlist(formData: FormData) {
  try {
    console.log('--- STARTING WAITLIST SUBMISSION ACTION ---');

    // 1. Validate Environment Variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase Environment Variables (URL or SERVICE_ROLE_KEY). Check .env.local');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Extract Fields
    const firstName = formData.get('first_name') as string | null;
    const lastName = formData.get('last_name') as string | null;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const zipCode = formData.get('zip_code') as string | null;
    const accountType = formData.get('account_type') as string | null;
    const organizationName = formData.get('organization_name') as string | null;
    const businessType = formData.get('business_type') as string | null;
    const portfolioSize = formData.get('portfolio_size') as string | null;
    const address = formData.get('address') as string | null;
    const latitudeStr = (formData.get('latitude') || formData.get('lat')) as string | null;
    const longitudeStr = (formData.get('longitude') || formData.get('lng')) as string | null;

    const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
    const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

    // 3. Validation Checks
    if (!firstName || !firstName.trim()) throw new Error('First name is required.');
    if (!lastName || !lastName.trim()) throw new Error('Last name is required.');
    if (!email || !email.trim()) throw new Error('Email is required.');
    if (!accountType || !accountType.trim()) throw new Error('Account type is required.');

    const isB2B = accountType === 'multi_property';

    if (isB2B) {
      if (!organizationName || !organizationName.trim()) throw new Error('Organization name is required.');
      if (!businessType || !businessType.trim()) throw new Error('Business type is required.');
      if (!portfolioSize || !portfolioSize.trim()) throw new Error('Portfolio size is required.');
    } else {
      if (!zipCode || !zipCode.trim()) throw new Error('Zip code is required.');
    }

    // 4. Map to Database Model
    const propertyTypeVal = isB2B && businessType ? businessType.trim() : 'residential';
    const entityTypeVal = isB2B && businessType ? businessType.trim() : 'residential';

    // 5. Insert into Supabase
    const insertPayload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      zip_code: !isB2B && zipCode ? zipCode.trim() : null,
      entity_type: entityTypeVal,
      property_type: propertyTypeVal,
      organization_name: isB2B && organizationName ? organizationName.trim() : null,
      account_type: accountType.trim(),
      portfolio_size: isB2B && portfolioSize ? portfolioSize.trim() : null,
      status: 'pending',
      created_at: new Date().toISOString(),
      address: address ? address.trim() : null,
      latitude: latitude,
      longitude: longitude,
      lat: latitude,
      lng: longitude,
    };

    console.log("[LEAD SUBMISSION ATTEMPT]:", insertPayload);

    const { data: waitlistData, error } = await supabase
      .from('waitlist')
      .insert([insertPayload])
      .select()
      .single();

    if (error || !waitlistData) {
      console.error('[SUPABASE RAW ERROR]:', error);
      throw new Error(error?.message || "Failed to insert waitlist record");
    }

    // Also populate properties table if address is provided
    if (address && address.trim()) {
      const propertyPayload = {
        id: waitlistData.id, // match waitlist ID exactly
        address: address.trim(),
        zip_code: waitlistData.zip_code || '86301',
        city: 'Prescott',
        property_type: waitlistData.property_type || 'residential',
        gate_code: 'No Code Required',
        custom_instructions: null,
        created_at: new Date().toISOString(),
      };

      const { error: propError } = await supabase
        .from('properties')
        .insert([propertyPayload]);

      if (propError) {
        console.error('[PROPERTIES INSERT ERROR]:', propError);
      } else {
        console.log(`[PROPERTIES RECORD CREATED] Linked to waitlist lead ID: ${waitlistData.id}`);
      }
    }

    revalidatePath('/admin', 'page');

    if (isB2B) {
      console.log(`[ADMIN NOTIFICATION] High-Priority B2B Lead Registered! Organization: ${organizationName?.trim()}, Contact: ${firstName.trim()} ${lastName.trim()}, Business Type: ${businessType?.trim()}, Portfolio Size: ${portfolioSize?.trim()}`);
    }

    return { success: true, isB2B };

  } catch (error) {
    console.error('Waitlist Server Action Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
