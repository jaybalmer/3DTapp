"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { logout, getCurrentUser, type User } from "@/lib/simpleAuth"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import DarkModeToggle from "@/app/components/DarkModeToggle"

export default function NavHeader() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    logout()
    router.replace("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <div className="text-xs font-mono text-muted-foreground">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()} dog
            </div>
          )}
          <DarkModeToggle />
          <button
            onClick={handleLogout}
            className={cn(
              "text-xs font-mono uppercase tracking-wide text-muted-foreground",
              "hover:text-foreground transition-colors"
            )}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
