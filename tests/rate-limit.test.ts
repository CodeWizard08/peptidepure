import { describe, it, expect } from 'vitest';
import { getClientIp } from '@/lib/rate-limit';

describe('getClientIp', () => {
  it('prefers x-vercel-forwarded-for over x-forwarded-for', () => {
    const headers = new Headers({
      'x-vercel-forwarded-for': '1.2.3.4',
      'x-forwarded-for': '5.6.7.8',
      'x-real-ip': '9.10.11.12',
    });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('falls back to x-forwarded-for when x-vercel-forwarded-for is absent', () => {
    const headers = new Headers({
      'x-forwarded-for': '5.6.7.8',
      'x-real-ip': '9.10.11.12',
    });
    expect(getClientIp(headers)).toBe('5.6.7.8');
  });

  it('falls back to x-real-ip last', () => {
    const headers = new Headers({ 'x-real-ip': '9.10.11.12' });
    expect(getClientIp(headers)).toBe('9.10.11.12');
  });

  it('returns "anonymous" when no IP header is present', () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe('anonymous');
  });

  it('takes the LEFTMOST CSV entry from x-vercel-forwarded-for', () => {
    const headers = new Headers({ 'x-vercel-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('takes the LEFTMOST CSV entry from x-forwarded-for (original client per XFF spec)', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('trims whitespace around the CSV entry', () => {
    const headers = new Headers({ 'x-vercel-forwarded-for': '  1.2.3.4  , 5.6.7.8' });
    expect(getClientIp(headers)).toBe('1.2.3.4');
  });

  it('returns "anonymous" when x-vercel-forwarded-for is empty or whitespace-only', () => {
    const h1 = new Headers({ 'x-vercel-forwarded-for': '' });
    expect(getClientIp(h1)).toBe('anonymous');
    const h2 = new Headers({ 'x-vercel-forwarded-for': '   ' });
    expect(getClientIp(h2)).toBe('anonymous');
  });

  it('handles IPv6 addresses', () => {
    const headers = new Headers({ 'x-vercel-forwarded-for': '2001:db8::1' });
    expect(getClientIp(headers)).toBe('2001:db8::1');
  });
});
