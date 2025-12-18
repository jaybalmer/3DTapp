"use client"

import { useEffect, useState } from "react"
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
}: {
  level: string
  projects: any[]
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
      

      <div className="border border-border/20 bg-card">
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
                Rank
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/30">
            {projects.map((project, index) => (
              <tr
                key={project.slug}
                className={cn(
                  "border-l border-border/40 transition-colors hover:bg-muted/20",
                  config.borderColor
                )}
              >
                <td className="px-6 py-4">
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



                <td className="px-6 py-4">
                  <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground/80">
                    {project.summary}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm font-mono font-medium">
                    {project.status}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center rounded bg-muted px-3 py-1 text-sm font-mono font-semibold">
                    {project.ranking}
                  </span>
                </td>

              </tr>
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
  }, [])

  const groupedByRank = RANK_ORDER.map((rank) => ({
    rank,
    projects: projects.filter((p) => p.ranking === rank),
  }))

  return (
    <>
      <NavHeader />

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-10">

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

  <div className="text-sm text-muted-foreground">
  <span>
    Total Explorations&nbsp;
    <span className="text-xl font-medium text-foreground">
      {projects.length}
    </span>
  </span>

  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

  {["A+", "A", "B", "C", "D", "E", "X"].map((r) => (
    <span key={r}>
      {r}&nbsp;
      <span className="text-xl font-medium text-foreground">
        {projects.filter((p) => p.ranking === r).length}
      </span>
      &nbsp;&nbsp;&nbsp;&nbsp;
    </span>
  ))}
</div>

</header>


        {groupedByRank.map(({ rank, projects }) => (
          <ConvictionSection
            key={rank}
            level={rank}
            projects={projects}
          />
        ))}
      </main>
    </>
  )
}
