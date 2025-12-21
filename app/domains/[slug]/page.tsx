"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import NavHeader from "@/app/components/NavHeader"
import DomainRatings from "@/app/components/DomainRatings"
import DomainDecision from "@/app/components/DomainDecision"
import DomainPosts from "@/app/components/DomainPosts"
import CopyLinkButton from "@/app/components/CopyLinkButton"
import ScrollToSection from "@/app/components/ScrollToSection"
import { Suspense } from "react"
import { isAuthenticated } from "@/lib/simpleAuth"
import { cn } from "@/lib/utils"

export default function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [domain, setDomain] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>("")
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editTheme, setEditTheme] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }

    const loadParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    loadParams()
  }, [router, params])

  useEffect(() => {
    if (!slug) return

    const loadDomain = async () => {
      try {
        const response = await fetch(`/api/domains/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setDomain(data)
        } else if (response.status === 404) {
          setDomain(null)
        }
      } catch (error) {
        console.error("Error loading domain:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDomain()
  }, [slug])

  const handleSave = async () => {
    if (!editName.trim() || !editTheme.trim()) {
      alert("Name and theme are required")
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/domains/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName.trim(),
          theme: editTheme.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDomain(data)
        setEditing(false)
        // Update slug if name changed
        const newSlug = editName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
        if (newSlug !== slug) {
          router.replace(`/domains/${newSlug}`)
        }
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update domain")
      }
    } catch (error) {
      console.error("Error updating domain:", error)
      alert("Failed to update domain")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${domain.name}"? This cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/domains/${slug}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/domains")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete domain")
      }
    } catch (error) {
      console.error("Error deleting domain:", error)
      alert("Failed to delete domain")
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (domain) {
      setEditName(domain.name)
      setEditTheme(domain.theme)
    }
  }, [domain])

  if (loading) {
    return (
      <>
        <NavHeader />
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-center">Loading...</div>
        </main>
      </>
    )
  }

  if (!domain) {
    return (
      <>
        <NavHeader />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight font-mono">
              Domain not found
            </h1>
            <Link
              href="/domains"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              ← Back to domains
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <NavHeader />
      <Suspense fallback={null}>
        <ScrollToSection />
      </Suspense>

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            {!editing ? (
              <>
                <h1 className="text-3xl font-semibold tracking-tight font-mono leading-tight">
                  {domain.name}
                </h1>
                <div className="flex items-center gap-3 shrink-0">
                  <Suspense fallback={null}>
                    <CopyLinkButton />
                  </Suspense>
                  <button
                    onClick={() => setEditing(true)}
                    className={cn(
                      "px-3 py-1 text-xs font-medium tracking-tight transition-colors",
                      "border border-border/40 bg-card hover:bg-muted/20",
                      "font-mono"
                    )}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={cn(
                      "px-3 py-1 text-xs font-medium tracking-tight transition-colors",
                      "text-muted-foreground hover:text-destructive",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "font-mono"
                    )}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-border/40 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono"
                    placeholder="Domain name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">
                    Theme
                  </label>
                  <input
                    type="text"
                    value={editTheme}
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full border border-border/40 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono"
                    placeholder="Theme description"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || !editName.trim() || !editTheme.trim()}
                    className={cn(
                      "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
                      "border border-border/40 bg-card hover:bg-muted/20",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "font-mono"
                    )}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditName(domain.name)
                      setEditTheme(domain.theme)
                    }}
                    disabled={saving}
                    className={cn(
                      "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
                      "text-muted-foreground hover:text-foreground",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "font-mono"
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Theme */}
        {!editing && domain.theme && (
          <section className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Theme
            </h2>
            <div className="border-l-2 border-border/40 pl-6">
              <p className="text-sm leading-relaxed text-muted-foreground/90">
                {domain.theme}
              </p>
            </div>
          </section>
        )}

        {/* Team Ratings & Comments */}
        {slug && (
          <div id="ratings">
            <DomainRatings domainSlug={slug} />
          </div>
        )}

        {/* Domain Decision */}
        {slug && (
          <section id="decision" className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Decision
            </h2>
            <DomainDecision domainSlug={slug} />
          </section>
        )}

        {/* Posts */}
        {slug && (
          <section className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Posts
            </h2>
            <DomainPosts domainSlug={slug} />
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-border/20">
          <Link
            href="/domains"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono inline-flex items-center gap-2"
          >
            ← Back to domains
          </Link>
        </footer>
      </main>
    </>
  )
}

