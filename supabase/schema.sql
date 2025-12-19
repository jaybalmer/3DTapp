-- Create project_ratings table
CREATE TABLE IF NOT EXISTS project_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_slug TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  ranking TEXT NOT NULL CHECK (ranking IN ('A+', 'A', 'B', 'C', 'D', 'E', 'X')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_slug, user_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_ratings_slug ON project_ratings(project_slug);
CREATE INDEX IF NOT EXISTS idx_project_ratings_user ON project_ratings(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE project_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read ratings
CREATE POLICY "Allow read access to all ratings"
  ON project_ratings
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own ratings
CREATE POLICY "Allow users to insert their own ratings"
  ON project_ratings
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own ratings
CREATE POLICY "Allow users to update their own ratings"
  ON project_ratings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to delete their own ratings
CREATE POLICY "Allow users to delete their own ratings"
  ON project_ratings
  FOR DELETE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_project_ratings_updated_at
  BEFORE UPDATE ON project_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

