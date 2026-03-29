import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { validateContentShape } from '@/lib/content-types';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Lazy-init Redis only when env vars are present (production with Upstash)
let redis: Redis | null = null;
function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    redis = new Redis({ url, token });
    return redis;
  }
  return null;
}

export async function getContent<T = Record<string, unknown>>(page: string): Promise<T> {
  // Try Redis first (has latest admin edits)
  const kv = getRedis();
  if (kv) {
    const data = await kv.get<unknown>(`content:${page}`);
    if (data) {
      validateContentShape(page, data);
      return data as T;
    }
  }

  // Fallback to JSON file (initial seed data / local dev)
  const filePath = path.join(CONTENT_DIR, `${page}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  validateContentShape(page, parsed);
  return parsed as T;
}

export async function writeContent(page: string, data: unknown): Promise<void> {
  validateContentShape(page, data);

  let written = false;

  // Write to Redis if available (production)
  const kv = getRedis();
  if (kv) {
    await kv.set(`content:${page}`, data);
    written = true;
  }

  // Write to JSON file in development (keeps local files up to date)
  if (process.env.NODE_ENV === 'development') {
    const filePath = path.join(CONTENT_DIR, `${page}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    written = true;
  }

  if (!written) {
    throw new Error(
      'No storage backend available. Set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.'
    );
  }
}
