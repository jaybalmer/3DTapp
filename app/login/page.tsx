"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/simpleAuth"

export default function Login() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (login(password)) {
      router.replace("/dashboard")
    } else {
      setError("Incorrect password")
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="mb-6 text-xl font-medium">Enter Access Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2"
          placeholder="Password"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="w-full border border-black px-4 py-2">
          Enter
        </button>
      </form>
    </main>
  )
}
