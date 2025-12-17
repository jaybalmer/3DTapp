"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/simpleAuth"

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
    <main
      style={{
        padding: "48px",
        maxWidth: "900px",
        margin: "0 auto",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Three Dog Tech</h1>

      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Tech Exploration and Company Development
      </p>

      <section style={{ marginBottom: 32 }}>
        <p>
          Three Dog Tech explores technology opportunities before companies are
          formed. The goal is to reduce risk early by validating ideas through
          focused exploration, documentation, and selective progression.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <p>
          The Portfolio Dashboard tracks active explorations, their current stage, relative
          ranking, key documents, and ongoing commentary for deciding what to advance and what to stop.
        </p>
      </section>

      <button
        onClick={handleEnter}
        disabled={checking}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          border: "1px solid #000",
          background: "transparent",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        {checking ? "Checking…" : "Enter →"}
      </button>
    </main>
  )
}
