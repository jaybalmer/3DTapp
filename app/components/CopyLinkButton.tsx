"use client"

import { useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface CopyLinkButtonProps {
  url?: string
  className?: string
}

export default function CopyLinkButton({ url, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getFullUrl = () => {
    if (url) return url
    
    // Build URL from current location
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://3dtapp.vercel.app"
    const query = searchParams.toString()
    const fullPath = query ? `${pathname}?${query}` : pathname
    return `${baseUrl}${fullPath}`
  }

  const handleCopy = async () => {
    try {
      const fullUrl = getFullUrl()
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2 py-1 text-xs font-mono",
        "text-muted-foreground hover:text-foreground",
        "transition-colors",
        className
      )}
      title={copied ? "Link copied!" : "Copy link to share"}
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.71-1.71" />
          </svg>
          <span>Copy Link</span>
        </>
      )}
    </button>
  )
}

