-- Extend the RAG retrieval RPC to include 'indexed' protocols. TCD book
-- chapters are stored as protocol rows with status='indexed' so the AI
-- Sherpa can retrieve them via vector search without displaying them on
-- the public /protocols index page (which filters by status='published').

-- Add 'indexed' to the protocols status check constraint.
ALTER TABLE protocols DROP CONSTRAINT IF EXISTS protocols_status_check;
ALTER TABLE protocols ADD CONSTRAINT protocols_status_check
  CHECK (status IN ('draft', 'published', 'archived', 'indexed'));

-- Recreate the retrieval RPC to match both 'published' and 'indexed'.
CREATE OR REPLACE FUNCTION match_protocol_chunks(
  query_embedding vector(1536),
  match_count     integer DEFAULT 5,
  target_audience text    DEFAULT 'clinician',
  min_similarity  real    DEFAULT 0.30
)
RETURNS TABLE (
  protocol_id uuid,
  slug        text,
  title       text,
  heading     text,
  chunk_text  text,
  similarity  real
)
LANGUAGE sql STABLE AS $$
  SELECT
    pc.protocol_id,
    pc.slug,
    p.title,
    pc.heading,
    pc.chunk_text,
    (1 - (pc.embedding <=> query_embedding))::real AS similarity
  FROM protocol_chunks pc
  JOIN protocols p ON p.id = pc.protocol_id
  WHERE pc.audience = target_audience
    AND p.status IN ('published', 'indexed')
    AND pc.embedding IS NOT NULL
    AND (1 - (pc.embedding <=> query_embedding))::real > min_similarity
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Also extend the RLS policy on protocol_chunks so authenticated users
-- can read chunks of 'indexed' protocols too.
DROP POLICY IF EXISTS "Authenticated users can read chunks of published protocols" ON protocol_chunks;
CREATE POLICY "Authenticated users can read chunks of published or indexed protocols"
  ON protocol_chunks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM protocols
      WHERE protocols.id = protocol_chunks.protocol_id
        AND protocols.status IN ('published', 'indexed')
    )
  );
