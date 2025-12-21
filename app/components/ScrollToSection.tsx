"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"

/**
 * Component that scrolls to a specific section based on URL hash or query parameter
 * Usage: Add ?section=ratings or ?section=decision to the URL
 */
export default function ScrollToSection() {
  const searchParams = useSearchParams()
  const section = searchParams.get("section")
  const lastSectionRef = useRef<string | null>(null)
  const hasScrolledRef = useRef(false)

  useEffect(() => {
    // Only scroll if we have a section parameter and it's different from last time
    if (section && section !== lastSectionRef.current) {
      lastSectionRef.current = section
      hasScrolledRef.current = false
      
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const element = document.getElementById(section)
        if (element && !hasScrolledRef.current) {
          hasScrolledRef.current = true
          element.scrollIntoView({ behavior: "smooth", block: "start" })
          // Add a subtle highlight effect
          element.classList.add("highlight-section")
          setTimeout(() => {
            element.classList.remove("highlight-section")
          }, 2000)
        }
      }, 100)
      return
    }

    // Only check hash on initial mount if no section parameter
    if (!section && !hasScrolledRef.current) {
      const hash = window.location.hash.replace("#", "")
      if (hash) {
        hasScrolledRef.current = true
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

