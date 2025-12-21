"use client"

import { useEffect, useState, ReactElement } from "react"
import { getCurrentUser } from "@/lib/simpleAuth"
import { cn } from "@/lib/utils"
import LinkPreview from "./LinkPreview"
import type { DomainDecision } from "@/lib/supabase"

const DECISION_OPTIONS = [
  "Explore",
  "Advance",
  "Park",
  "Kill",
  "Spin-Out Candidate",
]

interface DomainDecisionProps {
  domainSlug: string
}

export default function DomainDecision({ domainSlug }: DomainDecisionProps) {
  const [decision, setDecision] = useState<DomainDecision | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null)

  // Form state
  const [decisionStatus, setDecisionStatus] = useState("Explore")
  const [nextSteps, setNextSteps] = useState("")
  const [budget, setBudget] = useState("0")
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    fetchDecision()
  }, [domainSlug])

  const fetchDecision = async () => {
    try {
      const response = await fetch(`/api/domains/${domainSlug}/decision`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setDecision(data)
          setDecisionStatus(data.decision_status || "Explore")
          setNextSteps(data.next_steps || "")
          setBudget(data.next_phase_budget ? formatBudgetForInput(data.next_phase_budget) : "0")
        } else {
          setDecisionStatus("Explore")
          setNextSteps("")
          setBudget("0")
        }
      }
    } catch (error) {
      console.error("Error fetching decision:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatBudgetForInput = (value: number): string => {
    return Math.round(value).toString()
  }

  const formatBudgetForDisplay = (value: number | null): string => {
    if (!value) return ""
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== decisionStatus) {
      setPendingStatus(newStatus)
      setShowConfirm(true)
    }
  }

  const confirmStatusChange = () => {
    if (pendingStatus) {
      setDecisionStatus(pendingStatus)
      setShowConfirm(false)
      setPendingStatus(null)
      saveDecision(pendingStatus, nextSteps, budget)
    }
  }

  const cancelStatusChange = () => {
    setShowConfirm(false)
    setPendingStatus(null)
  }

  const handleNextStepsBlur = () => {
    if (nextSteps !== (decision?.next_steps || "")) {
      saveDecision(decisionStatus, nextSteps, budget)
    }
  }

  const handleBudgetBlur = () => {
    const budgetValue = budget && budget !== "0" ? parseFloat(budget.replace(/[^0-9.]/g, "")) : null
    const currentBudget = decision?.next_phase_budget || null
    
    if (budgetValue !== currentBudget) {
      saveDecision(decisionStatus, nextSteps, budget)
    }
  }

  const saveDecision = async (
    status: string,
    steps: string,
    budgetStr: string
  ) => {
    if (!currentUser) return

    setSaving(true)
    try {
      const budgetValue = budgetStr && budgetStr !== "0"
        ? parseFloat(budgetStr.replace(/[^0-9.]/g, ""))
        : null

      const response = await fetch(`/api/domains/${domainSlug}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision_status: status,
          next_steps: steps.trim() || null,
          next_phase_budget: budgetValue,
          updated_by: currentUser.email,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDecision(data)
        setShowForm(false)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save decision")
        if (decision) {
          setDecisionStatus(decision.decision_status)
          setNextSteps(decision.next_steps || "")
          setBudget(decision.next_phase_budget ? formatBudgetForInput(decision.next_phase_budget) : "0")
        }
      }
    } catch (error) {
      console.error("Error saving decision:", error)
      alert("Failed to save decision")
      if (decision) {
        setDecisionStatus(decision.decision_status)
        setNextSteps(decision.next_steps || "")
        setBudget(decision.next_phase_budget ? formatBudgetForInput(decision.next_phase_budget) : "0")
      }
    } finally {
      setSaving(false)
    }
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
    return (
      <section className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </section>
    )
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Condensed Display */}
      {decision && !showForm && (
        <div className="border border-border/20 bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                Decision:
              </span>
              <span className="text-sm font-semibold tracking-tight">
                {decision.decision_status}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {decision.updated_at && (
                <div className="text-xs text-muted-foreground font-mono">
                  {new Date(decision.updated_at).toLocaleDateString()}
                </div>
              )}
              <button
                onClick={() => setShowForm(true)}
                className={cn(
                  "px-3 py-1 text-xs font-medium tracking-tight transition-colors",
                  "border border-border/40 bg-card hover:bg-muted/20",
                  "font-mono"
                )}
              >
                Edit
              </button>
            </div>
          </div>
          
          {decision.next_steps && (
            <div className="pt-2 border-t border-border/20 space-y-2">
              <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1">
                Next Steps:
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground/90 whitespace-pre-line">
                {decision.next_steps.split('\n').map((line, lineIndex, lines) => (
                  <span key={lineIndex}>
                    {linkifyText(line)}
                    {lineIndex < lines.length - 1 && <br />}
                  </span>
                ))}
              </div>
              {/* Link Previews */}
              {extractUrls(decision.next_steps).map((url, index) => (
                <LinkPreview key={`preview-${index}`} url={url} />
              ))}
            </div>
          )}
          
          {decision.next_phase_budget && (
            <div className="pt-2 border-t border-border/20">
              <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1">
                Next Phase Budget:
              </div>
              <p className="text-sm font-semibold">
                {formatBudgetForDisplay(decision.next_phase_budget)}
              </p>
            </div>
          )}
        </div>
      )}

      {!decision && !showForm && (
        <div className="border border-border/20 bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              No decision set yet.
            </div>
            <button
              onClick={() => setShowForm(true)}
              className={cn(
                "px-3 py-1 text-xs font-medium tracking-tight transition-colors",
                "border border-border/40 bg-card hover:bg-muted/20",
                "font-mono"
              )}
            >
              Set Decision
            </button>
          </div>
        </div>
      )}

      {/* Expanded Form */}
      {showForm && (
        <div className="border border-border/20 bg-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight font-mono">
              {decision ? "Edit Decision" : "Set Decision"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className={cn(
                "px-3 py-1 text-xs font-medium tracking-tight transition-colors",
                "text-muted-foreground hover:text-foreground",
                "font-mono"
              )}
            >
              Cancel
            </button>
          </div>
          {/* Decision Status */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Decision Status
            </label>
            {showConfirm ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Change decision from <strong>{decisionStatus}</strong> to{" "}
                  <strong>{pendingStatus}</strong>?
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={confirmStatusChange}
                    disabled={saving}
                    className={cn(
                      "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
                      "border border-border/40 bg-card hover:bg-muted/20",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "font-mono"
                    )}
                  >
                    {saving ? "Saving..." : "Confirm"}
                  </button>
                  <button
                    onClick={cancelStatusChange}
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
            ) : (
              <select
                value={decisionStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={saving}
                className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono disabled:opacity-50"
              >
                {DECISION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Next Exploration Steps
            </label>
            <textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              onBlur={handleNextStepsBlur}
              disabled={saving}
              rows={4}
              className="w-full border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border resize-none disabled:opacity-50 font-mono"
              placeholder="Describe the single most important action that would increase conviction..."
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Next Phase Budget
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <input
                type="text"
                value={budget}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  setBudget(value)
                }}
                onBlur={handleBudgetBlur}
                disabled={saving}
                className="flex-1 border border-border/40 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border disabled:opacity-50 font-mono"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground font-mono">CAD</span>
            </div>
            {budget && !isNaN(parseFloat(budget)) && (
              <div className="text-xs text-muted-foreground">
                {formatBudgetForDisplay(parseFloat(budget))}
              </div>
            )}
          </div>

          {/* Updated info */}
          {decision?.updated_at && (
            <div className="pt-4 border-t border-border/20 text-xs text-muted-foreground font-mono">
              Last updated by {decision.updated_by} on{" "}
              {new Date(decision.updated_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

