-- Create project_post_comments table
CREATE TABLE IF NOT EXISTS project_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES project_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  posted_by TEXT NOT NULL,
  posted_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_post_comments_post_id ON project_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_project_post_comments_created ON project_post_comments(created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE project_post_comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read comments
CREATE POLICY "Allow read access to all project post comments"
  ON project_post_comments
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert comments
CREATE POLICY "Allow users to insert project post comments"
  ON project_post_comments
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own comments
CREATE POLICY "Allow users to update their own project post comments"
  ON project_post_comments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to delete their own comments
CREATE POLICY "Allow users to delete their own project post comments"
  ON project_post_comments
  FOR DELETE
  USING (true);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_post_comments_updated_at
  BEFORE UPDATE ON project_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create domain_post_comments table
CREATE TABLE IF NOT EXISTS domain_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES domain_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  posted_by TEXT NOT NULL,
  posted_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_domain_post_comments_post_id ON domain_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_domain_post_comments_created ON domain_post_comments(created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE domain_post_comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read comments
CREATE POLICY "Allow read access to all domain post comments"
  ON domain_post_comments
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert comments
CREATE POLICY "Allow users to insert domain post comments"
  ON domain_post_comments
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own comments
CREATE POLICY "Allow users to update their own domain post comments"
  ON domain_post_comments
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to delete their own comments
CREATE POLICY "Allow users to delete their own domain post comments"
  ON domain_post_comments
  FOR DELETE
  USING (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_domain_post_comments_updated_at
  BEFORE UPDATE ON domain_post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

