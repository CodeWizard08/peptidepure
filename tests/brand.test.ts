import { describe, it, expect } from 'vitest';
import { readableTextOn } from '@/lib/brand';

describe('readableTextOn', () => {
  it('picks white over dark backgrounds (default PeptidePure navy)', () => {
    expect(readableTextOn('#0B1F3A')).toBe('#ffffff');
    expect(readableTextOn('#000000')).toBe('#ffffff');
    expect(readableTextOn('#1a3a6b')).toBe('#ffffff');
  });

  it('picks dark over light backgrounds (yellow + white)', () => {
    expect(readableTextOn('#FFFFFF')).toBe('#0B1F3A');
    expect(readableTextOn('#FFFF00')).toBe('#0B1F3A'); // pure yellow — original Codex (f) example
    expect(readableTextOn('#F0E68C')).toBe('#0B1F3A'); // khaki
  });

  it('handles the YIQ midpoint (~128) deterministically', () => {
    // YIQ for #808080 is exactly 128 (0.5 * 255 = 127.5 effectively, depending on coefficients)
    // (128*299 + 128*587 + 128*114) / 1000 = 128. With >= 128 → dark text.
    expect(readableTextOn('#808080')).toBe('#0B1F3A');
    // One step below mid — should flip to light.
    expect(readableTextOn('#7F7F7F')).toBe('#ffffff');
  });

  it('respects custom light/dark overrides', () => {
    expect(readableTextOn('#000000', '#aaaaaa', '#222222')).toBe('#aaaaaa');
    expect(readableTextOn('#FFFFFF', '#aaaaaa', '#222222')).toBe('#222222');
  });

  it('returns the fallback (light by default) for null/undefined/malformed input', () => {
    expect(readableTextOn(null)).toBe('#ffffff');
    expect(readableTextOn(undefined)).toBe('#ffffff');
    expect(readableTextOn('')).toBe('#ffffff');
    expect(readableTextOn('not a color')).toBe('#ffffff');
    expect(readableTextOn('#XYZ')).toBe('#ffffff');
    expect(readableTextOn('#123')).toBe('#ffffff'); // short hex not supported
  });

  it('is case-insensitive on the hex digits', () => {
    expect(readableTextOn('#ffffff')).toBe('#0B1F3A');
    expect(readableTextOn('#FfFfFf')).toBe('#0B1F3A');
  });

  it('uses YIQ red-channel weighting (red is moderately bright perceptually)', () => {
    // Pure red has YIQ = (255*299)/1000 = 76.245 — well below mid → light text
    expect(readableTextOn('#FF0000')).toBe('#ffffff');
    // Pure green has YIQ = (255*587)/1000 = 149.685 — above mid → dark text
    expect(readableTextOn('#00FF00')).toBe('#0B1F3A');
    // Pure blue has YIQ = (255*114)/1000 = 29.07 — below mid → light text
    expect(readableTextOn('#0000FF')).toBe('#ffffff');
  });
});
