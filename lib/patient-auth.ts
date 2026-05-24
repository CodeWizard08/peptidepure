import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function dashboardLinkHtml(magicLink: string, displayName: string): string {
  // Plain HTML, inlined styles — same shape as orderConfirmationHtml.
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0B1F3A;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">PeptidePure&#8482;</h1>
        <p style="color:#C8952C;margin:4px 0 0;font-size:13px">Your intake is in</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#0B1F3A;font-size:15px;font-weight:600">Hi ${displayName},</p>
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 24px">
          Thanks for submitting your intake. A member of our clinical team will review it
          within two business days. In the meantime, click the button below to access your
          patient portal — you'll be able to see your submission and (soon) track any
          protocols your clinician shares with you.
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="${magicLink}"
             style="display:inline-block;background:#C8952C;color:#fff;font-size:14px;font-weight:600;
                    text-decoration:none;padding:14px 32px;border-radius:2px;letter-spacing:0.05em;
                    text-transform:uppercase">
            Open My Patient Portal
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin-top:24px">
          This link is valid for 1 hour. If it expires, you can request a fresh one any
          time by visiting <a href="https://peptidepure.com/p/login" style="color:#C8952C">
          peptidepure.com/p/login</a>.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
        <p style="font-size:12px;color:#9ca3af">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${magicLink}" style="color:#C8952C;word-break:break-all">${magicLink}</a>
        </p>
      </div>
    </div>
  `;
}

/**
 * Send a magic-link sign-in email so the patient can claim their intake
 * at /p/dashboard.
 *
 * Strategy — try the branded path first, fall back to Supabase's built-in
 * email if it errors. The existing reset-password route uses the same
 * pattern (see app/api/auth/reset-password/route.ts).
 *
 *   1. Admin generateLink({ type: 'magiclink' }) — works for existing users
 *      and returns a hashed_token we can wrap in a branded PeptidePure
 *      email via Resend. If the email isn't in auth.users yet, this path
 *      fails ("Database error saving new user") because admin.generateLink
 *      with type='magiclink' doesn't reliably create users — that's why
 *      we fall back.
 *
 *   2. Fallback: anon signInWithOtp({ email, shouldCreateUser: true }).
 *      Atomically creates the user if needed and sends Supabase's built-in
 *      magic-link email. Less pretty but reliable.
 *
 * Returns true if any path succeeded. Logs but does not throw — caller
 * treats this as fire-and-forget so a Supabase/Resend blip doesn't block
 * the intake submission.
 */
export async function sendPatientPortalLink({
  email,
  displayName,
  origin,
  next = '/p/dashboard',
}: {
  email: string;
  displayName: string;
  origin: string;
  next?: string;
}): Promise<boolean> {
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/p/dashboard';
  const redirectTo = `${origin}${safeNext}`;

  // Path 1 — branded email via admin.generateLink + Resend.
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  });

  if (!error && data?.properties?.hashed_token) {
    const hashedToken = data.properties.hashed_token;
    const magicLink = `${origin}/auth/confirm?token_hash=${hashedToken}&type=magiclink&next=${encodeURIComponent(safeNext)}`;
    const sent = await sendEmail({
      to: email,
      subject: 'Your PeptidePure™ patient portal link',
      html: dashboardLinkHtml(magicLink, displayName),
    });
    if (sent) return true;
    console.error('[patient-auth] branded sendEmail failed for', email, '— falling back to Supabase OTP');
  } else if (error) {
    console.warn('[patient-auth] generateLink failed (will fall back):', error.message);
  }

  // Path 2 — fallback to Supabase built-in via anon signInWithOtp. This
  // creates the user if needed and sends the magic link from Supabase's
  // own SMTP. Use the anon client because admin.signInWithOtp does not
  // exist — signInWithOtp is a public auth method.
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error: otpError } = await anonClient.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectTo,
    },
  });
  if (otpError) {
    console.error('[patient-auth] signInWithOtp fallback failed:', otpError.message);
    return false;
  }
  return true;
}
