"use client"

import { useEffect, useState } from "react"

type ThemeMode = "light" | "dark" | "color"

export default function DarkModeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light")

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem("theme") as ThemeMode | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    
    let initialTheme: ThemeMode = "light"
    if (savedTheme && ["light", "dark", "color"].includes(savedTheme)) {
      initialTheme = savedTheme
    } else if (!savedTheme && prefersDark) {
      initialTheme = "dark"
    }
    
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: ThemeMode) => {
    document.documentElement.classList.remove("dark", "color")
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else if (newTheme === "color") {
      document.documentElement.classList.add("color")
    }
  }

  const cycleTheme = () => {
    const themes: ThemeMode[] = ["light", "dark", "color"]
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const newTheme = themes[nextIndex]
    
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-md border border-border/20 bg-card hover:bg-muted/20 transition-colors"
      aria-label={`Current theme: ${theme}. Click to cycle themes`}
      title={`Current theme: ${theme}. Click to cycle themes`}
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : theme === "color" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  )
}

