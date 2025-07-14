import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
    const { entries, session_id, metadata } = body;

    if (!entries) {
      return NextResponse.json(
        { success: false, message: 'Missing entries data' },
        { status: 400 }
      );
    }

    // Insert the entries into the database
    const { data, error } = await supabase
      .from('yellowbox_entries')
      .insert({
        user_id: user.id,
        session_id: session_id || null,
        entries,
        metadata: metadata || null,
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