import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pabxfssvnndtubeyejhp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhYnhmc3N2bm5kdHViZXllamhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NzI4NDksImV4cCI6MjA2MDM0ODg0OX0.n4BOtBcGVTy-Jpl3CZq0XKgpy1QoYheOkKhiD_VZOPM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Prompt = {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export async function getPromptByName(name: string): Promise<Prompt | null> {
  try {
    console.log(`[Supabase] Fetching prompt with name: ${name}`);

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      console.error('[Supabase] Error fetching prompt:', error);
      return null;
    }

    console.log(`[Supabase] Successfully fetched prompt: ${name}`);
    return data;
  } catch (e) {
    console.error('[Supabase] Unexpected error fetching prompt:', e);
    return null;
  }
}

export async function updatePrompt(id: string, content: string): Promise<boolean> {
  try {
    console.log(`[Supabase] Updating prompt with id: ${id}`);
    console.log(`[Supabase] Content length: ${content.length} characters`);

    const { error, data } = await supabase
      .from('prompts')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase] Error updating prompt:', error);
      return false;
    }

    console.log('[Supabase] Update result:', data);
    console.log('[Supabase] Prompt updated successfully');
    return true;
  } catch (e) {
    console.error('[Supabase] Unexpected error updating prompt:', e);
    return false;
  }
}