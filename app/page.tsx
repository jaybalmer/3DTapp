const projects = [
  {
    name: "Hey Voter",
    slug: "hey-voter",
    status: "Exploration",
    domain: "Participation Infrastructure",
  },
  {
    name: "Global Fans Engine",
    slug: "global-fans-engine",
    status: "Exploration",
    domain: "Fan Engagement",
  },
  {
    name: "Nature Token Bank",
    slug: "nature-token-bank",
    status: "Concept",
    domain: "Environmental Value Chains",
  },
  {
    name: "Stock AVP",
    slug: "stock-avp",
    status: "Exploration",
    domain: "Tokenized Project Financing",
  },
]

export default function Home() {
  return (
    <main style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Three Dog Tech</h1>
      <p style={{ fontSize: "18px", color: "#666" }}>
        Exploration Dashboard
      </p>

      <hr style={{ margin: "24px 0" }} />

      <table width="100%" cellPadding={8}>
        <thead>
          <tr align="left">
            <th>Project</th>
            <th>Domain</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.slug}>
              <td>
                <a href={`/projects/${project.slug}`}>{project.name}</a>
              </td>
              <td>{project.domain}</td>
              <td>{project.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
