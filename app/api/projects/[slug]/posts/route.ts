import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET all posts for a project
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
      .from("project_posts")
      .select("*")
      .eq("project_slug", slug)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching posts:", error)
      return NextResponse.json(
        { error: `Failed to fetch posts: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error in GET /api/projects/[slug]/posts:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// POST create a new post
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
    const { content, posted_by, posted_by_name } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    if (!posted_by || !posted_by_name) {
      return NextResponse.json(
        { error: "posted_by and posted_by_name are required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("project_posts")
      .insert({
        project_slug: slug,
        content: content.trim(),
        posted_by: posted_by.toLowerCase(),
        posted_by_name,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating post:", error)
      if (error.message?.includes("relation") || error.message?.includes("does not exist")) {
        return NextResponse.json(
          { error: "Database table not found. Please run the SQL schema from supabase/project-posts-schema.sql" },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: `Failed to create post: ${error.message || error.code || "Unknown error"}` },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in POST /api/projects/[slug]/posts:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

