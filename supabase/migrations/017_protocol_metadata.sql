-- Pep-pedia–style structured metadata for protocol detail pages.
--
-- The existing body_md stays as the long-form clinical narrative (and source
-- of the RAG embeddings). protocol_meta holds extracted/curated structured
-- fields that drive the new hero band, sidebar Quick Start Guide, dosing
-- table, interactions list, reconstitution steps, references, etc.
--
-- See lib/protocols/types.ts for the TypeScript shape of protocol_meta.
--
-- Idempotent.

ALTER TABLE protocols ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS tags     text[] NOT NULL DEFAULT '{}';
ALTER TABLE protocols ADD COLUMN IF NOT EXISTS protocol_meta jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_protocols_tags ON protocols USING gin(tags);
