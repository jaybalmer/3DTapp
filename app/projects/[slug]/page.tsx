import { getProjects } from "@/lib/projects"
import NavHeader from "@/app/components/NavHeader"
import Link from "next/link"
import { cn } from "@/lib/utils"

const canPreview = (url: string) =>
  url.includes("/file/d/") || url.toLowerCase().endsWith(".pdf")

const getPreviewUrl = (url: string) => {
  // Google Drive file → embed
  if (url.includes("/file/d/")) {
    return url.replace("/view", "/preview")
  }

  // PDF → direct embed
  return url
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const projects = await getProjects()
  const project = projects.find((p) => p.slug === slug)

  if (!project) {
    return (
      <>
        <NavHeader />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold tracking-tight font-mono">
              Project not found
            </h1>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
            >
              ← Back to dashboard
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <NavHeader />

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight font-mono leading-tight">
              {project.name}
            </h1>
            {project.ranking && (
              <span className="inline-flex items-center justify-center rounded bg-muted px-3 py-1 text-sm font-mono font-semibold shrink-0">
                {project.ranking}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {project.status && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wide">
                  Stage
                </span>
                <span className="font-mono font-medium text-foreground">
                  {project.status}
                </span>
              </div>
            )}
            {project.ranking && project.status && (
              <span className="text-border">•</span>
            )}
            {project.folder && (
              <Link
                href={project.folder}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono uppercase tracking-wide hover:text-foreground transition-colors"
              >
                Project Folder →
              </Link>
            )}
          </div>
        </header>

        {/* Summary */}
        {project.summary && (
          <section className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Summary
            </h2>
            <div className="border-l-2 border-border/40 pl-6">
              <p className="text-sm leading-relaxed text-muted-foreground/90">
                {project.summary}
              </p>
            </div>
          </section>
        )}

        {/* Comments */}
        {project.comments && (
          <section className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Comments
            </h2>
            <div className="border border-border/20 bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground/90 whitespace-pre-line">
                {project.comments}
              </p>
            </div>
          </section>
        )}

        {/* Documents */}
        {project.documents && project.documents.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
              Documents
            </h2>
            <div className="space-y-6">
              {project.documents.map((doc) => {
                const previewable = canPreview(doc.url)
                const previewUrl = getPreviewUrl(doc.url)

                return (
                  <div
                    key={doc.url}
                    className="border border-border/20 bg-card p-6 space-y-4"
                  >
                    <div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold tracking-tight text-foreground hover:underline inline-flex items-center gap-2"
                      >
                        {doc.label}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>

                    {previewable && (
                      <div className="border border-border/20 rounded overflow-hidden">
                        <iframe
                          src={previewUrl}
                          className="w-full h-[500px]"
                          title={doc.label}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-border/20">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-mono inline-flex items-center gap-2"
          >
            ← Back to dashboard
          </Link>
        </footer>
      </main>
    </>
  )
}
