import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables. Rating features will not work.")
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface ProjectRating {
  id?: string
  project_slug: string
  user_email: string
  user_name: string
  ranking: string
  comment: string | null
  created_at?: string
  updated_at?: string
}

export interface ProjectDecision {
  id?: string
  project_slug: string
  decision_status: string
  next_steps: string | null
  next_phase_budget: number | null
  updated_by: string
  updated_at?: string
}

export interface DomainRating {
  id?: string
  domain_slug: string
  user_email: string
  user_name: string
  ranking: string
  comment: string | null
  created_at?: string
  updated_at?: string
}

export interface DomainDecision {
  id?: string
  domain_slug: string
  decision_status: string
  next_steps: string | null
  next_phase_budget: number | null
  updated_by: string
  updated_at?: string
}

export interface Domain {
  id?: string
  name: string
  slug: string
  theme: string | null
  ranking: number | null
  created_at?: string
  updated_at?: string
}

