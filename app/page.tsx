"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  const handleEnter = async () => {
    setChecking(true)

    const { data } = await supabase.auth.getSession()
    const user = data.session?.user

    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <main
      style={{
        padding: "48px",
        maxWidth: "720px",
        margin: "0 auto",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Three Dog Tech</h1>

      <p style={{ marginBottom: 24 }}>
        Exploration in Tech Frontiers
      </p>

      <button
        onClick={handleEnter}
        disabled={checking}
        style={{
          padding: "10px 16px",
          border: "1px solid #000",
          background: "transparent",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        {checking ? "Checking…" : "ENTER →"}
      </button>
    </main>
  )
}
