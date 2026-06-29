'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateLeadStatus(recordId: string, newStatus: string) {
  try {
    console.log(`--- UPDATING LEAD STATUS: ${recordId} -> ${newStatus} ---`);

    // 1. Validate Environment Variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase Environment Variables. Check .env.local');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Update Row
    const { error } = await supabase
      .from('waitlist')
      .update({ status: newStatus })
      .eq('id', recordId);

    if (error) {
      console.error('Supabase Status Update Error:', error);
      throw new Error(error.message);
    }

    // 3. Revalidate Admin Page
    revalidatePath('/admin');

    return { success: true };

  } catch (error) {
    console.error('Admin Server Action Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
