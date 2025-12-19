"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/simpleAuth"
import { cn } from "@/lib/utils"
import type { ProjectRating } from "@/lib/supabase"

const RANK_OPTIONS = ["A+", "A", "B", "C", "D", "E", "X"]

interface ProjectRatingsProps {
  projectSlug: string
}

export default function ProjectRatings({ projectSlug }: ProjectRatingsProps) {
  const [ratings, setRatings] = useState<ProjectRating[]>([])
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userRating, setUserRating] = useState<ProjectRating | null>(null)
  const [ranking, setRanking] = useState("")
  const [comment, setComment] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    if (projectSlug) {
      fetchRatings()
    }
  }, [projectSlug, currentUser])

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/projects/${projectSlug}/ratings`)
      if (response.ok) {
        const data = await response.json()
        setRatings(data)
        
        // Find current user's rating
        const user = getCurrentUser()
        if (user) {
          const userRating = data.find(
            (r: ProjectRating) => r.user_email.toLowerCase() === user.email.toLowerCase()
          )
          if (userRating) {
            setUserRating(userRating)
            setRanking(userRating.ranking)
            setComment(userRating.comment || "")
          } else {
            setUserRating(null)
            setRanking("")
            setComment("")
          }
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !ranking) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${projectSlug}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_email: currentUser.email,
          user_name: currentUser.name,
          ranking,
          comment: comment.trim() || null,
        }),
      })

      if (response.ok) {
        await fetchRatings()
        setShowForm(false) // Close form after successful save
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save rating")
        console.error("Rating save error:", error)
      }
    } catch (error) {
      console.error("Error saving rating:", error)
      alert("Failed to save rating")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!currentUser || !userRating) return

    if (!confirm("Are you sure you want to delete your rating?")) return

    try {
      const response = await fetch(
        `/api/projects/${projectSlug}/ratings/${currentUser.email}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setUserRating(null)
        setRanking("")
        setComment("")
        await fetchRatings()
      } else {
        alert("Failed to delete rating")
      }
    } catch (error) {
      console.error("Error deleting rating:", error)
      alert("Failed to delete rating")
    }
  }

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
          Team Ratings & Comments
        </h2>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      {/* All Ratings */}
      {ratings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
            Team Ratings ({ratings.length})
          </h3>
          <div className="space-y-3">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="border border-border/20 bg-card p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center rounded bg-muted px-3 py-1 text-sm font-mono font-semibold">
                      {rating.ranking}
                    </span>
                    <div>
                      <div className="text-sm font-semibold tracking-tight">
                        {rating.user_name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {rating.user_email}
                      </div>
                    </div>
                  </div>
                  {rating.updated_at && (
                    <div className="text-xs text-muted-foreground font-mono shrink-0">
                      {new Date(rating.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {rating.comment && (
                  <div className="pt-2 border-t border-border/20">
                    <p className="text-sm leading-relaxed text-muted-foreground/90 whitespace-pre-line">
                      {rating.comment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {ratings.length === 0 && !currentUser && (
        <div className="text-sm text-muted-foreground text-center py-8 border border-border/20 bg-card">
          No ratings yet. Sign in to add your rating.
        </div>
      )}

      {/* Your Rating Button - Below Team Ratings */}
      {currentUser && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn(
              "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
              "border border-border/40 bg-card hover:bg-muted/20",
              "font-mono"
            )}
          >
            {showForm ? "Hide" : userRating ? "Edit Your Rating" : "Add Your Rating"}
          </button>
        </div>
      )}

      {/* User's Rating Form - Hidden by default */}
      {currentUser && showForm && (
        <div className="border border-border/20 bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight font-mono">
              Your Rating
            </h3>
            {userRating && (
              <button
                onClick={handleDelete}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors font-mono"
              >
                Delete
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">
                Ranking
              </label>
              <select
                value={ranking}
                onChange={(e) => setRanking(e.target.value)}
                required
                className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono"
              >
                <option value="">Select ranking</option>
                {RANK_OPTIONS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border resize-none"
                placeholder="Share your thoughts on this project..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !ranking}
                className={cn(
                  "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
                  "border border-border/40 bg-card hover:bg-muted/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "font-mono"
                )}
              >
                {submitting ? "Saving..." : userRating ? "Update Rating" : "Submit Rating"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={cn(
                  "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  "font-mono"
                )}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

