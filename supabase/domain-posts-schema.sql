-- Create domain_posts table
CREATE TABLE IF NOT EXISTS domain_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_slug TEXT NOT NULL,
  content TEXT NOT NULL,
  posted_by TEXT NOT NULL,
  posted_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_domain_posts_slug ON domain_posts(domain_slug);
CREATE INDEX IF NOT EXISTS idx_domain_posts_created ON domain_posts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE domain_posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read posts
CREATE POLICY "Allow read access to all domain posts"
  ON domain_posts
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert posts
CREATE POLICY "Allow users to insert domain posts"
  ON domain_posts
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own posts
CREATE POLICY "Allow users to update their own domain posts"
  ON domain_posts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to delete their own posts
CREATE POLICY "Allow users to delete their own domain posts"
  ON domain_posts
  FOR DELETE
  USING (true);

