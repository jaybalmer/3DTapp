import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// POST to reorder domains
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { rankings } = body // Array of { slug: string, ranking: number }

    if (!Array.isArray(rankings)) {
      return NextResponse.json(
        { error: "rankings must be an array" },
        { status: 400 }
      )
    }

    // Update each domain's ranking
    const updates = rankings.map(({ slug, ranking }: { slug: string; ranking: number }) =>
      supabase!
        .from("domains")
        .update({ ranking })
        .eq("slug", slug)
    )

    const results = await Promise.all(updates)
    
    // Check for errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error("Error updating rankings:", errors)
      return NextResponse.json(
        { error: `Failed to update some rankings: ${errors[0].error?.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/domains/reorder:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

