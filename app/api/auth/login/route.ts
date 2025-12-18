import { NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
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
  try {
    const data = readFileSync(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

