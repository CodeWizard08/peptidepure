import { NextResponse } from 'next/server';
import { sendAdminNotification, newSignupAdminHtml } from '@/lib/email';

// POST /api/notify/new-signup
// Fire-and-forget admin notification when a new clinician finishes the
// registration flow. No auth: anyone who just signed up can trigger this.
// The body is informational — server never trusts it for auth/authorization.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName = '',
      email = '',
      clinic = '',
      phone = '',
      npi = '',
      credential = '',
      hasLicense = false,
      hasSignature = false,
    } = body ?? {};

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    await sendAdminNotification(
      `New clinician signup: ${fullName || email}`,
      newSignupAdminHtml({
        fullName: String(fullName),
        email: String(email),
        clinic: String(clinic),
        phone: String(phone),
        npi: String(npi),
        credential: String(credential),
        hasLicense: Boolean(hasLicense),
        hasSignature: Boolean(hasSignature),
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[notify/new-signup]', err);
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 });
  }
}
