import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all domain decisions
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const { data, error } = await supabase
      .from("domain_decisions")
      .select("domain_slug, decision_status, next_steps, next_phase_budget")

    if (error) {
      console.error("Error fetching domain decisions:", error)
      return NextResponse.json(
        { error: `Failed to fetch decisions: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/domains/decisions:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

