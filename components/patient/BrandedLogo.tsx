'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

/**
 * next/image wrapper for clinic-supplied logo URLs.
 *
 * Codex rescue review of Slice 4 — `brand_logo_url` is admin-editable
 * free-text, but `next.config.ts` only allowlists four hosts. A logo
 * URL outside that allowlist throws at render and breaks the page. Here
 * we register an `onError` and swap in the supplied `fallback` (typically
 * a short text element with the clinic name) so the branded section
 * degrades to text-only instead of crashing.
 */
type Props = Omit<ImageProps, 'onError'> & {
  fallback: React.ReactNode;
};

export default function BrandedLogo({ fallback, ...props }: Props) {
  const [errored, setErrored] = useState(false);
  if (errored) return <>{fallback}</>;
  return <Image {...props} onError={() => setErrored(true)} />;
}
