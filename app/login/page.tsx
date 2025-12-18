"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login, register } from "@/lib/simpleAuth"
import DarkModeToggle from "@/app/components/DarkModeToggle"
import { cn } from "@/lib/utils"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isRegistering) {
        const result = await register(email, password, name)
        if (result.success) {
          router.replace("/dashboard")
        } else {
          setError(result.error || "Registration failed")
        }
      } else {
        const success = await login(email, password)
        if (success) {
          router.replace("/dashboard")
        } else {
          setError("Invalid email or password")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
            THREE DOG TECH
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-sm px-6 py-16">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight font-mono">
              {isRegistering ? "Create Account" : "Welcome Dog"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRegistering
                ? "Registration is restricted to authorized emails only"
                : "Sign in to access the portfolio"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-border/40 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-border/40 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-border/40 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border"
                placeholder={isRegistering ? "At least 6 characters" : "Password"}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full border border-border/40 bg-card hover:bg-muted/20",
                "px-4 py-2 text-sm font-medium tracking-tight transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "font-mono"
              )}
            >
              {loading
                ? "Processing..."
                : isRegistering
                ? "Register →"
                : "Sign In →"}
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setError("")
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              {isRegistering
                ? "Already have an account? Sign in"
                : "Need an account? Register"}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
