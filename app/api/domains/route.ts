import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all domains
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .order("ranking", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching domains:", error)
      return NextResponse.json(
        { error: `Failed to fetch domains: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/domains:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// POST create a new domain
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { name, theme } = body

    if (!name || !theme) {
      return NextResponse.json(
        { error: "Name and theme are required" },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Get the max ranking to set the new domain at the end
    const { data: maxRankingData } = await supabase
      .from("domains")
      .select("ranking")
      .order("ranking", { ascending: false, nullsFirst: false })
      .limit(1)
      .single()

    const newRanking = maxRankingData?.ranking ? maxRankingData.ranking + 1 : 1

    const { data, error } = await supabase
      .from("domains")
      .insert({
        slug,
        name,
        theme,
        ranking: newRanking,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating domain:", error)
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A domain with this name already exists" },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: `Failed to create domain: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/domains:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

