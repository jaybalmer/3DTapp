import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// PUT update a post
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("project_posts")
      .update({
        content: content.trim(),
      })
      .eq("id", id)
      .select()
      .maybeSingle()

    if (error) {
      console.error("Error updating post:", error)
      return NextResponse.json(
        { error: `Failed to update post: ${error.message || error.code || "Unknown error"}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/projects/[slug]/posts/[id]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// DELETE a post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const { id } = await params

    const { error } = await supabase
      .from("project_posts")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting post:", error)
      return NextResponse.json(
        { error: `Failed to delete post: ${error.message || error.code || "Unknown error"}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/projects/[slug]/posts/[id]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

