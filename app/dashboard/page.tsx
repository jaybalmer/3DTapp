"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/simpleAuth"
import NavHeader from "@/app/components/NavHeader"

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


  return (
    <>
      <NavHeader />
    
    <main style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Three Dog Tech</h1>
      <p style={{ fontSize: "18px"}}>
        <strong>Exploration Dashboard</strong>
      </p>

      <hr style={{ margin: "24px 0" }} />

      <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">

<thead className="border-b bg-gray-50">
  <tr>
    <th className="px-3 py-2 text-left font-medium text-gray-600">
      Project
    </th>
    <th className="px-3 py-2 text-left font-medium text-gray-600">
      Summary
    </th>
    <th className="px-3 py-2 text-center font-medium text-gray-600">
      Stage
    </th>
    <th className="px-3 py-2 text-center font-medium text-gray-600">
      Rank
    </th>
  </tr>
</thead>

        <tbody>
  {projects.map((project) => (
    <tr
      key={`${project.slug}-${project.name}`}
      className="border-b hover:bg-gray-50"
    >
      <td className="px-3 py-2 font-medium">
        <a
          href={`/projects/${project.slug}`}
          className="text-blue-600 hover:underline"
        >
          {project.name}
        </a>
      </td>

      <td className="px-3 py-2">
        {project.summary}
      </td>

      <td className="px-3 py-2 text-center">
          {project.status}
      </td>

      <td className="px-3 py-2 text-center font-mono">
        {project.ranking}
      </td>

    </tr>
  ))}
</tbody>

      </table>
      </div>
    </main>
  </>
  )
}
