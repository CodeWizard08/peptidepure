import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function resetEmailHtml(resetLink: string): string {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0B1F3A;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">PeptidePure™</h1>
        <p style="color:#C8952C;margin:4px 0 0;font-size:13px">Password Reset</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#0B1F3A;font-size:15px;font-weight:600">Reset your password</p>
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:8px 0 24px">
          We received a request to reset your PeptidePure™ account password.
          Click the button below to set a new password. This link expires in 1 hour.
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetLink}"
             style="display:inline-block;background:#C8952C;color:#fff;font-size:14px;font-weight:600;
                    text-decoration:none;padding:14px 32px;border-radius:2px;letter-spacing:0.05em;
                    text-transform:uppercase">
            Reset Password
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin-top:24px">
          If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
        <p style="font-size:12px;color:#9ca3af">
          If the button above doesn't work, copy and paste this link into your browser:<br/>
          <a href="${resetLink}" style="color:#C8952C;word-break:break-all">${resetLink}</a>
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const { email, redirectTo } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a recovery link via Admin API (does NOT send an email)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (error) {
      // Don't reveal whether the user exists — always show success to the client
      console.error('Generate link error:', error.message);
      return NextResponse.json({ success: true });
    }

    // The generated link contains a token_hash and type.
    // We need to build a link that goes through our auth callback.
    const hashed_token = data.properties?.hashed_token;
    if (!hashed_token) {
      console.error('No hashed_token in generated link');
      return NextResponse.json({ success: true });
    }

    // Build the verification URL that Supabase expects
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${hashed_token}&type=recovery&redirect_to=${encodeURIComponent(redirectTo)}`;

    // Send via Resend
    const sent = await sendEmail({
      to: email,
      subject: 'Reset your PeptidePure™ password',
      html: resetEmailHtml(verifyUrl),
    });

    if (!sent) {
      // Fallback: use Supabase's built-in email as backup
      console.warn('Resend failed, falling back to Supabase email');
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
      });
      // Also try the standard method as absolute fallback
      const { createClient: createAnonClient } = await import('@/lib/supabase/server');
      const supabase = await createAnonClient();
      await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Password reset error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
