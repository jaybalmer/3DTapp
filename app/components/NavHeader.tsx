"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { logout, getCurrentUser, type User } from "@/lib/simpleAuth"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import DarkModeToggle from "@/app/components/DarkModeToggle"
// import { openWhatsAppGroup, getWhatsAppGroupUrl } from "@/lib/whatsapp"

export default function NavHeader() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  // const [hasWhatsAppGroup, setHasWhatsAppGroup] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
    // Check if WhatsApp group is configured
    // setHasWhatsAppGroup(getWhatsAppGroupUrl() !== null)
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
          <Link
            href="/domains"
            className="text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            Domains
          </Link>
          <Link
            href="/post"
            className="text-xs font-mono uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
          >
            Post
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* WhatsApp chat button - disabled until correct group ID is available */}
          {/* {hasWhatsAppGroup && (
            <button
              onClick={openWhatsAppGroup}
              className={cn(
                "inline-flex items-center gap-1.5",
                "px-2 py-1 text-xs font-mono",
                "text-muted-foreground hover:text-foreground",
                "transition-colors"
              )}
              title="Open WhatsApp Group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span>Chat</span>
            </button>
          )} */}
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
