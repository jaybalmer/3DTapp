export default function Home() {
  return (
    <main
      style={{
        padding: "48px",
        maxWidth: "720px",
        margin: "0 auto",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ marginBottom: 16 }}>
        Three Dog Tech
      </h1>

      <p style={{ marginBottom: 24 }}>
        Exploration in Tech Frontiers
      </p>

      <a
        href="/dashboard"
        style={{
          display: "inline-block",
          padding: "10px 16px",
          border: "1px solid #000",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        ENTER →
      </a>
    </main>
  )
}
