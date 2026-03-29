import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'PeptidePure <info@peptidepure.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@peptidepure.com';

type EmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  const client = getResend();
  if (!client) {
    console.warn('Email not sent — RESEND_API_KEY not configured');
    return false;
  }

  try {
    await client.emails.send({ from: FROM_EMAIL, to, subject, html });
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

export async function sendAdminNotification(subject: string, html: string): Promise<boolean> {
  const recipients = (process.env.ADMIN_EMAILS ?? ADMIN_EMAIL)
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
  return sendEmail({ to: recipients.length > 0 ? recipients : ADMIN_EMAIL, subject, html });
}

// ── Email Templates ────────────────────────────────────────

export function orderConfirmationHtml(order: {
  id: string;
  items: { product_name: string; quantity: number; line_total_cents: number }[];
  total_cents: number;
  shipping_address: { name: string; line1: string; city: string; state: string; zip: string };
}): string {
  const itemRows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name}</td>
         <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
         <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(i.line_total_cents / 100).toFixed(2)}</td></tr>`
    )
    .join('');

  const addr = order.shipping_address;

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0B1F3A;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">PeptidePure™</h1>
        <p style="color:#C8952C;margin:4px 0 0;font-size:13px">Order Confirmation</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#0B1F3A;font-size:14px">Thank you for your order!</p>
        <p style="color:#6b7280;font-size:13px">Order ID: <strong>${order.id.slice(0, 8).toUpperCase()}</strong></p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:8px;text-align:left;font-size:12px;color:#6b7280">Item</th>
              <th style="padding:8px;text-align:center;font-size:12px;color:#6b7280">Qty</th>
              <th style="padding:8px;text-align:right;font-size:12px;color:#6b7280">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <p style="text-align:right;font-size:16px;font-weight:700;color:#0B1F3A">
          Total: $${(order.total_cents / 100).toFixed(2)}
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />

        <p style="font-size:13px;color:#6b7280;margin:0"><strong>Ship to:</strong></p>
        <p style="font-size:13px;color:#0B1F3A;margin:4px 0">
          ${addr.name}<br/>${addr.line1}<br/>${addr.city}, ${addr.state} ${addr.zip}
        </p>

        <p style="font-size:12px;color:#9ca3af;margin-top:24px">
          Questions? Reply to this email or contact us at info@peptidepure.com
        </p>
      </div>
    </div>
  `;
}

export function newOrderAdminHtml(order: {
  id: string;
  items: { product_name: string; quantity: number }[];
  total_cents: number;
  shipping_address: { name: string; email: string };
}): string {
  const itemList = order.items.map((i) => `<li>${i.product_name} x${i.quantity}</li>`).join('');

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:500px;padding:16px">
      <h2 style="color:#0B1F3A;margin:0 0 12px">New Order Received</h2>
      <p style="color:#6b7280;font-size:14px">Order <strong>${order.id.slice(0, 8).toUpperCase()}</strong></p>
      <p style="font-size:14px;color:#0B1F3A"><strong>Customer:</strong> ${order.shipping_address.name} (${order.shipping_address.email})</p>
      <p style="font-size:14px;color:#0B1F3A"><strong>Total:</strong> $${(order.total_cents / 100).toFixed(2)}</p>
      <ul style="font-size:13px;color:#374151">${itemList}</ul>
      <p style="font-size:12px;color:#9ca3af;margin-top:16px">Manage this order in the admin dashboard.</p>
    </div>
  `;
}

export function formConfirmationHtml(formType: string, providerName?: string): string {
  const typeLabel = formType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const name = providerName || 'Clinician';

  const formMessages: Record<string, string> = {
    contact: 'A member of our team will respond within one business day.',
    baseline: 'Your IRB Baseline Assessment has been received and recorded in the Mortensen Medical Research Network registry.',
    'treatment-log': 'Your IRB Treatment Log has been received and recorded.',
    'ae-sae-report': 'Your AE/SAE Report has been received. Our medical team will review it promptly. For urgent adverse events, contact dr.elaine@peptidepure.com directly.',
    outcomes: 'Your Patient Outcomes Report has been received and recorded.',
    soap_capture: 'Your SOAP capture record has been saved to the database.',
  };

  const message = formMessages[formType] || 'Your form submission has been received.';

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="background:#0B1F3A;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">PeptidePure™</h1>
        <p style="color:#C8952C;margin:4px 0 0;font-size:13px">Submission Confirmation</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
        <p style="color:#0B1F3A;font-size:15px;font-weight:600">Thank you, ${name}.</p>
        <p style="color:#6b7280;font-size:14px;margin:4px 0 16px">
          We have received your <strong style="color:#0B1F3A">${typeLabel}</strong> submission.
        </p>
        <p style="color:#374151;font-size:14px;line-height:1.6">${message}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />
        <p style="font-size:12px;color:#9ca3af">
          Questions? Contact us at
          <a href="mailto:info@peptidepure.com" style="color:#C8952C">info@peptidepure.com</a>
          or call (858) 480-1017, Mon–Fri 9AM–4PM PST.
        </p>
      </div>
    </div>
  `;
}

export function formSubmissionAdminHtml(formType: string, data: Record<string, unknown>): string {
  const entries = Object.entries(data)
    .map(([key, val]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      return `<tr><td style="padding:6px 8px;font-weight:600;font-size:13px;color:#0B1F3A;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 8px;font-size:13px;color:#374151">${Array.isArray(val) ? val.join(', ') : String(val || '—')}</td></tr>`;
    })
    .join('');

  const typeLabel = formType.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;padding:16px">
      <h2 style="color:#0B1F3A;margin:0 0 4px">New Form Submission</h2>
      <p style="color:#C8952C;font-size:14px;font-weight:600;margin:0 0 16px">${typeLabel}</p>
      <table style="width:100%;border-collapse:collapse">${entries}</table>
    </div>
  `;
}
