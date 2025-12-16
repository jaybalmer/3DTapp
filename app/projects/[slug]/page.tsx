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
    {/* Header */}
<header style={{ marginBottom: 24 }}>
  <h1 style={{ marginBottom: 12 }}>
    {project.name}
  </h1>

  <div style={{ lineHeight: 1.6}}>
    {project.summary && (
      <div>
        Summary: {project.summary} 
      </div>
    )}

    {project.status && (
      <div>
        Stage: {project.status} 
      </div>
    )}

    {project.ranking && (
      <div>
        Ranking: {project.ranking} 
      </div>
    )}
  </div>
</header>


    {/* Description */}
    {project.summary && (
      <section style={{ marginBottom: 32 }}>
        <p style={{ lineHeight: 1.6 }}>{project.summary}</p>
      </section>
    )}

    <hr />

    {/* Links */}
    {project.folder_url && (
      <section style={{ marginTop: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>
          Project Links
        </h2>

        <ul style={{ paddingLeft: 16 }}>
          <li>
            <a
              href={project.folder_url}
              target="_blank"
              rel="noreferrer"
            >
              Open project folder
            </a>
          </li>
        </ul>
      </section>
    )}

    <hr />

    {project.comments && (
  <>
    <hr style={{ margin: "32px 0" }} />

    <section>
      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        Comments
      </h2>

      <p
        style={{
          whiteSpace: "pre-line",
          lineHeight: 1.6,
        }}
      >
        {project.comments}
      </p>
    </section>
  </>
)}


    {/* Footer */}
    <footer style={{ marginTop: 40 }}>
      <a href="/">← Back to dashboard</a>
    </footer>
  </main>
)

}
