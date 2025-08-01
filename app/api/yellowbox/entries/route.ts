import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Types for conversation messages
interface ConversationMessage {
  type: 'user' | 'ai';
  content: string;
  images?: string[];
}

// Helper function to upload data URLs to Supabase Storage
async function uploadDataUrlToSupabase(dataUrl: string): Promise<string> {
  try {
    // Extract file info from data URL
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    const extension = mimeType.split('/')[1] || 'jpg';
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${extension}`;
    const filePath = `diary-images/${fileName}`;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create a service role client for storage operations
    const { createClient } = await import('@supabase/supabase-js');
    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Upload to Supabase Storage
    const { data, error } = await storageClient.storage
      .from('diary-images')
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = storageClient.storage
      .from('diary-images')
      .getPublicUrl(data.path);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Error uploading data URL to Supabase:', error);
    throw error;
  }
}

// Helper function to process conversation history and upload images
async function processConversationImages(conversationHistory: ConversationMessage[]): Promise<ConversationMessage[]> {
  const processedHistory = [];
  
  for (const message of conversationHistory) {
    if (message.images && message.images.length > 0) {
      const processedImages = [];
      
      for (const imageUrl of message.images) {
        if (imageUrl.startsWith('data:')) {
          // Upload data URL to Supabase
          try {
            const supabaseUrl = await uploadDataUrlToSupabase(imageUrl);
            processedImages.push(supabaseUrl);
          } catch (error) {
            console.error('Failed to upload image:', error);
            // Skip this image if upload fails
          }
        } else {
          // Keep existing Supabase URLs
          processedImages.push(imageUrl);
        }
      }
      
      processedHistory.push({
        ...message,
        images: processedImages
      });
    } else {
      processedHistory.push(message);
    }
  }
  
  return processedHistory;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { entries, session_id, metadata, analytics } = body;

    if (!entries) {
      return NextResponse.json(
        { success: false, message: 'Missing entries data' },
        { status: 400 }
      );
    }

    // Process conversation history to upload any data: URL images to Supabase
    const processedConversationHistory = await processConversationImages(
      entries.conversationHistory || []
    );

    // Create processed entries with uploaded image URLs
    const processedEntries = {
      ...entries,
      conversationHistory: processedConversationHistory
    };

    // Insert the entries into the database
    const { data, error } = await supabase
      .from('yellowbox_entries')
      .insert({
        user_id: user.id,
        session_id: session_id || null,
        entries: processedEntries,
        metadata: metadata || null,
        analytics: analytics || null,
        status: 'completed'
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to save entries', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Entries saved successfully',
      data
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Unexpected error occurred', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('yellowbox_entries')
      .select('*')
      .eq('user_id', user.id);

    // If ID is provided, fetch specific entry
    if (id) {
      query = query.eq('id', id);
    } else {
      // Otherwise fetch paginated list
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch entries', error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Unexpected error occurred', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get entry ID from query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Entry ID is required' },
        { status: 400 }
      );
    }

    // Delete the entry (only if it belongs to the current user)
    const { data, error } = await supabase
      .from('yellowbox_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .select();

    if (error) {
      console.error('Database delete error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to delete entry', error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Entry not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, message: 'Unexpected error occurred', error: String(error) },
      { status: 500 }
    );
  }
}