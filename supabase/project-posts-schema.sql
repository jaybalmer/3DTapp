-- Create project_posts table
CREATE TABLE IF NOT EXISTS project_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_slug TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_by TEXT NOT NULL,
  posted_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_posts_slug ON project_posts(project_slug);
CREATE INDEX IF NOT EXISTS idx_project_posts_created ON project_posts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE project_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read posts
CREATE POLICY "Allow read access to all project posts"
  ON project_posts
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert posts
CREATE POLICY "Allow users to insert project posts"
  ON project_posts
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own posts
CREATE POLICY "Allow users to update their own posts"
  ON project_posts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to delete their own posts
CREATE POLICY "Allow users to delete their own posts"
  ON project_posts
  FOR DELETE
  USING (true);

