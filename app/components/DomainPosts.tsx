"use client"

import { useEffect, useState, ReactElement } from "react"
import { getCurrentUser } from "@/lib/simpleAuth"
import { cn } from "@/lib/utils"
import LinkPreview from "./LinkPreview"
import PostComments from "./PostComments"

interface DomainPost {
  id: string
  domain_slug: string
  content: string
  posted_by: string
  posted_by_name: string
  created_at: string
}

interface DomainPostsProps {
  domainSlug: string
}

export default function DomainPosts({ domainSlug }: DomainPostsProps) {
  const [posts, setPosts] = useState<DomainPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newPostContent, setNewPostContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState("")
  const user = getCurrentUser()

  useEffect(() => {
    loadPosts()
  }, [domainSlug])

  const loadPosts = async () => {
    try {
      const response = await fetch(`/api/domains/${domainSlug}/posts`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post: DomainPost) => {
    setEditingId(post.id)
    setEditContent(post.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) {
      return
    }

    try {
      const response = await fetch(`/api/domains/${domainSlug}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: editContent }),
      })

      if (response.ok) {
        await loadPosts()
        setEditingId(null)
        setEditContent("")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update post")
      }
    } catch (error) {
      console.error("Error updating post:", error)
      alert("Failed to update post")
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return
    }

    setDeletingId(postId)
    try {
      const response = await fetch(`/api/domains/${domainSlug}/posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadPosts()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete post")
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      alert("Failed to delete post")
    } finally {
      setDeletingId(null)
    }
  }

  const handleNewPost = async () => {
    if (!newPostContent.trim()) {
      setPostError("Please enter some content")
      return
    }

    if (!user) {
      setPostError("You must be logged in to post")
      return
    }

    setPosting(true)
    setPostError("")

    try {
      const response = await fetch(`/api/domains/${domainSlug}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newPostContent.trim(),
          posted_by: user.email,
          posted_by_name: user.name || user.email,
        }),
      })

      if (response.ok) {
        setNewPostContent("")
        await loadPosts()
      } else {
        const error = await response.json()
        setPostError(error.error || "Failed to post")
      }
    } catch (error) {
      console.error("Error posting:", error)
      setPostError("Failed to post. Please try again.")
    } finally {
      setPosting(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text")
    setNewPostContent(pastedText)
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

  const canEditDelete = (post: DomainPost) => {
    if (!user) return false
    return post.posted_by.toLowerCase() === user.email.toLowerCase()
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

  if (loading) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* New Post Form */}
      <div className="border-l-2 border-border/40 pl-6 space-y-3">
        <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
          Add a post
        </div>
        <textarea
          value={newPostContent}
          onChange={(e) => {
            setNewPostContent(e.target.value)
            setPostError("")
          }}
          onPaste={handlePaste}
          placeholder="Share thoughts, links, notes, or updates..."
          className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono min-h-[100px] resize-none"
          rows={4}
          disabled={posting}
        />
        {postError && (
          <div className="text-xs text-destructive font-mono">
            {postError}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewPost}
            disabled={posting || !newPostContent.trim()}
            className={cn(
              "px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
              "border border-border/40 bg-card hover:bg-muted/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "font-mono"
            )}
          >
            {posting ? "Posting..." : "Post"}
          </button>
          {newPostContent && (
            <button
              onClick={() => {
                setNewPostContent("")
                setPostError("")
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

      {/* Existing Posts */}
      {posts.length === 0 ? (
        <div className="text-sm text-muted-foreground/60 font-mono text-center py-8">
          No posts yet. Be the first to share something!
        </div>
      ) : (
        posts.map((post) => {
          const isEditing = editingId === post.id
          const canEdit = canEditDelete(post)

          return (
            <div
              key={post.id}
              className="border-l-2 border-border/40 pl-6 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono font-medium">
                    {post.posted_by_name}
                  </span>
                  <span className="text-border">•</span>
                  <span className="font-mono">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                {canEdit && !isEditing && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </button>
                    <span className="text-border">•</span>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="text-xs font-mono text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      {deletingId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono min-h-[100px]"
                    rows={4}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSaveEdit(post.id)}
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
                    {post.content.split('\n').map((line, lineIndex, lines) => (
                      <span key={lineIndex}>
                        {linkifyText(line)}
                        {lineIndex < lines.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  {/* Link Previews */}
                  {extractUrls(post.content).map((url, index) => (
                    <LinkPreview key={`preview-${index}`} url={url} />
                  ))}
                </>
              )}
              {/* Comments */}
              <PostComments
                postId={post.id}
                apiBasePath={`/api/domains/${domainSlug}/posts/${post.id}`}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

