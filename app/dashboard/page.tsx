"use client"

import { useEffect, useState, Fragment } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/simpleAuth"
import NavHeader from "@/app/components/NavHeader"
import { cn } from "@/lib/utils"

/* -----------------------------
   Config
----------------------------- */

const RANK_ORDER = ["A+", "A", "B", "C", "D", "E", "X"]

const convictionConfig: Record<
  string,
  {
    label: string
    description: string
    borderColor: string
  }
> = {
  "A+": {
    label: "Highest Conviction",
    description: "Active development, strong market signals, proven team",
    borderColor: "border-l-border",
  },
  A: {
    label: "High Conviction",
    description: "Validated thesis, positive indicators, scaling phase",
    borderColor: "border-l-border/60",
  },
  B: {
    label: "Emerging Conviction",
    description: "Early validation, monitoring metrics, potential upside",
    borderColor: "border-l-border/40",
  },
  C: {
    label: "Exploratory",
    description: "Initial research, thesis formation, awaiting data",
    borderColor: "border-l-border/20",
  },
  D: {
  label: "Low Conviction",
  description: "Weak signals, high uncertainty, parked for now",
  borderColor: "border-l-muted-border/10",
},
E: {
  label: "Very Low Conviction",
  description: "Unclear thesis, minimal signal, likely discard",
  borderColor: "border-l-border/5",
},
X: {
  label: "Internal Capability",
  description: "Exploring to develop capabilities, dogfood for internal projects",
  borderColor: "border-l-destructive/40",
},

}

/* -----------------------------
   Conviction Section Component
----------------------------- */

function ConvictionSection({
  level,
  projects,
  decisions,
}: {
  level: string
  projects: any[]
  decisions: Record<string, any>
}) {
  const config = convictionConfig[level]
  if (!config || !projects.length) return null

  return (
    <section className="space-y-4">
      
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-2xl font-semibold tracking-tight font-mono">
            {level}
          </h2>
          <span className="text-sm font-medium text-muted-foreground">
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {config.description}
          </span>
        </div>
      

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {projects.map((project) => (
          <div
            key={project.slug}
            className={cn(
              "border border-border/20 bg-card p-4 space-y-3",
              "border-l-4",
              config.borderColor
            )}
          >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <a
                    href={`/projects/${project.slug}`}
                    className="block text-[15px] font-semibold tracking-tight text-foreground no-underline hover:underline"
                  >
                    {project.name}
                  </a>
                </div>
              </div>
              
              {project.summary && (
                <div className="text-sm leading-relaxed text-muted-foreground/80">
                  {project.summary}
                </div>
              )}
              
              {project.status && (
                <div className="text-xs font-mono text-muted-foreground">
                  Stage: <span className="font-medium text-foreground">{project.status}</span>
                </div>
              )}
              
              {decisions[project.slug] && (
                <div className="pt-2 border-t border-border/20">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="font-mono font-semibold text-foreground">
                      {decisions[project.slug].decision_status}
                    </span>
                    {decisions[project.slug].next_steps && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-muted-foreground/80">
                          {decisions[project.slug].next_steps}
                        </span>
                      </>
                    )}
                    {decisions[project.slug].next_phase_budget && (
                      <>
                        <span className="text-border">•</span>
                        <span className="font-mono text-muted-foreground">
                          {new Intl.NumberFormat("en-CA", {
                            style: "currency",
                            currency: "CAD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(decisions[project.slug].next_phase_budget)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block border border-border/20 bg-card">
        <table className="w-full border-collapse border-0">
          <thead className="border-b border-border/20 bg-muted/20">
            <tr>
              <th className="px-6 py-2 text-left text-[11px] font-mono uppercase tracking-wide text-muted-foreground/70">
                Project
              </th>
              <th className="px-6 py-2 text-left text-[11px] font-mono uppercase tracking-wide text-muted-foreground/70">
                Summary
              </th>
              <th className="px-6 py-2 text-left text-[11px] font-mono uppercase tracking-wide text-muted-foreground/70">
                Stage
              </th>
              <th className="px-6 py-2 text-left text-[11px] font-mono uppercase tracking-wide text-muted-foreground/70">
                Decision
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/30">
            {projects.map((project, index) => (
              <Fragment key={project.slug}>
                <tr
                  className={cn(
                    "border-l border-border/40 transition-colors hover:bg-muted/20",
                    decisions[project.slug] && "border-b-0",
                    config.borderColor
                  )}
                >
                  <td className={cn("px-6 py-3", decisions[project.slug] && "border-b-0")}>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-[2px] bg-foreground/40" />
                      <a
                        href={`/projects/${project.slug}`}
                        className="block text-[15px] font-semibold tracking-tight text-foreground no-underline hover:underline"
                      >
                        {project.name}
                      </a>
                    </div>
                  </td>

                  <td className={cn("px-6 py-3", decisions[project.slug] && "border-b-0")}>
                    <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground/80">
                      {project.summary}
                    </div>
                  </td>

                  <td className={cn("px-6 py-3", decisions[project.slug] && "border-b-0")}>
                    <div className="text-sm font-mono font-medium">
                      {project.status}
                    </div>
                  </td>

                  <td className={cn("px-6 py-3", decisions[project.slug] && "border-b-0")}>
                    <span className={cn(
                      "inline-flex items-center justify-center rounded px-3 py-1 text-xs font-mono font-semibold",
                      decisions[project.slug]
                        ? "bg-muted text-foreground"
                        : "bg-muted/30 text-muted-foreground"
                    )}>
                      {decisions[project.slug] ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
                {decisions[project.slug] && (
                  <tr className={cn(
                    "border-l border-border/40 bg-muted/10 border-t-0",
                    config.borderColor
                  )}>
                    <td className="px-6 pt-0 pb-3 border-t-0">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-[2px] bg-foreground/40" />
                        <span className="text-xs font-mono font-semibold text-foreground">
                          {decisions[project.slug].decision_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 pt-0 pb-3 border-t-0">
                      {decisions[project.slug].next_steps && (
                        <div className="text-xs text-muted-foreground/80">
                          {decisions[project.slug].next_steps}
                        </div>
                      )}
                    </td>
                    <td className="px-6 pt-0 pb-3 border-t-0"></td>
                    <td className="px-6 pt-0 pb-3 border-t-0">
                      {decisions[project.slug].next_phase_budget && (
                        <div className="text-xs font-mono text-muted-foreground">
                          {new Intl.NumberFormat("en-CA", {
                            style: "currency",
                            currency: "CAD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(decisions[project.slug].next_phase_budget)}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* -----------------------------
   Page
----------------------------- */

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [decisions, setDecisions] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
    }
  }, [router])

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then(setProjects)
      .catch(console.error)

    fetch("/api/projects/decisions")
      .then((res) => res.json())
      .then((data) => {
        const decisionsMap: Record<string, any> = {}
        data.forEach((d: any) => {
          decisionsMap[d.project_slug] = d
        })
        setDecisions(decisionsMap)
      })
      .catch(console.error)
  }, [])

  const groupedByRank = RANK_ORDER.map((rank) => ({
    rank,
    projects: projects.filter((p) => p.ranking === rank),
  }))

  return (
    <>
      <NavHeader />

      <main className="mx-auto max-w-6xl space-y-16 px-4 md:px-6 py-6 md:py-10">

<header className="mb-12 space-y-3">
  <div className="flex items-baseline justify-between">
    <h1 className="text-2xl font-semibold tracking-tight">
  <span>THREE DOG TECH</span>
  <span className="mx-2 text-muted-foreground">&nbsp; | &nbsp;</span>
  <span className="font-normal text-muted-foreground">
    Exploration Portfolio
  </span>
</h1>


    <div className="text-xs text-muted-foreground">
      ACCESS: INTERNAL
    </div>
  </div>

  <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-3 md:gap-6">
    <span>
      Total Explorations&nbsp;
      <span className="text-xl font-medium text-foreground">
        {projects.length}
      </span>
    </span>

    {[
      { label: "Plays", statuses: ["New Play", "Play"] },
      { label: "Exploration", statuses: ["Exploration"] },
      { label: "Concept", statuses: ["Concept"] },
      { label: "Development", statuses: ["Development"] },
    ].map(({ label, statuses }) => {
      const count = projects.filter((p) => 
        statuses.some((s) => p.status === s)
      ).length
      return (
        <span key={label}>
          {label}&nbsp;
          <span className="text-xl font-medium text-foreground">
            {count}
          </span>
        </span>
      )
    })}
  </div>

</header>


        {groupedByRank.map(({ rank, projects }) => (
          <ConvictionSection
            key={rank}
            level={rank}
            projects={projects}
            decisions={decisions}
          />
        ))}
      </main>
    </>
  )
}
