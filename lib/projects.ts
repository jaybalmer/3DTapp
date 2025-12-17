import Papa from "papaparse"

export type ProjectDocument = {
  label: string
  url: string
}

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

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsOY9qQSTMElqN-EYUBlHbuCpUYkUAKTkD6_5hNnzSDF__Uv9Bu5OYrVXvvKG5Wvc0PtmFawI32fEJ/pub?output=csv",
    { cache: "no-store" }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch projects sheet")
  }

  const text = await res.text()

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length) {
    console.error("CSV parse errors:", parsed.errors)
  }

  const rows = parsed.data as any[]

  return rows
    .map((row) => {
      if (!row.name) return null

      return {
        slug: row.slug || slugify(row.name),
        name: clean(row.name),
        summary: clean(row.summary),
        status: clean(row.status),
        ranking: clean(row.ranking),
        folder: clean(row.folder),
        comments: clean(row.comments),
        documents: parseDocuments(row.documents),
      }
    })
    .filter(Boolean) as Project[]
}
