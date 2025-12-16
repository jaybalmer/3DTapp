export type Project = {
  slug: string
  name: string
  summary: string
  status: string
  ranking: string
  folder: string
  comments: string
  documents: ProjectDocument[]
}
export type ProjectDocument = {
  label: string
  url: string
}
const clean = (v?: string) =>
  (v ?? "")
    .trim()
    .replace(/\r/g, "")
    .replace(/^"+|"+$/g, "")

const slugify = (name: string) =>
  clean(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const parseDocuments = (raw?: string): ProjectDocument[] => {
  if (!raw) return []

  return raw
    .split("\n")
    .map((line) => {
      const [label, url] = line.split("|").map((s) => s.trim())
      if (!label || !url) return null
      if (!url.startsWith("http")) return null
      return { label, url }
    })
    .filter(Boolean) as ProjectDocument[]
}
const SHEET_HEADERS = {
  slug: "slug",
  name: "name",
  summary: "summary",
  status: "status",
  ranking: "ranking",
  folder: "folder",
  comments: "comments",
  documents: "documents",
} as const


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
  const [headerLine, ...rows] = lines
  const headers = headerLine.split(",").map(clean)

  const getByHeader = (cols: string[], header: string) => {
    const index = headers.indexOf(header)
    return index === -1 ? "" : clean(cols[index])
  }

  
  const parseDocuments = (raw?: string) => {
  if (!raw) return []

  return raw
    .split("\n")
    .map((line) => {
      const [label, url] = line.split("|").map((s) => s.trim())
      if (!label || !url) return null
      if (!url.startsWith("http")) return null
      return { label, url }
    })
    .filter(Boolean) as { label: string; url: string }[]
}
  return rows.map((row) => {
    const cols = row.split(",")

    const slug = getByHeader(cols, SHEET_HEADERS.slug)
    const name = getByHeader(cols, SHEET_HEADERS.name)
    const summary = getByHeader(cols, SHEET_HEADERS.summary)
    const status = getByHeader(cols, SHEET_HEADERS.status)
    const ranking = getByHeader(cols, SHEET_HEADERS.ranking)
    const folder = getByHeader(cols, SHEET_HEADERS.folder)
    const comments = getByHeader(cols, SHEET_HEADERS.comments)

    const documentsRaw = getByHeader(cols, SHEET_HEADERS.documents)
    const documents = parseDocuments(documentsRaw)

    if (!name) return null

    return {
      slug: slug || slugify(name),
      name,
      summary,
      status,
      ranking,
      folder,
      comments,
      documents,
    }
  }).filter(Boolean) as Project[]
}
