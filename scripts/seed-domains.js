#!/usr/bin/env node

/**
 * Script to seed initial domains into Supabase
 * Usage: node scripts/seed-domains.js
 * 
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        process.env[key] = value
      }
    })
  }
}

loadEnvFile()

const domains = [
  {
    name: "Participation & Prediction Markets",
    theme: "Turning attention into action and capital"
  },
  {
    name: "Tokenized Project Financing & RWAs",
    theme: "New capital rails before institutions adapt"
  },
  {
    name: "Fan Engagement & Emerging Markets",
    theme: "Undervalued global passion networks"
  },
  {
    name: "Environmental Value Chains",
    theme: "Measurement unlocks ownable assets"
  },
  {
    name: "Spatial / Real-World Digital Systems",
    theme: "Real-world anchoring creates defensibility"
  },
  {
    name: "Media, Characters & Interactive IP",
    theme: "AI-driven storytelling and ownership"
  },
  {
    name: "AI Operations for Exploration",
    theme: "Discovery itself becomes leverage"
  }
]

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function seedDomains() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set")
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log("Seeding domains...")

  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i]
    const slug = slugify(domain.name)
    const ranking = i + 1
    
    // Check if domain already exists
    const { data: existing } = await supabase
      .from("domains")
      .select("slug, ranking")
      .eq("slug", slug)
      .single()

    if (existing) {
      // Update ranking if it's not set
      if (!existing.ranking) {
        const { error: updateError } = await supabase
          .from("domains")
          .update({ ranking })
          .eq("slug", slug)
        
        if (updateError) {
          console.error(`Error updating ranking for "${domain.name}":`, updateError.message)
        } else {
          console.log(`✓ Updated ranking for "${domain.name}" to ${ranking}`)
        }
      } else {
        console.log(`Domain "${domain.name}" already exists with ranking ${existing.ranking}, skipping...`)
      }
      continue
    }

    const { data, error } = await supabase
      .from("domains")
      .insert({
        slug,
        name: domain.name,
        theme: domain.theme,
        ranking
      })
      .select()
      .single()

    if (error) {
      console.error(`Error creating domain "${domain.name}":`, error.message)
    } else {
      console.log(`✓ Created domain: ${domain.name} (rank ${ranking})`)
    }
  }

  console.log("\nDone!")
}

seedDomains().catch(console.error)

