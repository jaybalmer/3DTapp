#!/usr/bin/env node

/**
 * Script to generate environment variable values for Vercel deployment
 * Usage: node scripts/generate-vercel-env.js
 */

const { readFileSync } = require("fs")
const { join } = require("path")

const USERS_FILE = join(process.cwd(), "lib", "users.json")
const ALLOWED_EMAILS_FILE = join(process.cwd(), "lib", "allowedEmails.json")

try {
  const usersData = readFileSync(USERS_FILE, "utf-8")
  const allowedEmailsData = readFileSync(ALLOWED_EMAILS_FILE, "utf-8")

  console.log("\n=== VERCEL ENVIRONMENT VARIABLES ===\n")
  console.log("Add these to your Vercel project settings:\n")
  console.log("Variable: USERS_DATA")
  console.log("Value:")
  console.log(JSON.stringify(JSON.parse(usersData), null, 2))
  console.log("\n" + "=".repeat(50) + "\n")
  console.log("Variable: ALLOWED_EMAILS")
  console.log("Value:")
  console.log(JSON.stringify(JSON.parse(allowedEmailsData), null, 2))
  console.log("\n" + "=".repeat(50) + "\n")
  console.log("Copy the JSON values above (without the Variable/Value labels)")
  console.log("and paste them into Vercel's environment variables section.\n")
} catch (error) {
  console.error("Error:", error.message)
  process.exit(1)
}

