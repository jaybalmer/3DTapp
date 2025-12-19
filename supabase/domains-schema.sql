-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_domains_slug ON domains(slug);

-- Enable Row Level Security (RLS)
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read domains
CREATE POLICY "Allow read access to all domains"
  ON domains
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert domains
CREATE POLICY "Allow users to insert domains"
  ON domains
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update domains
CREATE POLICY "Allow users to update domains"
  ON domains
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to delete domains
CREATE POLICY "Allow users to delete domains"
  ON domains
  FOR DELETE
  USING (true);

-- Create domain_ratings table
CREATE TABLE IF NOT EXISTS domain_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_slug TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  ranking TEXT NOT NULL CHECK (ranking IN ('A+', 'A', 'B', 'C', 'D', 'E', 'X')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(domain_slug, user_email)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_domain_ratings_slug ON domain_ratings(domain_slug);
CREATE INDEX IF NOT EXISTS idx_domain_ratings_user ON domain_ratings(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE domain_ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read ratings
CREATE POLICY "Allow read access to all domain ratings"
  ON domain_ratings
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert their own ratings
CREATE POLICY "Allow users to insert their own domain ratings"
  ON domain_ratings
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update their own ratings
CREATE POLICY "Allow users to update their own domain ratings"
  ON domain_ratings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow users to delete their own ratings
CREATE POLICY "Allow users to delete their own domain ratings"
  ON domain_ratings
  FOR DELETE
  USING (true);

-- Create trigger to automatically update updated_at for domain_ratings
CREATE TRIGGER update_domain_ratings_updated_at
  BEFORE UPDATE ON domain_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create domain_decisions table
CREATE TABLE IF NOT EXISTS domain_decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_slug TEXT UNIQUE NOT NULL,
  decision_status TEXT NOT NULL CHECK (decision_status IN ('Explore', 'Advance', 'Park', 'Kill', 'Spin-Out Candidate')),
  next_steps TEXT,
  next_phase_budget NUMERIC,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_domain_decisions_slug ON domain_decisions(domain_slug);

-- Enable Row Level Security (RLS)
ALTER TABLE domain_decisions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read decisions
CREATE POLICY "Allow read access to all domain decisions"
  ON domain_decisions
  FOR SELECT
  USING (true);

-- Create policy to allow users to insert decisions
CREATE POLICY "Allow users to insert domain decisions"
  ON domain_decisions
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to update decisions
CREATE POLICY "Allow users to update domain decisions"
  ON domain_decisions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create trigger to automatically update updated_at for domain_decisions
CREATE TRIGGER update_domain_decisions_updated_at
  BEFORE UPDATE ON domain_decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

