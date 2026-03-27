import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { FormType } from '@/lib/types/form';
import { sendAdminNotification, sendEmail, formSubmissionAdminHtml, formConfirmationHtml } from '@/lib/email';

const VALID_FORM_TYPES: FormType[] = ['baseline', 'treatment-log', 'ae-sae-report', 'outcomes', 'contact', 'soap_capture'];

type FormBody = {
  formType: FormType;
  data: Record<string, unknown>;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth is optional for contact form, required for clinical forms
  const { data: { user } } = await supabase.auth.getUser();

  let body: FormBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate form type
  if (!body.formType || !VALID_FORM_TYPES.includes(body.formType)) {
    return NextResponse.json(
      { error: `Invalid form type. Must be one of: ${VALID_FORM_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  // Clinical forms require authentication (outcomes allows patient self-report)
  if (body.formType !== 'contact' && body.formType !== 'outcomes' && !user) {
    return NextResponse.json({ error: 'Authentication required for clinical forms' }, { status: 401 });
  }

  // Validate data object exists
  if (!body.data || typeof body.data !== 'object') {
    return NextResponse.json({ error: 'Missing form data' }, { status: 400 });
  }

  // Extract provider email from form data for notification purposes
  const providerEmail =
    (body.data.providerEmail as string) ||
    (body.data.email as string) ||
    null;

  // Insert into Supabase
  const { data: submission, error } = await supabase
    .from('form_submissions')
    .insert({
      form_type: body.formType,
      data: body.data,
      submitted_by: user?.id || null,
      provider_email: providerEmail,
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Failed to save form submission' }, { status: 500 });
  }

  // Notify admin via email (fire and forget)
  const typeLabel = body.formType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  sendAdminNotification(
    `New ${typeLabel} Submission`,
    formSubmissionAdminHtml(body.formType, body.data)
  );

  // Send confirmation to the submitting clinician (skip for SOAP internal capture)
  if (providerEmail && body.formType !== 'soap_capture') {
    const providerName =
      (body.data.providerName as string) ||
      (body.data.name as string) ||
      undefined;
    sendEmail({
      to: providerEmail,
      subject: `PeptidePure™ — ${typeLabel} Received`,
      html: formConfirmationHtml(body.formType, providerName),
    });
  }

  return NextResponse.json(
    { id: submission.id, createdAt: submission.created_at },
    { status: 201 }
  );
}
