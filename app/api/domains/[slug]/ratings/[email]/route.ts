import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET a specific user's rating for a domain
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

    const { slug, email } = await params

    const { data, error } = await supabase
      .from("domain_ratings")
      .select("*")
      .eq("domain_slug", slug)
      .eq("user_email", email.toLowerCase())
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(null)
      }
      console.error("Error fetching rating:", error)
      return NextResponse.json(
        { error: `Failed to fetch rating: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/domains/[slug]/ratings/[email]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// DELETE a user's rating for a domain
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
      .from("domain_ratings")
      .delete()
      .eq("domain_slug", slug)
      .eq("user_email", email.toLowerCase())

    if (error) {
      console.error("Error deleting rating:", error)
      return NextResponse.json(
        { error: `Failed to delete rating: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/domains/[slug]/ratings/[email]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

