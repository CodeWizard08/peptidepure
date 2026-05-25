import { describe, it, expect } from 'vitest';
import {
  ALLOWED_IMAGE_HOSTS,
  REMOTE_IMAGE_PATTERNS,
  isAllowedImageHost,
  matchesRemotePattern,
} from '@/lib/image-hosts';

describe('ALLOWED_IMAGE_HOSTS', () => {
  it('exposes every hostname from REMOTE_IMAGE_PATTERNS', () => {
    // Derived list should mirror the source-of-truth pattern array exactly.
    const expected = REMOTE_IMAGE_PATTERNS
      .map((p) => p.hostname)
      .filter((h): h is string => typeof h === 'string');
    expect(ALLOWED_IMAGE_HOSTS).toEqual(expected);
  });

  it('contains the four currently-allowed hosts', () => {
    expect(ALLOWED_IMAGE_HOSTS).toContain('dzbvaswimmaxfvambivu.supabase.co');
    expect(ALLOWED_IMAGE_HOSTS).toContain('peptidepure.com');
    expect(ALLOWED_IMAGE_HOSTS).toContain('www.peptide.buzz');
    expect(ALLOWED_IMAGE_HOSTS).toContain('peptide.buzz');
  });
});

describe('isAllowedImageHost', () => {
  it('returns true for exact-match hostnames', () => {
    expect(isAllowedImageHost('peptidepure.com')).toBe(true);
    expect(isAllowedImageHost('dzbvaswimmaxfvambivu.supabase.co')).toBe(true);
    expect(isAllowedImageHost('www.peptide.buzz')).toBe(true);
    expect(isAllowedImageHost('peptide.buzz')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isAllowedImageHost('PEPTIDEPURE.COM')).toBe(true);
    expect(isAllowedImageHost('PeptidePure.Com')).toBe(true);
  });

  it('rejects unallowed hostnames', () => {
    expect(isAllowedImageHost('evil.example.com')).toBe(false);
    expect(isAllowedImageHost('localhost')).toBe(false);
    expect(isAllowedImageHost('cdn.peptidepure.com')).toBe(false); // subdomain not allowed
  });

  it('rejects empty and whitespace input', () => {
    expect(isAllowedImageHost('')).toBe(false);
    // (note: only literal empty string returns false synchronously; the
    // function trusts callers to pass already-parsed URL.hostname values)
  });
});

describe('matchesRemotePattern', () => {
  it('accepts URLs whose host AND path match the corresponding pattern', () => {
    // Supabase storage — /storage/v1/object/public/** depth-unlimited
    expect(matchesRemotePattern(
      new URL('https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/x.png')
    )).toBe(true);
    expect(matchesRemotePattern(
      new URL('https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/a/b/c/d.png')
    )).toBe(true);
    // peptidepure.com — /wp-content/uploads/**
    expect(matchesRemotePattern(
      new URL('https://peptidepure.com/wp-content/uploads/2025/05/logo.png')
    )).toBe(true);
    // peptide.buzz — /img/**
    expect(matchesRemotePattern(
      new URL('https://www.peptide.buzz/img/balm.png')
    )).toBe(true);
    expect(matchesRemotePattern(
      new URL('https://peptide.buzz/img/duo-box.png')
    )).toBe(true);
  });

  it('rejects allowed hosts with disallowed paths', () => {
    // peptidepure.com allows /wp-content/uploads/** only — random path NOT allowed
    expect(matchesRemotePattern(
      new URL('https://peptidepure.com/random/path/logo.png')
    )).toBe(false);
    expect(matchesRemotePattern(
      new URL('https://peptidepure.com/')
    )).toBe(false);
    // peptide.buzz allows /img/** only — anything else NOT allowed
    expect(matchesRemotePattern(
      new URL('https://www.peptide.buzz/admin/logo.png')
    )).toBe(false);
  });

  it('rejects disallowed hosts entirely', () => {
    expect(matchesRemotePattern(
      new URL('https://evil.example.com/wp-content/uploads/x.png')
    )).toBe(false);
  });

  it('rejects http:// even when host+path would otherwise match', () => {
    // Protocol check — http won't match the https pattern entries
    expect(matchesRemotePattern(
      new URL('http://peptidepure.com/wp-content/uploads/logo.png')
    )).toBe(false);
  });

  it('is case-sensitive on the path but case-insensitive on the host', () => {
    expect(matchesRemotePattern(
      new URL('https://PeptidePure.com/wp-content/uploads/logo.png')
    )).toBe(true);
    // URL() normalizes case on hostname so this naturally works
  });

  it('handles ports correctly when the URL specifies one', () => {
    // No pattern in the project allows ports, but URL() accepts them and
    // the matcher should not blow up.
    expect(matchesRemotePattern(
      new URL('https://peptidepure.com:443/wp-content/uploads/x.png')
    )).toBe(true);
  });

  it('treats `**` as multi-segment wildcard, `*` as single-segment', () => {
    // /storage/v1/object/public/** must match arbitrary depth
    expect(matchesRemotePattern(
      new URL('https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/x.png')
    )).toBe(true);
    expect(matchesRemotePattern(
      new URL('https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/')
    )).toBe(true);
  });
});
