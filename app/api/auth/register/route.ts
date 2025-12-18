import { NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { createHash } from "crypto"

const USERS_FILE = join(process.cwd(), "lib", "users.json")
const ALLOWED_EMAILS_FILE = join(process.cwd(), "lib", "allowedEmails.json")

interface User {
  email: string
  passwordHash: string
  name: string
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

function getUsers(): User[] {
  // Try environment variable first (for production/Vercel)
  if (process.env.USERS_DATA) {
    try {
      const parsed = JSON.parse(process.env.USERS_DATA)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (error) {
      console.error("Error parsing USERS_DATA env var:", error)
    }
  }

  // Fall back to file system (for local development)
  try {
    const data = readFileSync(USERS_FILE, "utf-8")
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) {
      console.error("users.json is not an array")
      return []
    }
    return parsed
  } catch (error) {
    console.error("Error reading users.json:", error)
    return []
  }
}

function saveUsers(users: User[]): void {
  // Only save to file in local development
  // In production, users should be managed via environment variables
  if (process.env.NODE_ENV !== "production") {
    try {
      writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")
    } catch (error) {
      console.error("Error saving users.json:", error)
    }
  }
}

function getAllowedEmails(): string[] {
  // Try environment variable first (for production/Vercel)
  if (process.env.ALLOWED_EMAILS) {
    try {
      const parsed = JSON.parse(process.env.ALLOWED_EMAILS)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (error) {
      console.error("Error parsing ALLOWED_EMAILS env var:", error)
    }
  }

  // Fall back to file system (for local development)
  try {
    const data = readFileSync(ALLOWED_EMAILS_FILE, "utf-8")
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) {
      console.error("allowedEmails.json is not an array")
      return []
    }
    return parsed
  } catch (error) {
    console.error("Error reading allowedEmails.json:", error)
    return []
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if email is in the allowed whitelist
    const allowedEmails = getAllowedEmails()
    const emailLower = email.toLowerCase()
    if (!allowedEmails.some((e) => e.toLowerCase() === emailLower)) {
      return NextResponse.json(
        { error: "Registration is restricted. This email is not authorized." },
        { status: 403 }
      )
    }

    const users = getUsers()
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    )

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    const passwordHash = hashPassword(password)
    const newUser: User = {
      email: email.toLowerCase(),
      passwordHash,
      name: name || email.split("@")[0],
    }

    users.push(newUser)
    saveUsers(users)

    // In production, warn that new users need to be added via environment variables
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "New user registered in production. Update USERS_DATA environment variable:",
        JSON.stringify(users)
      )
    }

    return NextResponse.json({
      email: newUser.email,
      name: newUser.name,
    })
  } catch (error) {
    console.error("Registration error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

