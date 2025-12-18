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
  try {
    const data = readFileSync(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function saveUsers(users: User[]): void {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")
}

function getAllowedEmails(): string[] {
  try {
    const data = readFileSync(ALLOWED_EMAILS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
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

    return NextResponse.json({
      email: newUser.email,
      name: newUser.name,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

