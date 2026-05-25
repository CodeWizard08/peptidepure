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
