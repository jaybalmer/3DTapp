"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LinkPreviewData {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
}

interface LinkPreviewProps {
  url: string
}

export default function LinkPreview({ url }: LinkPreviewProps) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchPreview = async () => {
      try {
        // Normalize URL
        let targetUrl = url
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
          targetUrl = "https://" + targetUrl
        }

        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(targetUrl)}`)
        
        if (response.ok) {
          const data = await response.json()
          if (isMounted) {
            setPreview(data)
            setError(false)
          }
        } else {
          if (isMounted) {
            setError(true)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPreview()

    return () => {
      isMounted = false
    }
  }, [url])

  if (loading) {
    return null // Don't show anything while loading
  }

  if (error || !preview) {
    return null // Don't show anything if there's an error or no preview data
  }

  // Show preview even if we only have basic info (for Instagram and similar)
  const hasBasicInfo = preview.title || preview.description || preview.siteName
  if (!hasBasicInfo) {
    return null
  }

  const displayUrl = new URL(preview.url)
  const domain = displayUrl.hostname.replace("www.", "")

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block mt-3 border border-border/40 rounded overflow-hidden",
        "hover:border-border/60 transition-colors",
        "bg-card"
      )}
    >
      {preview.image && (
        <div className="w-full h-48 overflow-hidden bg-muted">
          <img
            src={preview.image}
            alt={preview.title || "Preview"}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = "none"
            }}
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        {preview.siteName && (
          <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
            {preview.siteName}
          </div>
        )}
        {preview.title && (
          <h3 className="text-sm font-semibold tracking-tight text-foreground line-clamp-2">
            {preview.title}
          </h3>
        )}
        {preview.description && (
          <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
            {preview.description}
          </p>
        )}
        <div className="text-xs font-mono text-muted-foreground/60 truncate">
          {domain}
        </div>
      </div>
    </a>
  )
}

