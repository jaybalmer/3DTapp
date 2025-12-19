-- Add ranking column to domains table
ALTER TABLE domains ADD COLUMN IF NOT EXISTS ranking INTEGER;

-- Create index for faster sorting
CREATE INDEX IF NOT EXISTS idx_domains_ranking ON domains(ranking);

-- Update existing domains to have a ranking based on creation order
-- This sets ranking to row_number() based on created_at
UPDATE domains
SET ranking = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM domains
) AS subquery
WHERE domains.id = subquery.id AND domains.ranking IS NULL;

