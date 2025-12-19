import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all decisions for all projects
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json([])
    }

    const { data, error } = await supabase
      .from("project_decisions")
      .select("project_slug, decision_status, next_steps, next_phase_budget")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching decisions:", error)
      return NextResponse.json([])
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/projects/decisions:", error)
    return NextResponse.json([])
  }
}

