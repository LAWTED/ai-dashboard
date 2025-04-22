import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get userid from query parameters
    const url = new URL(req.url);
    const userid = url.searchParams.get("userid");

    if (!userid) {
      return NextResponse.json(
        { success: false, message: "Missing userid parameter" },
        { status: 400 }
      );
    }

    // Query the database for student info
    const { data, error } = await supabase
      .from("studentinfo")
      .select("userid, username")
      .eq("userid", userid)
      .maybeSingle();

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        { success: false, message: "Database query error", error: error.message },
        { status: 500 }
      );
    }

    // Return whether student exists and basic info
    return NextResponse.json({
      success: true,
      exists: !!data,
      data: data
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected error occurred", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userid, username } = await req.json();

    if (!userid) {
      return NextResponse.json(
        { success: false, message: "Missing userid parameter" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("studentinfo")
      .select("userid")
      .eq("userid", userid)
      .maybeSingle();

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from("studentinfo")
        .update({ username })
        .eq("userid", userid)
        .select();

      if (error) {
        return NextResponse.json(
          { success: false, message: "Failed to update user", error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        data
      });
    } else {
      // Create new user
      const { data, error } = await supabase
        .from("studentinfo")
        .insert({ userid, username })
        .select();

      if (error) {
        return NextResponse.json(
          { success: false, message: "Failed to create user", error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        data
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "Unexpected error occurred", error: String(error) },
      { status: 500 }
    );
  }
}