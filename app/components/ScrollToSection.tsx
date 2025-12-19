"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

/**
 * Component that scrolls to a specific section based on URL hash or query parameter
 * Usage: Add ?section=ratings or ?section=decision to the URL
 */
export default function ScrollToSection() {
  const searchParams = useSearchParams()
  const section = searchParams.get("section")

  useEffect(() => {
    if (section) {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const element = document.getElementById(section)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
          // Add a subtle highlight effect
          element.classList.add("highlight-section")
          setTimeout(() => {
            element.classList.remove("highlight-section")
          }, 2000)
        }
      }, 100)
    } else {
      // Also check for hash-based navigation
      const hash = window.location.hash.replace("#", "")
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash)
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        }, 100)
      }
    }
  }, [section])

  return null
}

