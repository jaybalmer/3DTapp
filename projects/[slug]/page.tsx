export default function ProjectPage({
  params,
}: {
  params: { slug: string }
}) {
  return (
    <main style={{ padding: 32 }}>
      <h1>Project: {params.slug}</h1>
      <p>This is the project detail page.</p>

      <p style={{ marginTop: 32 }}>
        <a href="/">← Back to dashboard</a>
      </p>
    </main>
  )
}
