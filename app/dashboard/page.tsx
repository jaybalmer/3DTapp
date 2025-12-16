"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Dashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return

      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      setLoading(false)

      if (!sessionUser) {
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
    <main style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Three Dog Tech</h1>
      <p style={{ fontSize: "18px", color: "#666" }}>
        Exploration Dashboard
      </p>

      <hr style={{ margin: "24px 0" }} />

      <table width="100%" cellPadding={8}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>project</th>
            <th style={{ textAlign: "left" }}>summary</th>
            <th style={{ textAlign: "left" }}>stage</th>
            <th style={{ textAlign: "left" }}>rank</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={`${project.slug}-${project.name}`}>
              <td>
                <a href={`/projects/${project.slug}`}>{project.name}</a>
              </td>
              <td>{project.summary}</td>
              <td>{project.status}</td>
              <td>{project.ranking}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
