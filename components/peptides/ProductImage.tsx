'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

/**
 * Drop-in replacement for next/image specifically for product photos.
 *
 * Audit PDF #9.25 — Mort flagged "some don't load at all." When a product's
 * `image_url` points at a host outside next.config.ts `remotePatterns`, or
 * the source 404s, or the file is corrupt, next/image renders a broken
 * image icon. This wrapper swaps the broken state for the `fallback`
 * (typically the same placeholder card the parent renders when image_url
 * is null) so the layout stays clean without manual cleanup of bad URLs
 * in the database.
 *
 * Use this for ANY product image whose URL comes from the products table
 * (or another user-editable source). Pure illustrative images that ship
 * with the repo can keep using next/image directly.
 */
type Props = Omit<ImageProps, 'onError'> & {
  fallback: React.ReactNode;
};

export default function ProductImage({ fallback, ...props }: Props) {
  const [errored, setErrored] = useState(false);
  if (errored) return <>{fallback}</>;
  return <Image {...props} onError={() => setErrored(true)} />;
}
