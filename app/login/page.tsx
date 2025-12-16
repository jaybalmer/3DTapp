"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    let mounted = true

    console.log("[LOGIN] resolving session…")

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return

      const sessionUser = data.session?.user ?? null
      
      console.log("[LOGIN] session resolved:", !!sessionUser)
      
      setUser(sessionUser)
      setLoading(false)

      if (sessionUser) {
        console.log("[LOGIN] redirect → /dashboard")
        router.replace("/dashboard")
      }
    })

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()

  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })

  setSent(true)
}


    return () => {
      mounted = false
    }
  }, [router])

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    setSent(true)
  }

  if (loading) return <p>Loading…</p>

  return (
    <main>
      {sent ? (
  <p>Check your email for the magic link.</p>
) : (
  <form onSubmit={handleLogin}>
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="you@example.com"
      required
    />
    <button type="submit">Send magic link</button>
  </form>
)}

    </main>
  )
}
