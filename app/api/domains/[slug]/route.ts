import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET a single domain
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
      .from("domains")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Domain not found" },
          { status: 404 }
        )
      }
      console.error("Error fetching domain:", error)
      return NextResponse.json(
        { error: `Failed to fetch domain: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/domains/[slug]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// PUT update a domain
export async function PUT(
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
    const { name, theme } = body

    if (!name || !theme) {
      return NextResponse.json(
        { error: "Name and theme are required" },
        { status: 400 }
      )
    }

    // Generate new slug if name changed
    const newSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const { data, error } = await supabase
      .from("domains")
      .update({
        name,
        theme,
        slug: newSlug,
      })
      .eq("slug", slug)
      .select()
      .single()

    if (error) {
      console.error("Error updating domain:", error)
      return NextResponse.json(
        { error: `Failed to update domain: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/domains/[slug]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// DELETE a domain
export async function DELETE(
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

    const { error } = await supabase
      .from("domains")
      .delete()
      .eq("slug", slug)

    if (error) {
      console.error("Error deleting domain:", error)
      return NextResponse.json(
        { error: `Failed to delete domain: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/domains/[slug]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

