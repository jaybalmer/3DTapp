import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const VALID_DECISION_STATUSES = [
  "Explore",
  "Advance",
  "Park",
  "Kill",
  "Spin-Out Candidate",
]

// GET decision for a domain
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
      .from("domain_decisions")
      .select("*")
      .eq("domain_slug", slug)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned - return null
        return NextResponse.json(null)
      }
      console.error("Error fetching decision:", error)
      return NextResponse.json(
        { error: `Failed to fetch decision: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/domains/[slug]/decision:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// POST/UPSERT decision for a domain
export async function POST(
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
    const body = await request.json()
    const { decision_status, next_steps, next_phase_budget, updated_by } = body

    if (!decision_status || !updated_by) {
      return NextResponse.json(
        { error: "Decision status and updated_by are required" },
        { status: 400 }
      )
    }

    if (!VALID_DECISION_STATUSES.includes(decision_status)) {
      return NextResponse.json(
        { error: `Invalid decision status. Must be one of: ${VALID_DECISION_STATUSES.join(", ")}` },
        { status: 400 }
      )
    }

    // Parse budget
    let budgetValue: number | null = null
    if (next_phase_budget !== undefined && next_phase_budget !== null && next_phase_budget !== "") {
      const parsed = parseFloat(next_phase_budget)
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { error: "Budget must be a valid positive number" },
          { status: 400 }
        )
      }
      budgetValue = parsed
    }

    // Check if decision exists
    const { data: existing } = await supabase
      .from("domain_decisions")
      .select("*")
      .eq("domain_slug", slug)
      .single()

    let data, error
    if (existing) {
      // Update existing
      const result = await supabase
        .from("domain_decisions")
        .update({
          decision_status,
          next_steps: next_steps || null,
          next_phase_budget: budgetValue,
          updated_by,
        })
        .eq("domain_slug", slug)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new
      const result = await supabase
        .from("domain_decisions")
        .insert({
          domain_slug: slug,
          decision_status,
          next_steps: next_steps || null,
          next_phase_budget: budgetValue,
          updated_by,
        })
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      console.error("Error saving decision:", error)
      if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
        return NextResponse.json(
          { error: "Database table not found. Please run the SQL schema from supabase/domains-schema.sql" },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: `Failed to save decision: ${error.message || error.code || "Unknown error"}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/domains/[slug]/decision:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

