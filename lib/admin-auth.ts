import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('ADMIN_SECRET env variable is not set');
  return secret;
}

function getPassword(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('ADMIN_PASSWORD env variable is not set');
  return pw;
}

/** Create a signed session token: "expiry.signature" */
function createSessionToken(): string {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const signature = createHmac('sha256', getSecret())
    .update(String(expiry))
    .digest('hex');
  return `${expiry}.${signature}`;
}

/** Verify a session token is valid and not expired */
function verifySessionToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [expiryStr, signature] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry)) return false;

  // Check expiry
  if (Math.floor(Date.now() / 1000) > expiry) return false;

  // Verify signature
  const expected = createHmac('sha256', getSecret())
    .update(expiryStr)
    .digest('hex');

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** Verify password and set session cookie. Returns true if password is correct. */
export async function login(password: string): Promise<boolean> {
  if (password !== getPassword()) return false;

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return true;
}

/** Check if the current request has a valid admin session */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/** Clear the admin session cookie */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
