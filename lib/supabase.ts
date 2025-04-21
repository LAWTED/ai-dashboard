import { createClient } from '@supabase/supabase-js';

// 使用环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 验证环境变量存在
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Prompt = {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type File = {
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

export async function getFileByName(name: string): Promise<File | null> {
  try {
    console.log(`[Supabase] Fetching file with name: ${name}`);

    const { data, error } = await supabase
      .from('file')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      console.error('[Supabase] Error fetching file:', error);
      return null;
    }

    console.log(`[Supabase] Successfully fetched file: ${name}`);
    return data;
  } catch (e) {
    console.error('[Supabase] Unexpected error fetching file:', e);
    return null;
  }
}

export async function updateFile(id: string, content: string): Promise<boolean> {
  try {
    console.log(`[Supabase] Updating file with id: ${id}`);
    console.log(`[Supabase] Content length: ${content.length} characters`);

    const { error, data } = await supabase
      .from('file')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase] Error updating file:', error);
      return false;
    }

    console.log('[Supabase] Update result:', data);
    console.log('[Supabase] File updated successfully');
    return true;
  } catch (e) {
    console.error('[Supabase] Unexpected error updating file:', e);
    return false;
  }
}