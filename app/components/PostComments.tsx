"use client"

import { useEffect, useState, ReactElement } from "react"
import { getCurrentUser } from "@/lib/simpleAuth"
import { cn } from "@/lib/utils"
import LinkPreview from "./LinkPreview"

interface PostComment {
  id: string
  post_id: string
  content: string
  posted_by: string
  posted_by_name: string
  created_at: string
  updated_at?: string
}

interface PostCommentsProps {
  postId: string
  apiBasePath: string // e.g., "/api/projects/slug/posts/id" or "/api/domains/slug/posts/id"
}

export default function PostComments({ postId, apiBasePath }: PostCommentsProps) {
  const [comments, setComments] = useState<PostComment[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newCommentContent, setNewCommentContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [commentError, setCommentError] = useState("")
  const [showComments, setShowComments] = useState(false)
  const user = getCurrentUser()

  useEffect(() => {
    if (showComments) {
      loadComments()
    }
  }, [postId, showComments])

  const loadComments = async () => {
    try {
      const response = await fetch(`${apiBasePath}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (comment: PostComment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      return
    }

    try {
      const response = await fetch(`${apiBasePath}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        await loadComments()
        setEditingId(null)
        setEditContent("")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update comment")
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      alert("Failed to update comment")
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    setDeletingId(commentId)
    try {
      const response = await fetch(`${apiBasePath}/comments/${commentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadComments()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete comment")
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("Failed to delete comment")
    } finally {
      setDeletingId(null)
    }
  }

  const handleNewComment = async () => {
    if (!newCommentContent.trim()) {
      setCommentError("Please enter a comment")
      return
    }

    if (!user) {
      setCommentError("You must be logged in to comment")
      return
    }

    setPosting(true)
    setCommentError("")

    try {
      const response = await fetch(`${apiBasePath}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newCommentContent.trim(),
          posted_by: user.email,
          posted_by_name: user.name || user.email,
        }),
      })

      if (response.ok) {
        setNewCommentContent("")
        await loadComments()
      } else {
        const error = await response.json()
        setCommentError(error.error || "Failed to post comment")
      }
    } catch (error) {
      console.error("Error posting comment:", error)
      setCommentError("Failed to post comment. Please try again.")
    } finally {
      setPosting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  const canEditDelete = (comment: PostComment) => {
    if (!user) return false
    return comment.posted_by.toLowerCase() === user.email.toLowerCase()
  }

  // Extract all unique URLs from text
  const extractUrls = (text: string): string[] => {
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g
    const urls = new Set<string>()
    let match

    while ((match = urlPattern.exec(text)) !== null) {
      let url = match[0]
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      urls.add(url)
    }

    return Array.from(urls)
  }

  const linkifyText = (text: string): (string | ReactElement)[] => {
    // URL pattern: matches http://, https://, or www. followed by domain and path
    const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g
    
    const parts: (string | ReactElement)[] = []
    let lastIndex = 0
    let match
    let keyCounter = 0

    while ((match = urlPattern.exec(text)) !== null) {
      // Add text before the URL
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // Process the URL
      let url = match[0]
      let displayUrl = url

      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      // Truncate long URLs for display
      if (displayUrl.length > 50) {
        displayUrl = displayUrl.substring(0, 47) + '...'
      }

      // Add the link
      parts.push(
        <a
          key={`link-${keyCounter++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline hover:text-muted-foreground transition-colors break-all"
        >
          {displayUrl}
        </a>
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    // If no URLs found, return original text as single string
    if (parts.length === 0) {
      return [text]
    }

    return parts
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Toggle Comments Button */}
      <button
        onClick={() => {
          setShowComments(!showComments)
          if (!showComments) {
            setLoading(true)
          }
        }}
        className={cn(
          "px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
          "border border-border/40 bg-card hover:bg-muted/20",
          "font-mono"
        )}
      >
        {showComments ? "Hide" : "Show"} comments ({comments.length})
      </button>

      {showComments && (
        <div className="space-y-4 pl-6 border-l-2 border-border/20">
          {/* New Comment Form */}
          <div className="space-y-2">
            <textarea
              value={newCommentContent}
              onChange={(e) => {
                setNewCommentContent(e.target.value)
                setCommentError("")
              }}
              placeholder="Add a comment..."
              className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono min-h-[80px] resize-none"
              rows={3}
              disabled={posting}
            />
            {commentError && (
              <div className="text-xs text-destructive font-mono">
                {commentError}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewComment}
                disabled={posting || !newCommentContent.trim()}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
                  "border border-border/40 bg-card hover:bg-muted/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "font-mono"
                )}
              >
                {posting ? "Posting..." : "Comment"}
              </button>
              {newCommentContent && (
                <button
                  onClick={() => {
                    setNewCommentContent("")
                    setCommentError("")
                  }}
                  disabled={posting}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
                    "text-muted-foreground hover:text-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "font-mono"
                  )}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Comments List */}
          {loading ? (
            <div className="text-xs text-muted-foreground font-mono">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-muted-foreground/60 font-mono">No comments yet.</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const isEditing = editingId === comment.id
                const canEdit = canEditDelete(comment)

                return (
                  <div
                    key={comment.id}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono font-medium">
                          {comment.posted_by_name}
                        </span>
                        <span className="text-border">•</span>
                        <span className="font-mono">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      {canEdit && !isEditing && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(comment)}
                            className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Edit
                          </button>
                          <span className="text-border">•</span>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            disabled={deletingId === comment.id}
                            className="text-xs font-mono text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            {deletingId === comment.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono min-h-[80px]"
                          rows={3}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={!editContent.trim()}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
                              "border border-border/40 bg-card hover:bg-muted/20",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              "font-mono"
                            )}
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className={cn(
                              "px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
                              "text-muted-foreground hover:text-foreground",
                              "font-mono"
                            )}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm leading-relaxed text-muted-foreground/90 whitespace-pre-line">
                          {comment.content.split('\n').map((line, lineIndex, lines) => (
                            <span key={lineIndex}>
                              {linkifyText(line)}
                              {lineIndex < lines.length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                        {/* Link Previews */}
                        {extractUrls(comment.content).map((url, index) => (
                          <LinkPreview key={`preview-${index}`} url={url} />
                        ))}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

