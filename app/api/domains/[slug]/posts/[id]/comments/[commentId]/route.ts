import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// PUT update a comment
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string; commentId: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const { commentId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("domain_post_comments")
      .update({ content: content.trim() })
      .eq("id", commentId)
      .select()
      .maybeSingle()

    if (error) {
      console.error("Error updating comment:", error)
      return NextResponse.json(
        { error: `Failed to update comment: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in PUT /api/domains/[slug]/posts/[id]/comments/[commentId]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// DELETE a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string; commentId: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const { commentId } = await params

    const { error } = await supabase
      .from("domain_post_comments")
      .delete()
      .eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      return NextResponse.json(
        { error: `Failed to delete comment: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/domains/[slug]/posts/[id]/comments/[commentId]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

