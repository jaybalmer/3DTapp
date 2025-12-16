export type Project = {
  slug: string
  name: string
  summary: string
  status: string
  ranking: string
  folder_url: string
  comments: string
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsOY9qQSTMElqN-EYUBlHbuCpUYkUAKTkD6_5hNnzSDF__Uv9Bu5OYrVXvvKG5Wvc0PtmFawI32fEJ/pub?output=csv",
    { cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch projects sheet")
  }

  const text = await res.text()

  const lines = text.trim().split("\n")
  const [, ...rows] = lines // skip header row

  return rows.map((row) => {
    const [
      slug,
      name,
      summary,
      status,
      ranking,
      folder_url,
      comments,
    ] = row.split(",")

    return {
      slug: slug
  ?.trim()
  .toLowerCase()
  .replace(/^"+|"+$/g, "") // strip leading/trailing quotes
  .replace(/\r/g, ""),

      name: name?.trim(),
      summary: summary?.trim(),
      status: status?.trim(),
      ranking: ranking?.trim(),
      folder_url: folder_url?.trim(),
      comments: comments?.trim(),
    }
  })
}
