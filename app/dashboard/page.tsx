"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/simpleAuth"
import NavHeader from "@/app/components/NavHeader"

const RANK_ORDER = ["A+", "A", "B", "C", "D", "E", "X"]
const rankTextColor: Record<string, string> = {
  "A+": "text-blue-300",
  "A": "text-emerald-200",
  "B": "text-emerald-300",
  "C": "text-emerald-500",
  "D": "text-yellow-500"
}

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

const unranked = projects.filter(
  (p) => !RANK_ORDER.includes(p.ranking)
)

return (
  <>
    <NavHeader />

    <main className="mx-auto max-w-5xl px-6 py-8">
      {groupedByRank.map(({ rank, projects }) =>
        projects.length ? (
          <section key={rank} className="mb-12">

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left text-gray-600">{rank} - projects ({projects.length})</th>
                  <th className="py-2 text-left text-gray-600">summary</th>
                  <th className="py-2 text-center text-gray-600">stage</th>
                  <th className="py-2 text-center text-gray-600">rank</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    key={project.slug}
                    className="border-b hover:bg-gray-800"
                  >
                    <td className="py-2">
                      <a
  href={`/projects/${project.slug}`}
  className={`hover:underline ${
    rankTextColor[rank] ?? ""
  } font-medium`}
>
  {project.name}
</a>

                    </td>
                    <td className="py-2 text-gray-500">
                      {project.summary}
                    </td>
                    <td className="py-2 text-center">
                      {project.status}
                    </td>
                    <td className="py-2 text-center font-semibold">
                      {project.ranking}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null
      )}
    </main>
  </>
)}
