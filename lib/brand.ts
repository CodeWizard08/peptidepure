/**
 * Brand-aware utilities for rendering per-clinic white-label tokens.
 *
 * Codex rescue review (f) — `brand_primary` and `brand_accent` are
 * admin-editable hex colors with no contrast check. A clinic could enter
 * `#FFFF00` (yellow) for brand_primary and the dashboard's white text
 * becomes unreadable. This module picks readable foreground text based
 * on the background's perceptual luminance.
 */

/**
 * Returns the supplied `light` or `dark` color based on which one has
 * better contrast against `hexBg`. Uses the YIQ luminance formula —
 * close-enough perceptual approximation that's faster than WCAG's
 * gamma-correct sRGB lookup and works for the entire #RRGGBB range.
 *
 * Falls back to `light` when `hexBg` is null/undefined/malformed so the
 * default PeptidePure palette (navy bg + white text) keeps working.
 */
export function readableTextOn(
  hexBg: string | null | undefined,
  light: string = '#ffffff',
  dark: string = '#0B1F3A'
): string {
  if (!hexBg || !/^#[0-9a-fA-F]{6}$/.test(hexBg)) return light;
  const r = parseInt(hexBg.slice(1, 3), 16);
  const g = parseInt(hexBg.slice(3, 5), 16);
  const b = parseInt(hexBg.slice(5, 7), 16);
  // YIQ luminance, 0–255 scale. 128 is the rough perceptual midpoint.
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? dark : light;
}
