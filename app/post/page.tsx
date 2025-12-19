"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavHeader from "@/app/components/NavHeader"
import { isAuthenticated, getCurrentUser } from "@/lib/simpleAuth"

export default function PostPage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }

    // Load projects
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data)
        if (data.length > 0) {
          setSelectedProject(data[0].slug)
        }
      })
      .catch(console.error)
  }, [router])

  const handlePaste = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text")
    setContent(pastedText)
  }

  const handlePost = async () => {
    if (!content.trim()) {
      setError("Please paste some content")
      return
    }

    if (!selectedProject) {
      setError("Please select a project")
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const user = getCurrentUser()
      if (!user) {
        setError("You must be logged in to post")
        return
      }

      const response = await fetch(`/api/projects/${selectedProject}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          posted_by: user.email,
          posted_by_name: user.name || user.email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || "Failed to post content. Please try again.")
        return
      }

      setSuccess(true)
      setContent("")
      setTimeout(() => {
        setSuccess(false)
        router.push(`/projects/${selectedProject}`)
      }, 1500)
    } catch (err) {
      setError("Failed to post content. Please try again.")
      console.error("Post error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setContent("")
    setError("")
    setSuccess(false)
  }

  return (
    <>
      <NavHeader />
      <main className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight font-mono">
            Post Content
          </h1>
          <p className="text-sm text-muted-foreground">
            Paste content from any source (WhatsApp, email, notes, links, etc.). Select a project to save it to.
          </p>
        </header>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="project"
              className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2"
            >
              Select Project
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full border border-border/40 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border font-mono"
            >
              {projects.map((project) => (
                <option key={project.slug} value={project.slug}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2"
            >
              Paste Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder="Paste content here (messages, links, notes, text from any source, etc.)"
              className="w-full border border-border/40 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-border min-h-[200px] font-mono"
              rows={10}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Tip: You can paste text, links, or content from any source
            </p>
          </div>

          {error && (
            <div className="px-4 py-2 bg-destructive/10 border border-destructive/20 text-sm text-destructive font-mono">
              {error}
            </div>
          )}

          {success && (
            <div className="px-4 py-2 bg-muted border border-border/20 text-sm text-foreground font-mono">
              Content posted successfully! Redirecting to project...
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handlePost}
              disabled={loading || !content.trim() || !selectedProject}
              className="px-4 py-2 text-sm font-mono border border-border/40 bg-card hover:bg-muted/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post to Project →"}
            </button>
            <button
              onClick={handleClear}
              disabled={loading || !content}
              className="px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="border-t border-border/20 pt-6 space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
            How to Use
          </h2>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Copy the content you want to post from any source (WhatsApp, email, notes, etc.)</li>
            <li>Select the project you want to save it to</li>
            <li>Paste the content into the text area (or type it manually)</li>
            <li>Click "Post to Project" to save it</li>
          </ol>
        </div>
      </main>
    </>
  )
}

