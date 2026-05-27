-- Tighten TCD RAG retrieval after adding status='indexed' content.
--
-- TCD book chapters are copyrighted and should be retrievable by the chat
-- pipeline, but authenticated users should not be able to scrape the raw
-- protocol_chunks table or call the indexed retrieval RPC directly. Direct
-- SELECT stays limited to published clinical protocols; the server chat route
-- uses the service role to call the bounded top-K RPC and each result is
-- labeled by source.

ALTER TABLE protocols
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'protocol';

UPDATE protocols
SET source = 'tcd'
WHERE category = 'TCD Book' OR tags @> ARRAY['tcd'];

UPDATE protocols
SET source = 'protocol'
WHERE source IS NULL OR source NOT IN ('protocol', 'tcd');

ALTER TABLE protocols DROP CONSTRAINT IF EXISTS protocols_source_check;
ALTER TABLE protocols ADD CONSTRAINT protocols_source_check
  CHECK (source IN ('protocol', 'tcd'));

CREATE INDEX IF NOT EXISTS idx_protocols_source_status
  ON protocols(source, status);

DROP FUNCTION IF EXISTS match_protocol_chunks(vector, integer, text, real);
DROP FUNCTION IF EXISTS match_protocol_chunks(vector, integer, text, real, boolean);
DROP FUNCTION IF EXISTS match_protocol_chunks(vector, integer, text, real, boolean, text);

CREATE FUNCTION match_protocol_chunks(
  query_embedding vector(1536),
  match_count     integer DEFAULT 5,
  target_audience text    DEFAULT 'clinician',
  min_similarity  real    DEFAULT 0.30,
  include_indexed boolean DEFAULT false,
  source_filter   text    DEFAULT 'protocol'
)
RETURNS TABLE (
  protocol_id  uuid,
  slug         text,
  title        text,
  category     text,
  source       text,
  source_label text,
  heading      text,
  chunk_text   text,
  similarity   real
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT
    pc.protocol_id,
    pc.slug,
    p.title,
    p.category,
    p.source,
    CASE
      WHEN p.source = 'tcd' THEN 'TCD'
      ELSE 'Protocol'
    END AS source_label,
    pc.heading,
    pc.chunk_text,
    (1 - (pc.embedding <=> query_embedding))::real AS similarity
  FROM protocol_chunks pc
  JOIN protocols p ON p.id = pc.protocol_id
  WHERE pc.audience = target_audience
    AND (
      (p.source = 'protocol' AND p.status = 'published')
      OR (include_indexed AND p.source = 'tcd' AND p.status = 'indexed')
    )
    AND (
      source_filter IS NULL
      OR source_filter = 'all'
      OR p.source = source_filter
    )
    AND pc.embedding IS NOT NULL
    AND (1 - (pc.embedding <=> query_embedding))::real > min_similarity
  ORDER BY pc.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 10);
$$;

REVOKE ALL ON FUNCTION match_protocol_chunks(vector, integer, text, real, boolean, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION match_protocol_chunks(vector, integer, text, real, boolean, text) FROM anon;
REVOKE ALL ON FUNCTION match_protocol_chunks(vector, integer, text, real, boolean, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION match_protocol_chunks(vector, integer, text, real, boolean, text) TO service_role;

DROP POLICY IF EXISTS "Authenticated users can read chunks of published or indexed protocols" ON protocol_chunks;
DROP POLICY IF EXISTS "Authenticated users can read chunks of published protocols" ON protocol_chunks;
CREATE POLICY "Authenticated users can read chunks of published protocols"
  ON protocol_chunks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM protocols
      WHERE protocols.id = protocol_chunks.protocol_id
        AND protocols.source = 'protocol'
        AND protocols.status = 'published'
    )
  );
