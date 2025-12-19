# Supabase Setup Guide

This app uses Supabase to store user-specific project ratings and comments.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

## Step 2: Run Database Schema

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the SQL

This will create:
- `project_ratings` table
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

## Step 3: Get API Keys

1. In your Supabase project dashboard, go to "Settings" → "API"
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 4: Set Environment Variables

### Local Development

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to any project page
3. You should see the "Team Ratings & Comments" section
4. Try submitting a rating and comment

## Features

- Each user can submit their own ranking (A+, A, B, C, D, E, X) and comment
- Users can update or delete their own ratings
- All team members' ratings are visible to everyone
- Ratings are stored per project and per user (one rating per user per project)

## Database Schema

The `project_ratings` table has the following structure:

- `id` - UUID primary key
- `project_slug` - The project identifier
- `user_email` - User's email address
- `user_name` - User's display name
- `ranking` - One of: A+, A, B, C, D, E, X
- `comment` - Optional text comment
- `created_at` - Timestamp when created
- `updated_at` - Timestamp when last updated

The combination of `project_slug` and `user_email` is unique, so each user can only have one rating per project.

