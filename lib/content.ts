import fs from 'fs';
import path from 'path';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export function getContent<T = Record<string, unknown>>(page: string): T {
  const filePath = path.join(CONTENT_DIR, `${page}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function writeContent(page: string, data: unknown): void {
  const filePath = path.join(CONTENT_DIR, `${page}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}
