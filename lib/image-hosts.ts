/**
 * Single source of truth for hostnames whitelisted for next/image rendering.
 *
 * Codex rescue review on Slice 4 fixes (a) + (b): a clinic could save an
 * arbitrary `brand_logo_url`, and even though the route now requires the
 * URL to be https://, next/image's render-time validation rejects any
 * host not in `next.config.ts`. Result: an admin saving a logo from an
 * unallowlisted host would still crash the patient page until the
 * BrandedLogo onError fallback fired — and only AFTER the request
 * reached the browser. Better: refuse the save in the first place.
 *
 * This module is imported from BOTH `next.config.ts` and the admin
 * clinic route so the renderer and the validator can never drift. Adding
 * a host here is enough to make it saveable as a logo AND renderable.
 */

import type { NextConfig } from 'next';

// Derive the RemotePattern shape from the public NextConfig surface
// rather than importing from `next/dist/shared/lib/image-config`, which
// is an internal path and not version-stable. Codex round-3 review flagged
// the prior internal import as a framework-upgrade hazard.
type RemotePattern = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number];

export const REMOTE_IMAGE_PATTERNS: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: 'dzbvaswimmaxfvambivu.supabase.co',
    pathname: '/storage/v1/object/public/**',
  },
  {
    protocol: 'https',
    hostname: 'peptidepure.com',
    pathname: '/wp-content/uploads/**',
  },
  {
    protocol: 'https',
    hostname: 'www.peptide.buzz',
    pathname: '/img/**',
  },
  {
    protocol: 'https',
    hostname: 'peptide.buzz',
    pathname: '/img/**',
  },
];

export const ALLOWED_IMAGE_HOSTS: string[] = REMOTE_IMAGE_PATTERNS
  .map((p) => p.hostname)
  .filter((h): h is string => typeof h === 'string');

/** Lowercase-insensitive hostname match against the allowlist. */
export function isAllowedImageHost(hostname: string): boolean {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  return ALLOWED_IMAGE_HOSTS.some((allowed) => allowed.toLowerCase() === h);
}

/**
 * Convert a Next.js remotePatterns `pathname` glob to a RegExp.
 *
 * Next supports:
 *   `*`   — matches any characters except `/` (single path segment)
 *   `**`  — matches any characters including `/` (any depth of segments)
 *
 * Everything else is treated literally; regex-meta chars must be escaped
 * so a pathname like `/storage/v1/object/public/**` doesn't accidentally
 * treat the dots as any-char wildcards. The final regex is anchored at
 * both ends so partial-path matches don't slip through.
 */
function pathnameGlobToRegExp(pattern: string): RegExp {
  // Escape all regex specials EXCEPT `*` (handled separately below).
  // Then replace `**` first with a placeholder, then `*` with the
  // single-segment matcher, then expand the placeholder. Order matters:
  // doing `*` first would consume the `**` as two adjacent `*`s.
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const withDoubleStar = escaped.replace(/\*\*/g, '__DOUBLE_STAR__');
  const withSingleStar = withDoubleStar.replace(/\*/g, '[^/]*');
  const final = withSingleStar.replace(/__DOUBLE_STAR__/g, '.*');
  return new RegExp(`^${final}$`);
}

/**
 * Does the given URL match ANY entry in REMOTE_IMAGE_PATTERNS, checking
 * BOTH hostname and pathname glob?
 *
 * Codex final verification flagged that hostname-only checking still
 * lets `https://peptidepure.com/not-wp/logo.png` pass save-time
 * validation only to fail at next/image render time. This closes that
 * gap: the API validator can call this to enforce path patterns too,
 * keeping save-time and render-time invariants aligned.
 *
 * Hostname comparison is case-insensitive (URL spec normalizes it
 * anyway); pathname is case-sensitive (matches Next/web semantics).
 */
export function matchesRemotePattern(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return REMOTE_IMAGE_PATTERNS.some((pattern) => {
    if (pattern.protocol && url.protocol !== `${pattern.protocol}:`) return false;
    if (typeof pattern.hostname === 'string' && pattern.hostname.toLowerCase() !== host) {
      return false;
    }
    if (typeof pattern.pathname === 'string') {
      const re = pathnameGlobToRegExp(pattern.pathname);
      if (!re.test(url.pathname)) return false;
    }
    return true;
  });
}
