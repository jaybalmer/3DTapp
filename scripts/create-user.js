#!/usr/bin/env node

/**
 * Script to create a new user in the users.json file
 * Usage: node scripts/create-user.js <email> <password> [name]
 */

const { readFileSync, writeFileSync } = require("fs")
const { join } = require("path")
const { createHash } = require("crypto")

const USERS_FILE = join(process.cwd(), "lib", "users.json")

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex")
}

function getUsers() {
  try {
    const data = readFileSync(USERS_FILE, "utf-8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function saveUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8")
}

const [email, password, name] = process.argv.slice(2)

if (!email || !password) {
  console.error("Usage: node scripts/create-user.js <email> <password> [name]")
  process.exit(1)
}

const users = getUsers()
const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

if (existingUser) {
  console.error(`User with email ${email} already exists`)
  process.exit(1)
}

const passwordHash = hashPassword(password)
const newUser = {
  email: email.toLowerCase(),
  passwordHash,
  name: name || email.split("@")[0],
}

users.push(newUser)
saveUsers(users)

console.log(`User created successfully:`)
console.log(`  Email: ${newUser.email}`)
console.log(`  Name: ${newUser.name}`)

