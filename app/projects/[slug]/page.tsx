import { getProjects } from "@/lib/projects"

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
      <main style={{ padding: 32 }}>
        <h1>Project not found</h1>
        <p>
          <a href="/">← Back to dashboard</a>
        </p>
      </main>
    )
  }

  return (
    <main style={{ padding: 32, maxWidth: 800, margin: "0 auto" }}>
      <h1>{project.name}</h1>

      <p style={{ color: "#666", marginBottom: 16 }}>
        {project.domain} · {project.status}
      </p>

      <p>{project.description}</p>

      {project.folder_url && (
        <p style={{ marginTop: 16 }}>
          <a href={project.folder_url} target="_blank" rel="noreferrer">
            Open Project Folder
          </a>
        </p>
      )}

      <p style={{ marginTop: 32 }}>
        <a href="/">← Back to dashboard</a>
      </p>
    </main>
  )
}
