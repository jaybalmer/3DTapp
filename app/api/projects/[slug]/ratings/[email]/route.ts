import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET a specific user's rating for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; email: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

// GET a specific user's rating for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; email: string }> }
) {
  try {
    const { slug, email } = await params

    const { data, error } = await supabase
      .from("project_ratings")
      .select("*")
      .eq("project_slug", slug)
      .eq("user_email", email.toLowerCase())
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(null)
      }
      console.error("Error fetching rating:", error)
      return NextResponse.json(
        { error: "Failed to fetch rating" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/projects/[slug]/ratings/[email]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE a user's rating
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; email: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const { slug, email } = await params

    const { error } = await supabase
      .from("project_ratings")
      .delete()
      .eq("project_slug", slug)
      .eq("user_email", email.toLowerCase())

    if (error) {
      console.error("Error deleting rating:", error)
      return NextResponse.json(
        { error: "Failed to delete rating" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/projects/[slug]/ratings/[email]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

