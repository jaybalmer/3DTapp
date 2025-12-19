"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { isAuthenticated } from "@/lib/simpleAuth"
import NavHeader from "@/app/components/NavHeader"
import { cn } from "@/lib/utils"

export default function DomainsPage() {
  const router = useRouter()
  const [domains, setDomains] = useState<any[]>([])
  const [decisions, setDecisions] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newName, setNewName] = useState("")
  const [newTheme, setNewTheme] = useState("")
  const [creating, setCreating] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }

    fetch("/api/domains")
      .then((res) => res.json())
      .then((data) => {
        setDomains(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching domains:", err)
        setLoading(false)
      })

    fetch("/api/domains/decisions")
      .then((res) => res.json())
      .then((data) => {
        const decisionsMap: Record<string, any> = {}
        data.forEach((d: any) => {
          decisionsMap[d.domain_slug] = d
        })
        setDecisions(decisionsMap)
      })
      .catch(console.error)
  }, [router])

  const handleCreate = async () => {
    if (!newName.trim() || !newTheme.trim()) {
      alert("Name and theme are required")
      return
    }

    setCreating(true)
    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName.trim(),
          theme: newTheme.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Reload domains
        const domainsResponse = await fetch("/api/domains")
        if (domainsResponse.ok) {
          const domainsData = await domainsResponse.json()
          setDomains(domainsData)
        }
        setShowCreateForm(false)
        setNewName("")
        setNewTheme("")
        // Navigate to new domain
        router.push(`/domains/${data.slug}`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create domain")
      }
    } catch (error) {
      console.error("Error creating domain:", error)
      alert("Failed to create domain")
    } finally {
      setCreating(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    // Reorder domains locally
    const newDomains = [...domains]
    const draggedDomain = newDomains[draggedIndex]
    newDomains.splice(draggedIndex, 1)
    newDomains.splice(dropIndex, 0, draggedDomain)

    // Update rankings
    const rankings = newDomains.map((domain, index) => ({
      slug: domain.slug,
      ranking: index + 1,
    }))

    // Update local state optimistically
    setDomains(newDomains.map((domain, index) => ({
      ...domain,
      ranking: index + 1,
    })))

    setDraggedIndex(null)

    // Save to backend
    setIsReordering(true)
    try {
      const response = await fetch("/api/domains/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rankings }),
      })

      if (!response.ok) {
        // Revert on error
        const domainsResponse = await fetch("/api/domains")
        if (domainsResponse.ok) {
          const domainsData = await domainsResponse.json()
          setDomains(domainsData)
        }
        alert("Failed to save new order")
      }
    } catch (error) {
      console.error("Error reordering domains:", error)
      // Revert on error
      const domainsResponse = await fetch("/api/domains")
      if (domainsResponse.ok) {
        const domainsData = await domainsResponse.json()
        setDomains(domainsData)
      }
      alert("Failed to save new order")
    } finally {
      setIsReordering(false)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  if (loading) {
    return (
      <>
        <NavHeader />
        <main className="mx-auto max-w-6xl px-6 py-10">
          <div className="text-center">Loading...</div>
        </main>
      </>
    )
  }

  return (
    <>
      <NavHeader />

      <main className="mx-auto max-w-6xl space-y-12 px-4 md:px-6 py-6 md:py-10">
        <header className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-semibold tracking-tight font-mono">
              Focus Domains
            </h1>
            <div className="flex items-center gap-3">
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium tracking-tight transition-colors",
                    "border border-border/40 bg-card hover:bg-muted/20",
                    "font-mono"
                  )}
                >
                  + New Domain
                </button>
              )}
              <div className="text-xs text-muted-foreground">
                ACCESS: INTERNAL
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Targeted domains and themes for Three Dog Tech explorations
          </p>
        </header>

        {/* Create Domain Form */}
        {showCreateForm && (
          <div className="border border-border/20 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight font-mono">
                Create New Domain
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewName("")
                  setNewTheme("")
                }}
                className={cn(
                  "px-3 py-1 text-xs font-medium tracking-tight transition-colors",
                  "text-muted-foreground hover:text-foreground",
                  "font-mono"
                )}
              >
                Cancel
              </button>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">
                Domain Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono"
                placeholder="e.g., Participation & Prediction Markets"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">
                Theme
              </label>
              <input
                type="text"
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono"
                placeholder="e.g., Turning attention into action and capital"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim() || !newTheme.trim()}
                className={cn(
                  "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
                  "border border-border/40 bg-card hover:bg-muted/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "font-mono"
                )}
              >
                {creating ? "Creating..." : "Create Domain"}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewName("")
                  setNewTheme("")
                }}
                disabled={creating}
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

        {/* Desktop Table Layout */}
        <div className="hidden md:block border border-border/20 bg-card">
          <table className="w-full border-collapse border-0">
            <thead className="border-b border-border/20 bg-muted/20">
              <tr>
                <th className="px-6 py-2 text-left text-[11px] font-mono uppercase tracking-wide text-muted-foreground/70 w-20">
                  Rank
                </th>
                <th className="px-6 py-2 text-left text-[11px] font-mono uppercase tracking-wide text-muted-foreground/70">
                  Domain
                </th>
                <th className="px-6 py-2 text-left text-[11px] font-mono uppercase tracking-wide text-muted-foreground/70">
                  Theme
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {domains.map((domain, index) => (
                <tr
                  key={domain.slug}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => {
                    // Don't navigate if we're dragging
                    if (draggedIndex === null) {
                      router.push(`/domains/${domain.slug}`)
                    }
                  }}
                  className={cn(
                    "border-l border-border/40 transition-colors cursor-pointer",
                    draggedIndex === index && "opacity-50",
                    dragOverIndex === index && "bg-muted/40 border-l-2 border-l-foreground/60",
                    draggedIndex !== index && dragOverIndex !== index && "hover:bg-muted/20"
                  )}
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground/70">
                        {domain.ranking ?? index + 1}
                      </span>
                      <svg
                        className="w-4 h-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-[2px] bg-foreground/40" />
                      <div className="text-[15px] font-semibold tracking-tight text-foreground">
                        {domain.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground/80">
                      {domain.theme}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isReordering && (
            <div className="px-6 py-2 text-xs text-muted-foreground/70 font-mono border-t border-border/20">
              Saving order...
            </div>
          )}
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          {domains.map((domain, index) => (
            <div
              key={domain.slug}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={(e) => {
                // Don't navigate if we're dragging
                if (draggedIndex === null) {
                  router.push(`/domains/${domain.slug}`)
                }
              }}
              className={cn(
                "block border border-border/20 bg-card p-4 space-y-3 border-l-4 border-l-border cursor-pointer transition-colors",
                draggedIndex === index && "opacity-50",
                dragOverIndex === index && "bg-muted/40 border-l-4 border-l-foreground/60",
                draggedIndex !== index && dragOverIndex !== index && "hover:bg-muted/10"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground/70">
                      #{domain.ranking ?? index + 1}
                    </span>
                    <svg
                      className="w-4 h-4 text-muted-foreground/40 cursor-grab active:cursor-grabbing"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                  </div>
                  <div className="text-[15px] font-semibold tracking-tight text-foreground">
                    {domain.name}
                  </div>
                </div>
              </div>
              
              <div className="text-sm leading-relaxed text-muted-foreground/80">
                {domain.theme}
              </div>
              
              {decisions[domain.slug] && (
                <div className="pt-2 border-t border-border/20">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-mono font-semibold text-foreground">
                      {decisions[domain.slug].decision_status}
                    </span>
                    {decisions[domain.slug].next_steps && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-muted-foreground/80">
                          {decisions[domain.slug].next_steps}
                        </span>
                      </>
                    )}
                    {decisions[domain.slug].next_phase_budget && (
                      <>
                        <span className="text-border">•</span>
                        <span className="font-mono text-muted-foreground">
                          {new Intl.NumberFormat("en-CA", {
                            style: "currency",
                            currency: "CAD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(decisions[domain.slug].next_phase_budget)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isReordering && (
            <div className="text-center text-xs text-muted-foreground/70 font-mono py-2">
              Saving order...
            </div>
          )}
        </div>
      </main>
    </>
  )
}

