/**
 * Push the in-repo content/*.json files into Upstash Redis (production
 * storage backend).
 *
 * Why this script exists:
 *   lib/content.ts reads from Redis first, falls back to disk. Once Redis
 *   has a key, the disk file is ignored. So when we edit a content/*.json
 *   in the repo (e.g. round 1's freeShipping fix), production keeps
 *   showing the OLD Redis-stored value until someone re-saves via the
 *   admin panel — which Scott reported "didn't take".
 *
 *   This script bypasses the admin panel and writes each content page
 *   directly to Redis, mirroring the repo state. Use it after any direct
 *   edit to content/*.json that you want live immediately.
 *
 * Usage:
 *   Sync all pages (default):
 *     npm run sync-content-to-redis
 *
 *   Sync one page only:
 *     PAGE=home npm run sync-content-to-redis
 *
 * Requires `.env.local` (or shell env) with:
 *   KV_REST_API_URL
 *   KV_REST_API_TOKEN
 */

import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { config as loadEnv } from 'dotenv';
import { VALID_CONTENT_PAGES, validateContentShape } from '@/lib/content-types';

loadEnv({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.error('Missing KV_REST_API_URL or KV_REST_API_TOKEN in .env.local');
    process.exit(1);
  }
  const redis = new Redis({ url, token });

  const target = process.env.PAGE;
  const pages = target
    ? [target]
    : ([...VALID_CONTENT_PAGES] as string[]);

  if (target && !VALID_CONTENT_PAGES.includes(target as (typeof VALID_CONTENT_PAGES)[number])) {
    console.error(`Unknown page: ${target}`);
    console.error(`Valid: ${VALID_CONTENT_PAGES.join(', ')}`);
    process.exit(1);
  }

  console.log(`Syncing ${pages.length} content page${pages.length === 1 ? '' : 's'} from repo → Redis…`);

  const failed: string[] = [];
  for (const page of pages) {
    const filePath = path.join(process.cwd(), 'content', `${page}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`  ⊘ ${page}: no content/${page}.json on disk — skipping`);
      continue;
    }
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as unknown;
      validateContentShape(page, parsed);
      await redis.set(`content:${page}`, parsed);
      console.log(`  ✓ ${page}: pushed to Redis (${raw.length.toLocaleString()} bytes)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${page}: ${msg}`);
      failed.push(page);
    }
  }

  if (failed.length) {
    console.error(`\nFailed: ${failed.join(', ')}`);
    process.exit(1);
  }
  console.log(`\nDone. Production now mirrors the repo content. revalidatePath fires on next admin save; until then, expect Next.js cache to refresh within seconds of the next page hit.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
