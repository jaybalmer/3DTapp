import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all ratings for a domain
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const { slug } = await params

    const { data, error } = await supabase
      .from("domain_ratings")
      .select("*")
      .eq("domain_slug", slug)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching ratings:", error)
      return NextResponse.json(
        { error: `Failed to fetch ratings: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/domains/[slug]/ratings:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// POST/UPSERT a rating for a domain
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured. Please set up your Supabase database." },
        { status: 503 }
      )
    }

    const { slug } = await params
    const body = await request.json()
    const { user_email, user_name, ranking, comment } = body

    if (!user_email || !user_name || !ranking) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate ranking
    const validRankings = ["A+", "A", "B", "C", "D", "E", "X"]
    if (!validRankings.includes(ranking)) {
      return NextResponse.json(
        { error: "Invalid ranking" },
        { status: 400 }
      )
    }

    // Use upsert to insert or update
    const { data: existing } = await supabase
      .from("domain_ratings")
      .select("*")
      .eq("domain_slug", slug)
      .eq("user_email", user_email.toLowerCase())
      .single()

    let data, error
    if (existing) {
      // Update existing
      const result = await supabase
        .from("domain_ratings")
        .update({
          ranking,
          comment: comment || null,
          user_name,
        })
        .eq("domain_slug", slug)
        .eq("user_email", user_email.toLowerCase())
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new
      const result = await supabase
        .from("domain_ratings")
        .insert({
          domain_slug: slug,
          user_email: user_email.toLowerCase(),
          user_name,
          ranking,
          comment: comment || null,
        })
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      console.error("Error saving rating:", error)
      if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
        return NextResponse.json(
          { error: "Database table not found. Please run the SQL schema from supabase/domains-schema.sql" },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: `Failed to save rating: ${error.message || error.code || "Unknown error"}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/domains/[slug]/ratings:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

