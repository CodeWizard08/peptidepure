/**
 * Minimal Google Sheets API client for the inventory bridge (audit #7 phase C).
 *
 * Uses service-account JWT auth signed with Node's built-in crypto — no
 * googleapis dependency. Service account JSON is read from
 * `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` env var (the full JSON file pasted
 * as a string).
 *
 * The bridge is dormant unless ALL of these env vars are set:
 *   - GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON  (full service account JSON)
 *   - GOOGLE_SHEETS_ID                    (the spreadsheet ID from the URL)
 *   - SHEET_SYNC_SECRET                   (random string shared with Apps Script)
 *
 * If any are missing, isSheetSyncConfigured() returns false and callers
 * should 503 gracefully.
 */

import { createSign } from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

// Cache is per function instance; Vercel doesn't share memory across
// instances, so this is intentionally not a global cache. Each cold-started
// Lambda fetches its own token.
let cachedToken: { access_token: string; expires_at: number } | null = null;

export function isSheetSyncConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON &&
    process.env.GOOGLE_SHEETS_ID &&
    process.env.SHEET_SYNC_SECRET
  );
}

function getServiceAccount(): ServiceAccount {
  const raw = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON not set');
  const parsed = JSON.parse(raw);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service account JSON missing client_email or private_key');
  }
  // Vercel + many CI systems serialize multi-line env vars with literal `\n`
  // sequences instead of real newlines. node:crypto's createSign requires
  // real newlines in the PEM. Normalize both shapes.
  parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  return parsed;
}

/**
 * Sign a JWT for the Google OAuth token exchange and trade it for an
 * access token. Caches until 5 minutes before expiry.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires_at > Date.now() + 5 * 60 * 1000) {
    return cachedToken.access_token;
  }

  const sa = getServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const header = { alg: 'RS256', typ: 'JWT' };

  const b64url = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const signingInput = `${b64url(header)}.${b64url(claim)}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer
    .sign(sa.private_key)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${signingInput}.${signature}`;

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }
  const { access_token, expires_in } = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    access_token,
    expires_at: Date.now() + expires_in * 1000,
  };
  return access_token;
}

/**
 * Read a range from the configured spreadsheet.
 * Returns rows as `string[][]` (Google API's value shape).
 */
export async function readRange(range: string): Promise<string[][]> {
  const token = await getAccessToken();
  const id = process.env.GOOGLE_SHEETS_ID!;
  const url = `${SHEETS_API_BASE}/${encodeURIComponent(id)}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sheets readRange failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { values?: string[][] };
  return data.values ?? [];
}

/**
 * Clear all cell values in the given range. Used after a writeRange call
 * shrinks the data set — without this, trailing rows from a previous push
 * would show stale stock numbers.
 */
export async function clearRange(range: string): Promise<void> {
  const token = await getAccessToken();
  const id = process.env.GOOGLE_SHEETS_ID!;
  const url = `${SHEETS_API_BASE}/${encodeURIComponent(id)}/values/${encodeURIComponent(range)}:clear`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sheets clearRange failed (${res.status}): ${text}`);
  }
}

/**
 * Write rows to a range with USER_ENTERED formatting (so e.g. "$47.00" stays a
 * string and "47" becomes a number). Replaces the existing values in the range.
 */
export async function writeRange(range: string, values: (string | number)[][]): Promise<void> {
  const token = await getAccessToken();
  const id = process.env.GOOGLE_SHEETS_ID!;
  const url =
    `${SHEETS_API_BASE}/${encodeURIComponent(id)}/values/${encodeURIComponent(range)}` +
    `?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ range, values }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Sheets writeRange failed (${res.status}): ${text}`);
  }
}
