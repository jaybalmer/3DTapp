import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { createHash } from "crypto"

const USERS_FILE = join(process.cwd(), "lib", "users.json")

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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const users = getUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const passwordHash = hashPassword(password)
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Return user info (without password hash)
    return NextResponse.json({
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error("Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

