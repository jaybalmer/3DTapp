"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import NavHeader from "@/app/components/NavHeader"

export default function Dashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    console.log("[DASHBOARD] resolving session…")

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return

      const sessionUser = data.session?.user ?? null

      console.log("[DASHBOARD] session resolved:", !!sessionUser)

      setUser(sessionUser)
      setLoading(false)

      if (!sessionUser) {
        console.log("[DASHBOARD] redirect → /login")
        router.replace("/login")
      }
    })

    return () => {
      mounted = false
    }
  }, [router])


 useEffect(() => {
  if (!user) return

  fetch("/api/projects")
    .then((res) => res.json())
    .then(setProjects)
    .catch(console.error)
}, [user])

  if (loading) return <p>Loading…</p>

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard"
    }
    return null
  }
  
    const ALLOWED_EMAILS = [
    "jaybalmer@gmail.com",
    "damien@quaestus.vc",
    "ysimkin@aflatminor.com",
  ]

  if (!ALLOWED_EMAILS.includes(user.email)) {
    supabase.auth.signOut()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }

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
