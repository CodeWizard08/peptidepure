import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Use service role client for storage uploads
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * POST /api/admin/coa-extract
 * Accepts a PDF upload, stores it in Supabase Storage,
 * extracts text, uses OpenAI to parse COA data.
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('pdf') as File | null;
  const labName = (formData.get('lab') as string) || '';

  if (!file || !file.name.endsWith('.pdf')) {
    return NextResponse.json({ error: 'Please upload a PDF file' }, { status: 400 });
  }

  // Read PDF bytes
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Upload PDF to Supabase Storage
  let pdfPublicUrl = `/coa/${safeName}`;
  try {
    const supabase = getAdminSupabase();

    // Ensure bucket exists (ignore error if it already does)
    await supabase.storage.createBucket('coa', { public: true }).catch(() => {});

    const { error: uploadError } = await supabase.storage
      .from('coa')
      .upload(safeName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Non-fatal — continue with extraction, user can upload PDF manually
    } else {
      const { data: urlData } = supabase.storage.from('coa').getPublicUrl(safeName);
      pdfPublicUrl = urlData.publicUrl;
    }
  } catch (err) {
    console.error('Storage error:', err);
    // Non-fatal
  }

  // Extract text from PDF
  let pdfText = '';
  try {
    const parsed = await pdfParse(buffer);
    pdfText = parsed.text;
  } catch (err) {
    console.error('PDF parse error:', err);
    return NextResponse.json(
      { error: 'Failed to extract text from PDF. The file may be image-based — try a text-based PDF.' },
      { status: 422 },
    );
  }

  if (!pdfText.trim()) {
    return NextResponse.json(
      { error: 'No text found in PDF. This may be a scanned/image-based document.' },
      { status: 422 },
    );
  }

  // Truncate to avoid token limits (COAs are usually short)
  const truncated = pdfText.slice(0, 12000);

  // Ask OpenAI to extract structured COA data
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a lab data extraction assistant. Extract Certificate of Analysis (COA) data from the provided text.

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
- If a compound has a dosage/amount listed, include it (e.g. "NAD+ 1000mg", "TIRZ 30mg")`,
        },
        {
          role: 'user',
          content: `Extract COA data from this PDF. The file will be saved as "${safeName}".${labName ? ` The lab/source is "${labName}".` : ''}\n\nPDF Text:\n${truncated}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const extracted = JSON.parse(content);

    // Set the PDF path to the Supabase Storage URL
    if (extracted.record) {
      extracted.record.pdf = pdfPublicUrl;
    }

    return NextResponse.json({
      success: true,
      pdfPath: pdfPublicUrl,
      pdfTextPreview: truncated.slice(0, 500),
      extracted,
    });
  } catch (err) {
    console.error('OpenAI extraction error:', err);
    return NextResponse.json({ error: 'AI extraction failed' }, { status: 500 });
  }
}
