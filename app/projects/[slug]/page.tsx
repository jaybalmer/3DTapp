import { getProjects } from "@/lib/projects"

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



    {project.comments && (
  <>
    <hr style={{ margin: "32px 0" }} />

    <section>
      <h2 style={{ fontSize: 16, marginBottom: 8 }}>
        comments
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
    <hr style={{ margin: "32px 0" }} />

    {/* Links */}
    {project.folder && (
      <section style={{ marginTop: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>
          Documents
        </h2>

        <ul>
          <li>
            <a
              href={project.folder}
              target="_blank"
              rel="noreferrer"
            >
              Project Folder
            </a>
          </li>
        </ul>
      </section>
    )}
{project.documents && project.documents.length > 0 && (
  <>
    <section>
      {project.documents.map((doc) => {
        const previewable = canPreview(doc.url)
        const previewUrl = getPreviewUrl(doc.url)

        return (
          <div
            key={doc.url}
            style={{
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px solid #eee",
            }}
          >
            <div style={{ marginBottom: 8 }}>
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                style={{ fontWeight: 500 }}
              >
                {doc.label}
              </a>
            </div>

            {previewable && (
              <iframe
                src={previewUrl}
                style={{
                  width: "100%",
                  height: 300,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
            )}
          </div>
        )
      })}
    </section>
  </>
)}


    {/* Footer */}
    <footer style={{ marginTop: 40 }}>
      <a href="/dashboard">← Back to dashboard</a>
    </footer>
  </main>
)

}
