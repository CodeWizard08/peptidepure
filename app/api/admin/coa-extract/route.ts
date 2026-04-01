import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

const SYSTEM_PROMPT = `You are a lab data extraction assistant. Extract Certificate of Analysis (COA) data from the provided PDF.

Return a JSON object with this exact structure:
{
  "record": {
    "compound": "Lab Name — comma-separated list of all compounds tested",
    "peptide": "Lab or manufacturer name (for filtering)",
    "lab": "Lab name",
    "purity": "Overall purity like >99% or the specific value",
    "batch": "Batch number or range",
    "date": "YYYY-MM-DD format",
    "pdf": "/coa/FILENAME"
  },
  "summaryChart": [
    {
      "compound": "Compound Name with dosage (e.g. BPC-157 10mg)",
      "date": "YYYY-MM-DD",
      "purity": 99.525,
      "lab": "Lab name"
    }
  ]
}

Rules:
- For purity: use the TOTAL chromatographic purity or HPLC purity percentage, NOT individual component fractions
- For compounds with multiple components (like NAD+ which shows NAD+ fraction + Nicotinamide fraction), use the TOTAL purity
- Include all individual compounds in the summaryChart array with their specific purity values
- Date should be the analysis/report date in YYYY-MM-DD format
- The "compound" in record should list ALL compounds, e.g. "Freedom Diagnostics — BPC-157, TB-500, NAD+"
- Purity in summaryChart must be a number (e.g. 99.525), not a string
- If a compound has a dosage/amount listed, include it (e.g. "NAD+ 1000mg", "TIRZ 30mg")
- Return ONLY the JSON object, no other text`;

/**
 * POST /api/admin/coa-extract
 * Accepts a PDF upload, stores in Supabase Storage,
 * sends directly to GPT-4o for extraction (no pdf-parse needed).
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('pdf') as File | null;
  const labName = (formData.get('lab') as string) || '';

  if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Please upload a PDF file' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const base64 = buffer.toString('base64');

  // Upload PDF to Supabase Storage
  let pdfPublicUrl = `/coa/${safeName}`;
  try {
    const supabase = getAdminSupabase();
    await supabase.storage.createBucket('coa', { public: true }).catch(() => {});
    const { error: uploadError } = await supabase.storage
      .from('coa')
      .upload(safeName, buffer, { contentType: 'application/pdf', upsert: true });

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('coa').getPublicUrl(safeName);
      pdfPublicUrl = urlData.publicUrl;
    }
  } catch {
    // Non-fatal — extraction still works
  }

  // Send PDF directly to GPT-4o via Responses API
  try {
    const response = await openai.responses.create({
      model: 'gpt-4o',
      temperature: 0,
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'input_file',
              filename: safeName,
              file_data: `data:application/pdf;base64,${base64}`,
            },
            {
              type: 'input_text',
              text: `Extract all COA data from this PDF.${labName ? ` The lab/source is "${labName}".` : ''} The file is saved as "${safeName}".`,
            },
          ],
        },
      ],
      text: { format: { type: 'json_object' } },
    });

    const content = response.output_text;
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const extracted = JSON.parse(content);

    if (extracted.record) {
      extracted.record.pdf = pdfPublicUrl;
    }

    return NextResponse.json({
      success: true,
      pdfPath: pdfPublicUrl,
      extracted,
    });
  } catch (err) {
    console.error('OpenAI extraction error:', err);
    const message = err instanceof Error ? err.message : 'AI extraction failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
