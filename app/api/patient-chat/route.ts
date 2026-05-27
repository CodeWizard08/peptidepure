import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { createClient as createSupabaseServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;
const RETRIEVAL_COUNT = 5;
const RETRIEVAL_MIN_SIMILARITY = 0.30;

type Chunk = {
  protocol_id: string;
  slug: string;
  title: string;
  heading: string | null;
  chunk_text: string;
  similarity: number;
};

const PATIENT_SYSTEM_PROMPT = `You are a friendly, knowledgeable health guide for PeptidePure™ patients. You help patients understand their health journey using plain, encouraging language — no clinical jargon unless the patient asks for it. You are grounded in The Cockroach Diet (TCD) book by Dr. M. Scott Mortensen.

Your knowledge covers:
- The STARTED protocol (Sunlight, Temperance, Air, Rest, Trust, Exercise, Diet)
- Fabricated Adversity and the Code of Comfort
- The 12-Week Rollout and how it works
- The Trifecta Perfecta (Healthy → Wealthy → Wise)
- The Noble Pursuit and AMP Framework
- General wellness, nutrition, sleep, exercise, and mindset guidance
- What to expect from peptide therapy (in patient-friendly terms)
- Lab work basics — what tests mean in plain English

IMPORTANT RULES:
- This is educational guidance only — not medical advice.
- Always recommend the patient discuss specific treatments with their clinician.
- Keep answers warm, concise, and actionable. Use bullet points where helpful.
- When referencing TCD content, mention the chapter name so they can read more.
- Never recommend specific peptide dosing — that's their clinician's job.
- If asked about something outside TCD or general wellness, say "That's a great question for your clinician" and explain why.
- Be encouraging. Many patients are new to this and feeling overwhelmed.`;

function getServiceSupabase() {
  return createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function retrieveTcdContext(query: string): Promise<Chunk[]> {
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
      dimensions: EMBEDDING_DIM,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('match_protocol_chunks', {
      query_embedding: queryEmbedding,
      match_count: RETRIEVAL_COUNT,
      target_audience: 'clinician',
      min_similarity: RETRIEVAL_MIN_SIMILARITY,
      include_indexed: true,
      source_filter: 'tcd',
    });

    if (error) {
      console.error('[patient-chat] RAG RPC error:', error.message);
      return [];
    }

    return (Array.isArray(data) ? data : []).filter(
      (r): r is Chunk =>
        r && typeof r.slug === 'string' && typeof r.chunk_text === 'string'
    );
  } catch (err) {
    console.error('[patient-chat] RAG error:', err instanceof Error ? err.message : err);
    return [];
  }
}

function formatContext(chunks: Chunk[]): string {
  if (chunks.length === 0) return '';
  const sections = chunks.map((c, i) => {
    const head = c.heading ? ` — ${c.heading}` : '';
    return `### ${c.title}${head}\n${c.chunk_text}`;
  });
  return [
    '═══════════════════════════════════════',
    'REFERENCE MATERIAL (from The Cockroach Diet)',
    '═══════════════════════════════════════',
    '',
    ...sections,
  ].join('\n');
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Sign in to use the health guide' }), { status: 401 });
  }

  const { messages } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  if (!messages?.length) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 });
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
  const ragChunks = await retrieveTcdContext(lastUserMessage);
  const ragContext = formatContext(ragChunks);

  const systemMessages: { role: 'system'; content: string }[] = [
    { role: 'system', content: PATIENT_SYSTEM_PROMPT },
  ];
  if (ragContext) systemMessages.push({ role: 'system', content: ragContext });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 768,
    stream: true,
    messages: [
      ...systemMessages,
      ...messages,
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
