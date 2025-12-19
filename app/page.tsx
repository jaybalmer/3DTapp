"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/simpleAuth"
import DarkModeToggle from "@/app/components/DarkModeToggle"
import { cn } from "@/lib/utils"

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  const handleEnter = () => {
    setChecking(true)

    if (isAuthenticated()) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
            THREE DOG TECH
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-16">
          {/* Hero Section */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-7xl font-bold tracking-tight font-mono leading-none">
                THREE DOG TECH
              </h1>
              <p className="text-xl font-medium text-muted-foreground">
                Tech Exploration and Company Development
              </p>
            </div>
          </section>

          {/* Content Sections */}
          <div className="grid gap-12 md:grid-cols-2">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight font-mono">
                Mission
              </h2>
              <div className="border-l-2 border-border/40 pl-6">
                <p className="text-sm leading-relaxed text-muted-foreground/90">
                  Three Dog Tech explores technology opportunities before companies are
                  formed. The goal is to reduce risk early by validating plays through
                  focused exploration, documentation, and selective progression.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight font-mono">
                Portfolio Dashboard
              </h2>
              <div className="border-l-2 border-border/40 pl-6">
                <p className="text-sm leading-relaxed text-muted-foreground/90">
                  The Portfolio Dashboard tracks active explorations, their current stage, relative
                  ranking, key documents, and ongoing commentary for deciding what to advance and what to stop.
                </p>
              </div>
            </section>
          </div>

          {/* CTA Section */}
          <section className="border-t border-border/20 pt-12">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Ready to explore?
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Access the internal portfolio dashboard
                </p>
              </div>
              <button
                onClick={handleEnter}
                disabled={checking}
                className={cn(
                  "px-6 py-3 border border-border/40 bg-card hover:bg-muted/20",
                  "font-medium text-sm tracking-tight transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "font-mono"
                )}
              >
                {checking ? "Checking…" : "Enter →"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
