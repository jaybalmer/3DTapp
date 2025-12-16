"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

const projects = [
  {
    name: "Hey Voter",
    slug: "hey-voter",
    status: "Exploration",
    domain: "Participation Infrastructure",
  },
  {
    name: "Global Fans Engine",
    slug: "global-fans-engine",
    status: "Exploration",
    domain: "Fan Engagement",
  },
  {
    name: "Nature Token Bank",
    slug: "nature-token-bank",
    status: "Concept",
    domain: "Environmental Value Chains",
  },
  {
    name: "Stock AVP",
    slug: "stock-avp",
    status: "Exploration",
    domain: "Tokenized Project Financing",
  },
]

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
})

  }, [])

  if (loading) return <p>Loading…</p>

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
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
            <th style={{ textAlign: "left" }}>Project</th>
            <th style={{ textAlign: "left" }}>Domain</th>
            <th style={{ textAlign: "left" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.slug}>
              <td>
                <a href={`/projects/${project.slug}`}>{project.name}</a>
              </td>
              <td>{project.domain}</td>
              <td>{project.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
