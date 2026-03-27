'use client';

import { useState, useCallback } from 'react';
import { FormHeader } from '@/components/forms/FormPrimitives';

// ── Types ──────────────────────────────────────────────────────────────────

interface Vital      { name: string; value: string; unit: string }
interface Lab        { name: string; value: number | string; unit: string; status: 'normal' | 'low' | 'high' | 'unknown'; ref: LabRef | null; isPanel?: boolean }
interface LabRef     { low: number; high: number; unit: string }
interface BodyComp   { name: string; value: string }
interface PRO        { name: string; value: string; category: string }
interface Medication { name: string; dose: string; freq: string }
interface AE         { name: string; severity: 'mild' | 'moderate' | 'severe'; resolution: string; related: string }

interface ExtractionResult {
  vitals: Vital[];
  labs: Lab[];
  body: BodyComp[];
  pros: PRO[];
  meds: Medication[];
  ae: AE[];
  rawText: string;
}

interface EncounterMeta {
  patientId: string;
  encounterDate: string;
  clinician: string;
  clinic: string;
  visitType: string;
  protocols: string;
  weekNum: string;
}

interface SessionRecord {
  meta: EncounterMeta & { capturedAt: string; irbProtocol: string };
  vitals: Vital[];
  labs: Lab[];
  bodyComposition: BodyComp[];
  patientReportedOutcomes: PRO[];
  medications: Medication[];
  adverseEvents: AE[];
}

// ── Lab reference ranges ───────────────────────────────────────────────────

const LAB_RANGES: Record<string, LabRef> = {
  'tsh':                { low: 0.4,  high: 4.0,  unit: 'mIU/L'   },
  'free t4':            { low: 0.8,  high: 1.8,  unit: 'ng/dL'   },
  'free t3':            { low: 2.3,  high: 4.2,  unit: 'pg/mL'   },
  'total t':            { low: 300,  high: 1000, unit: 'ng/dL'   },
  'total testosterone': { low: 300,  high: 1000, unit: 'ng/dL'   },
  'free t':             { low: 9,    high: 30,   unit: 'pg/mL'   },
  'free testosterone':  { low: 9,    high: 30,   unit: 'pg/mL'   },
  'estradiol':          { low: 10,   high: 40,   unit: 'pg/mL'   },
  'e2':                 { low: 10,   high: 40,   unit: 'pg/mL'   },
  'igf-1':              { low: 100,  high: 350,  unit: 'ng/mL'   },
  'igf1':               { low: 100,  high: 350,  unit: 'ng/mL'   },
  'hgb a1c':            { low: 4.0,  high: 5.7,  unit: '%'       },
  'a1c':                { low: 4.0,  high: 5.7,  unit: '%'       },
  'hba1c':              { low: 4.0,  high: 5.7,  unit: '%'       },
  'crp':                { low: 0,    high: 3.0,  unit: 'mg/L'    },
  'hs-crp':             { low: 0,    high: 1.0,  unit: 'mg/L'    },
  'glucose':            { low: 70,   high: 100,  unit: 'mg/dL'   },
  'fasting glucose':    { low: 70,   high: 100,  unit: 'mg/dL'   },
  'insulin':            { low: 2.6,  high: 24.9, unit: 'uIU/mL'  },
  'fasting insulin':    { low: 2.6,  high: 24.9, unit: 'uIU/mL'  },
  'creatinine':         { low: 0.6,  high: 1.2,  unit: 'mg/dL'   },
  'bun':                { low: 7,    high: 20,   unit: 'mg/dL'   },
  'gfr':                { low: 60,   high: 999,  unit: 'mL/min'  },
  'egfr':               { low: 60,   high: 999,  unit: 'mL/min'  },
  'alt':                { low: 7,    high: 56,   unit: 'U/L'     },
  'ast':                { low: 10,   high: 40,   unit: 'U/L'     },
  'alp':                { low: 44,   high: 147,  unit: 'U/L'     },
  'total bilirubin':    { low: 0.1,  high: 1.2,  unit: 'mg/dL'   },
  'albumin':            { low: 3.5,  high: 5.5,  unit: 'g/dL'    },
  'total protein':      { low: 6.0,  high: 8.3,  unit: 'g/dL'    },
  'wbc':                { low: 4.5,  high: 11.0, unit: 'K/uL'    },
  'rbc':                { low: 4.2,  high: 5.9,  unit: 'M/uL'    },
  'hemoglobin':         { low: 12,   high: 17.5, unit: 'g/dL'    },
  'hgb':                { low: 12,   high: 17.5, unit: 'g/dL'    },
  'hematocrit':         { low: 36,   high: 51,   unit: '%'       },
  'hct':                { low: 36,   high: 51,   unit: '%'       },
  'platelets':          { low: 150,  high: 400,  unit: 'K/uL'    },
  'plt':                { low: 150,  high: 400,  unit: 'K/uL'    },
  'vitamin d':          { low: 30,   high: 100,  unit: 'ng/mL'   },
  '25-oh vitamin d':    { low: 30,   high: 100,  unit: 'ng/mL'   },
  'dhea-s':             { low: 100,  high: 400,  unit: 'mcg/dL'  },
  'dhea':               { low: 100,  high: 400,  unit: 'mcg/dL'  },
  'cortisol':           { low: 6,    high: 18,   unit: 'mcg/dL'  },
  'progesterone':       { low: 0.1,  high: 25,   unit: 'ng/mL'   },
  'psa':                { low: 0,    high: 4.0,  unit: 'ng/mL'   },
  'ferritin':           { low: 12,   high: 300,  unit: 'ng/mL'   },
  'iron':               { low: 60,   high: 170,  unit: 'mcg/dL'  },
  'b12':                { low: 200,  high: 900,  unit: 'pg/mL'   },
  'folate':             { low: 2.7,  high: 17,   unit: 'ng/mL'   },
  'magnesium':          { low: 1.7,  high: 2.2,  unit: 'mg/dL'   },
  'sodium':             { low: 136,  high: 145,  unit: 'mEq/L'   },
  'potassium':          { low: 3.5,  high: 5.0,  unit: 'mEq/L'   },
  'chloride':           { low: 98,   high: 106,  unit: 'mEq/L'   },
  'calcium':            { low: 8.5,  high: 10.5, unit: 'mg/dL'   },
  'co2':                { low: 23,   high: 29,   unit: 'mEq/L'   },
  'bicarbonate':        { low: 23,   high: 29,   unit: 'mEq/L'   },
  'triglycerides':      { low: 0,    high: 150,  unit: 'mg/dL'   },
  'total cholesterol':  { low: 0,    high: 200,  unit: 'mg/dL'   },
  'ldl':                { low: 0,    high: 100,  unit: 'mg/dL'   },
  'hdl':                { low: 40,   high: 999,  unit: 'mg/dL'   },
  'lh':                 { low: 1.5,  high: 9.3,  unit: 'mIU/mL'  },
  'fsh':                { low: 1.5,  high: 12.4, unit: 'mIU/mL'  },
  'prolactin':          { low: 2,    high: 18,   unit: 'ng/mL'   },
  'shbg':               { low: 10,   high: 57,   unit: 'nmol/L'  },
  'homocysteine':       { low: 0,    high: 15,   unit: 'umol/L'  },
  'uric acid':          { low: 2.5,  high: 7.0,  unit: 'mg/dL'   },
  'sed rate':           { low: 0,    high: 20,   unit: 'mm/hr'   },
  'esr':                { low: 0,    high: 20,   unit: 'mm/hr'   },
};

// ── Parser ─────────────────────────────────────────────────────────────────

function cap(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseSOAP(text: string): ExtractionResult {
  const result: ExtractionResult = { vitals: [], labs: [], body: [], pros: [], meds: [], ae: [], rawText: text };

  // ── VITALS ──
  const vitalDefs = [
    { name: 'Blood Pressure', regex: /\b(?:bp|blood pressure)[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})/gi, fmt: (m: RegExpExecArray) => ({ name: 'Blood Pressure', value: `${m[1]}/${m[2]}`, unit: 'mmHg' }) },
    { name: 'Heart Rate',    regex: /\b(?:hr|heart rate|pulse)[:\s]*(\d{2,3})\s*(?:bpm)?/gi,     fmt: (m: RegExpExecArray) => ({ name: 'Heart Rate',    value: m[1], unit: 'bpm' }) },
    { name: 'Temperature',   regex: /\b(?:temp|temperature)[:\s]*(\d{2,3}\.?\d?)\s*(?:°?[fF])?/gi, fmt: (m: RegExpExecArray) => ({ name: 'Temperature',  value: m[1], unit: '°F' }) },
    { name: 'SpO2',          regex: /\b(?:spo2|o2 sat|oxygen sat)[:\s]*(\d{2,3})\s*%?/gi,         fmt: (m: RegExpExecArray) => ({ name: 'SpO2',         value: m[1], unit: '%'  }) },
    { name: 'Resp Rate',     regex: /\b(?:rr|resp(?:iratory)? rate)[:\s]*(\d{1,2})/gi,             fmt: (m: RegExpExecArray) => ({ name: 'Resp Rate',    value: m[1], unit: '/min' }) },
  ];
  for (const vd of vitalDefs) {
    let m: RegExpExecArray | null;
    while ((m = vd.regex.exec(text)) !== null) result.vitals.push(vd.fmt(m));
  }

  // ── LABS ──
  const labRegex = /\b(tsh|free t4|free t3|total t(?:estosterone)?|free t(?:estosterone)?|estradiol|e2|igf-?1|hgb a1c|a1c|hba1c|hs?-?crp|(?:fasting )?glucose|(?:fasting )?insulin|creatinine|bun|e?gfr|alt|ast|alp|total bilirubin|albumin|total protein|wbc|rbc|hemoglobin|hgb|hematocrit|hct|platelets|plt|vitamin d|25-oh vitamin d|dhea-?s?|cortisol|progesterone|psa|ferritin|iron|b12|folate|magnesium|sodium|potassium|chloride|calcium|co2|bicarbonate|triglycerides|total cholesterol|ldl|hdl|lh|fsh|prolactin|shbg|homocysteine|uric acid|sed rate|esr)\b[:\s]*(\d+\.?\d*)/gi;
  let lm: RegExpExecArray | null;
  const seenLabs = new Set<string>();
  while ((lm = labRegex.exec(text)) !== null) {
    const labName = lm[1].toLowerCase().trim();
    const labVal = parseFloat(lm[2]);
    if (seenLabs.has(labName)) continue;
    seenLabs.add(labName);
    const ref = LAB_RANGES[labName] ?? null;
    let status: Lab['status'] = 'unknown';
    const unit = ref ? ref.unit : '';
    if (ref) {
      if (labVal < ref.low) status = 'low';
      else if (labVal > ref.high) status = 'high';
      else status = 'normal';
    }
    result.labs.push({ name: labName, value: labVal, unit, status, ref });
  }
  const wnlPanels = text.match(/\b(cbc|bmp|cmp|hepatic panel|liver panel|lipid panel|thyroid panel)\b[:\s]*(?:wnl|normal|within normal limits|unremarkable)/gi);
  if (wnlPanels) {
    for (const wp of wnlPanels) {
      const panelName = wp.replace(/[:\s]*(wnl|normal|within normal limits|unremarkable)/i, '').trim();
      result.labs.push({ name: panelName, value: 'WNL', unit: '', status: 'normal', ref: null, isPanel: true });
    }
  }

  // ── BODY COMP ──
  const bodyDefs = [
    { name: 'Weight',       regex: /\b(?:weight|wt)[:\s]*(\d{2,3}\.?\d?)\s*(?:lbs?|pounds?|kg)?/gi },
    { name: 'BMI',          regex: /\bbmi[:\s]*(\d{1,2}\.?\d?)/gi },
    { name: 'Body Fat',     regex: /\b(?:body fat|bf%?|body fat %)[:\s]*(\d{1,2}\.?\d?)\s*%?/gi },
    { name: 'Waist',        regex: /\b(?:waist|waist circ(?:umference)?)[:\s]*(\d{2,3}\.?\d?)\s*(?:in|inches|cm)?/gi },
    { name: 'Hip',          regex: /\b(?:hip|hip circ(?:umference)?)[:\s]*(\d{2,3}\.?\d?)\s*(?:in|inches|cm)?/gi },
    { name: 'Lean Mass',    regex: /\b(?:lean mass|lean body mass|lbm)[:\s]*(\d{2,3}\.?\d?)\s*(?:lbs?|kg)?/gi },
    { name: 'Fat Mass',     regex: /\b(?:fat mass)[:\s]*(\d{1,3}\.?\d?)\s*(?:lbs?|kg)?/gi },
    { name: 'Visceral Fat', regex: /\b(?:visceral fat)[:\s]*(\d{1,2}\.?\d?)/gi },
  ];
  for (const bd of bodyDefs) {
    let m: RegExpExecArray | null;
    while ((m = bd.regex.exec(text)) !== null) result.body.push({ name: bd.name, value: m[1] });
  }
  const wtDown = text.match(/(?:weight|wt)\s+(?:down|lost|decreased|dropped)\s+(\d+\.?\d?)\s*(?:lbs?|pounds?|kg)?/i)
    ?? text.match(/(?:lost|down)\s+(\d+\.?\d?)\s*(?:lbs?|pounds?|kg)/i);
  if (wtDown) result.body.push({ name: 'Weight Change', value: `-${wtDown[1]} lbs` });
  const wtUp = text.match(/(?:weight|wt)\s+(?:up|gained|increased)\s+(\d+\.?\d?)\s*(?:lbs?|pounds?|kg)?/i)
    ?? text.match(/(?:gained|up)\s+(\d+\.?\d?)\s*(?:lbs?|pounds?|kg)/i);
  if (wtUp) result.body.push({ name: 'Weight Change', value: `+${wtUp[1]} lbs` });

  // ── PROs ──
  const painDelta = text.match(/(\d{1,2})\/10\s*(?:→|->|to)\s*(\d{1,2})\/10/g);
  if (painDelta) {
    for (const pd of painDelta) {
      const vals = pd.match(/(\d{1,2})\/10\s*(?:→|->|to)\s*(\d{1,2})\/10/);
      if (vals) result.pros.push({ name: 'Pain Trend', value: `${vals[1]}/10 → ${vals[2]}/10`, category: 'pain' });
    }
  }
  const sleepMatch = text.match(/(?:sleep(?:ing)?)[^.]*?(\d+\.?\d?)\s*(?:hrs?|hours?)\s*(?:\/\s*night|per night|a night|nightly)?/i);
  if (sleepMatch) result.pros.push({ name: 'Sleep', value: `${sleepMatch[1]} hrs/night`, category: 'sleep' });

  const seenPROs = new Set<string>();
  const positiveRx = [
    /(?:improved|better|increased|good)\s+(energy|stamina|endurance|focus|concentration|mood|libido|sex drive|appetite|digestion|mobility|flexibility|strength|recovery|sleep quality|mental clarity)/gi,
    /(energy|stamina|endurance|focus|concentration|mood|libido|sex drive|appetite|digestion|mobility|flexibility|strength|recovery|sleep quality|mental clarity)\s+(?:improved|better|increased|good)/gi,
  ];
  for (const rx of positiveRx) {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(text)) !== null) {
      const key = m[1].toLowerCase();
      if (!seenPROs.has(key)) { seenPROs.add(key); result.pros.push({ name: cap(m[1]), value: 'Improved', category: 'qualitative' }); }
    }
  }
  const negRx = /(?:decreased|worse|worsened|reduced|poor|low)\s+(energy|stamina|endurance|focus|concentration|mood|libido|sex drive|appetite|digestion|mobility|flexibility|strength|recovery|sleep quality)/gi;
  let nm: RegExpExecArray | null;
  while ((nm = negRx.exec(text)) !== null) {
    const key = nm[1].toLowerCase();
    if (!seenPROs.has(key)) { seenPROs.add(key); result.pros.push({ name: cap(nm[1]), value: 'Worsened', category: 'qualitative' }); }
  }
  const noSymptoms = text.match(/\bno\s+(nausea|vomiting|diarrhea|constipation|headache|dizziness|fatigue|insomnia|anxiety|depression|swelling|edema|rash|bruising|bleeding|numbness|tingling)/gi);
  if (noSymptoms) {
    for (const ns of noSymptoms) {
      result.pros.push({ name: cap(ns.replace(/^no\s+/i, '')), value: 'Absent / Denied', category: 'symptom' });
    }
  }

  // ── MEDICATIONS ──
  const peptideList = [
    'bpc-157','bpc157','bpc 157','tb-500','tb500','tb 500','cjc-1295','cjc\\/ipamorelin','cjc\\/ipa','ipamorelin',
    'tirzepatide','tirz','semaglutide','sema','retatrutide','reta','tesamorelin','sermorelin','hexarelin','mk-677',
    'ghk-cu','ghk cu','pt-141','pt141','bremelanotide','mt-2','mt2','melanotan','kisspeptin','kiss-10',
    'ss-31','elamipretide','nad\\+','nad','glutathione','gsh','aod-9604','aod9604','selank','semax','dsip',
    'epithalon','epitalon','mots-c','motsc','thymosin alpha-1','ta-1','ta1','kpv','snap-8','snap8','ara-290',
    'oxytocin','hcg','hgh','igf-1 lr3','igf lr3','rapamycin','sirolimus','metformin',
  ];
  const medRx = new RegExp(
    `\\b(${peptideList.join('|')})\\b[,\\s]*(?:(\\d+\\.?\\d*)\\s*(mg|mcg|iu|units?|ml))?`,
    'gi',
  );
  let mm2: RegExpExecArray | null;
  const seenMeds = new Set<string>();
  while ((mm2 = medRx.exec(text)) !== null) {
    const key = mm2[1].toLowerCase();
    if (seenMeds.has(key)) continue;
    seenMeds.add(key);
    const surrounding = text.substring(Math.max(0, mm2.index - 10), Math.min(text.length, mm2.index + mm2[0].length + 40));
    const doseM = surrounding.match(/(\d+\.?\d*)\s*(mg|mcg|iu|units?|ml)/i);
    const freqM = surrounding.match(/(?:per\s*)?(daily|qd|bid|tid|tiw|biw|q\s*\d+\s*d|eod|2x\s*(?:\/\s*)?week|3x\s*(?:\/\s*)?week|(?:per|\/)\s*(?:wk|week|day)|weekly|monthly)/i);
    result.meds.push({ name: mm2[1].trim(), dose: doseM ? `${doseM[1]} ${doseM[2]}` : '', freq: freqM ? freqM[1] : '' });
  }

  // ── ADVERSE EVENTS ──
  const aeTerms = [
    'headache','nausea','vomiting','diarrhea','constipation','dizziness','fatigue','insomnia',
    'injection site (?:reaction|pain|redness|swelling|erythema|induration)','rash','hives','urticaria',
    'pruritus','itching','bruising','bleeding','edema','swelling','numbness','tingling','paresthesia',
    'tachycardia','palpitations','hypotension','hypertension','syncope','dyspnea','shortness of breath',
    'chest pain','abdominal pain','bloating','joint pain','arthralgia','myalgia','muscle pain','cramping',
    'anxiety','depression','mood changes','irritability','brain fog','blurred vision','flushing',
    'hot flash','night sweats','hair loss','alopecia','decreased appetite','increased appetite',
    'water retention','weight gain',
  ];
  const aeRx = new RegExp(`(?:reports?|complains? of|experiencing|noted?|mild|moderate|severe|intermittent|occasional|frequent|persistent|resolved|resolving|ongoing|new)?\\s*(${aeTerms.join('|')})`, 'gi');
  let am: RegExpExecArray | null;
  const seenAE = new Set<string>();
  while ((am = aeRx.exec(text)) !== null) {
    const name = am[1].trim().toLowerCase();
    if (seenAE.has(name)) continue;
    const prefix = text.substring(Math.max(0, am.index - 20), am.index).toLowerCase();
    if (/\b(no|denies?|without|absent|negative|ruled out|not)\b/.test(prefix)) continue;
    seenAE.add(name);
    const ctx = text.substring(Math.max(0, am.index - 30), Math.min(text.length, am.index + am[0].length + 30)).toLowerCase();
    let severity: AE['severity'] = 'mild';
    if (/\b(severe|serious|significant|grade\s*[34])\b/.test(ctx)) severity = 'severe';
    else if (/\b(moderate|grade\s*2)\b/.test(ctx)) severity = 'moderate';
    let resolution = 'ongoing';
    if (/\b(resolved|gone|cleared|no longer)\b/.test(ctx)) resolution = 'resolved';
    else if (/\b(resolving|improving|better)\b/.test(ctx)) resolution = 'improving';
    const related = /\b(injection site|post.?injection)\b/.test(ctx) ? 'probable' : 'possible';
    result.ae.push({ name: cap(name), severity, resolution, related });
  }

  return result;
}

// ── Export helpers ─────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildRecord(data: ExtractionResult, meta: EncounterMeta): SessionRecord {
  return {
    meta: { ...meta, capturedAt: new Date().toISOString(), irbProtocol: 'PPRN-001-2025' },
    vitals: data.vitals,
    labs: data.labs,
    bodyComposition: data.body,
    patientReportedOutcomes: data.pros,
    medications: data.meds,
    adverseEvents: data.ae,
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({ title, badge, badgeColor, children }: { title: string; badge: string; badgeColor: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8" style={{ border: '1.5px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>{title}</h3>
        <span className="text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: badgeColor + '18', color: badgeColor }}>{badge}</span>
      </div>
      {children}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  if (rows.length === 0) {
    return <p className="text-sm italic" style={{ color: 'var(--text-light)' }}>None detected in note.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left pb-2 pt-1 pr-4 text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-light)', borderBottom: '1.5px solid var(--border)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} className="py-2.5 pr-4" style={{ color: 'var(--text-dark)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusDot({ status }: { status: Lab['status'] }) {
  const colors: Record<Lab['status'], string> = {
    normal:  '#22c55e',
    low:     '#f59e0b',
    high:    '#ef4444',
    unknown: '#9ca3af',
  };
  return <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: colors[status] }} />;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function SoapCaptureForm() {
  const today = new Date().toISOString().split('T')[0];

  const [meta, setMeta] = useState<EncounterMeta>({
    patientId: '', encounterDate: today, clinician: '', clinic: '', visitType: 'followup', protocols: '', weekNum: '',
  });
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [log, setLog] = useState<SessionRecord[]>([]);
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  function handleExtract() {
    if (!note.trim()) { showToast('Paste a SOAP note first'); return; }
    setLoading(true);
    setTimeout(() => {
      setResult(parseSOAP(note));
      setLoading(false);
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }, 400);
  }

  function handleClear() {
    setNote('');
    setResult(null);
  }

  function handleExportCSV() {
    if (!result) return;
    const m = [meta.patientId, meta.encounterDate, meta.clinician, meta.clinic, meta.visitType, meta.protocols, meta.weekNum].map((v) => `"${v}"`).join(',');
    let csv = 'Category,Field,Value,Unit,Status,Patient_ID,Date,Clinician,Clinic,Visit_Type,Protocols,Week\n';
    for (const v of result.vitals) csv += `Vital,"${v.name}","${v.value}","${v.unit}","",${m}\n`;
    for (const l of result.labs)   csv += `Lab,"${cap(l.name)}","${l.isPanel ? 'WNL' : l.value}","${l.unit}","${l.status}",${m}\n`;
    for (const b of result.body)   csv += `BodyComp,"${b.name}","${b.value}","","",${m}\n`;
    for (const p of result.pros)   csv += `PRO,"${p.name}","${p.value}","","${p.category}",${m}\n`;
    for (const md of result.meds)  csv += `Medication,"${cap(md.name)}","${md.dose}","${md.freq}","",${m}\n`;
    for (const a of result.ae)     csv += `AdverseEvent,"${a.name}","${a.severity}","${a.resolution}","${a.related}",${m}\n`;
    downloadFile(csv, `irb-data-${meta.patientId || 'unknown'}-${meta.encounterDate}.csv`, 'text/csv');
    showToast('CSV exported');
  }

  function handleExportJSON() {
    if (!result) return;
    const record = buildRecord(result, meta);
    downloadFile(JSON.stringify(record, null, 2), `irb-data-${meta.patientId || 'unknown'}-${meta.encounterDate}.json`, 'application/json');
    showToast('JSON exported');
  }

  function handleSaveLog() {
    if (!result) return;
    setLog((prev) => [...prev, buildRecord(result!, meta)]);
    showToast('Record saved to session log');
  }

  // Shared input style
  const inputStyle: React.CSSProperties = {
    width: '100%', fontFamily: 'var(--font-body)', fontSize: '14px',
    padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: '8px',
    background: 'var(--surface)', color: 'var(--text-dark)', outline: 'none',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
    fontWeight: 600, color: 'var(--text-light)', marginBottom: '5px',
  };

  const summary = result ? [
    { num: result.vitals.length, lbl: 'Vitals' },
    { num: result.labs.length,   lbl: 'Lab Values' },
    { num: result.body.length,   lbl: 'Body Comp' },
    { num: result.pros.length,   lbl: 'PROs' },
    { num: result.meds.length,   lbl: 'Medications' },
    { num: result.ae.length,     lbl: 'Adverse Events' },
  ] : [];

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <FormHeader
        breadcrumb="Clinical Forms"
        title="SOAP Note Data Capture"
        subtitle="Paste any clinical note — vitals, labs, body composition, PROs, medications, and adverse events are auto-extracted into structured IRB fields."
      />

      <div className="py-12">
        <div className="container-xl" style={{ maxWidth: '860px' }}>

          {/* ── Encounter Details ── */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-5" style={{ border: '1.5px solid var(--border)' }}>
            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>Encounter Details</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-light)' }}>Patient and visit information. Stored in your browser session only.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}>Patient ID / Initials</label>
                <input style={inputStyle} placeholder="e.g. JM-0042" value={meta.patientId} onChange={(e) => setMeta((p) => ({ ...p, patientId: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Date of Encounter</label>
                <input type="date" style={inputStyle} value={meta.encounterDate} onChange={(e) => setMeta((p) => ({ ...p, encounterDate: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label style={labelStyle}>Clinician</label>
                <input style={inputStyle} placeholder="e.g. Dr. Smith" value={meta.clinician} onChange={(e) => setMeta((p) => ({ ...p, clinician: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Clinic / Site</label>
                <input style={inputStyle} placeholder="e.g. WestlakeRX" value={meta.clinic} onChange={(e) => setMeta((p) => ({ ...p, clinic: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Visit Type</label>
                <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} value={meta.visitType} onChange={(e) => setMeta((p) => ({ ...p, visitType: e.target.value }))}>
                  <option value="initial">Initial Consult</option>
                  <option value="followup">Follow-Up</option>
                  <option value="labs">Labs Review</option>
                  <option value="adverse">Adverse Event</option>
                  <option value="discharge">Discharge</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Protocol(s)</label>
                <input style={inputStyle} placeholder="e.g. BPC-157, Tirzepatide" value={meta.protocols} onChange={(e) => setMeta((p) => ({ ...p, protocols: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Week #</label>
                <input type="number" style={inputStyle} placeholder="e.g. 4" min={0} max={104} value={meta.weekNum} onChange={(e) => setMeta((p) => ({ ...p, weekNum: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* ── SOAP Input ── */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-5" style={{ border: '1.5px solid var(--border)' }}>
            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>SOAP Note Input</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-light)' }}>Paste the full clinical note. The parser auto-extracts structured data fields.</p>

            <label style={labelStyle}>Clinical Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={12}
              placeholder={`Paste the full SOAP note, progress note, or clinical encounter here...

Example:
S: Patient reports improved energy, decreased joint pain (6/10 → 3/10). Sleeping better, 7hrs/night. No nausea or injection site reactions. Weight down 4 lbs since last visit.

O: Vitals: BP 122/78, HR 68, Temp 98.4. Weight 187 lbs. BMI 27.2. Waist 34in. Body fat 22% via bioimpedance.
Labs: TSH 2.1, Free T4 1.2, Total T 680, Free T 18.2, IGF-1 245, Hgb A1c 5.4, CRP 0.8. BMP wnl. CBC wnl.

A: Good response to BPC-157 5mg/wk and CJC/Ipamorelin. Body comp trending favorably.

P: Continue current protocol. Added Tirzepatide 2.5mg/wk.`}
              style={{
                ...inputStyle,
                minHeight: '240px',
                resize: 'vertical',
                lineHeight: '1.7',
                marginBottom: '20px',
              }}
            />

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExtract}
                disabled={loading}
                className="btn-primary"
                style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                {loading ? 'Extracting…' : 'Extract & Structure Data →'}
              </button>
              <button
                onClick={handleClear}
                className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                style={{ border: '1.5px solid var(--border-mid)', color: 'var(--text-mid)', background: 'transparent', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* ── Results ── */}
          {result && (
            <div id="results-section" className="space-y-4">

              {/* Summary bar */}
              <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--navy)' }}>
                <h3 className="text-base font-semibold text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>Extraction Summary</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  {summary.map((s) => (
                    <div key={s.lbl} className="text-center">
                      <div className="text-3xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{s.num}</div>
                      <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vitals */}
              <SectionCard title="Vitals" badge="Vitals" badgeColor="#16a34a">
                <DataTable
                  headers={['Vital', 'Value', 'Unit']}
                  rows={result.vitals.map((v) => [v.name, v.value, v.unit])}
                />
              </SectionCard>

              {/* Labs */}
              <SectionCard title="Laboratory Values" badge="Labs" badgeColor="#0ea5e9">
                <DataTable
                  headers={['Status', 'Lab', 'Value', 'Reference']}
                  rows={result.labs.map((l) => [
                    <span key="dot"><StatusDot status={l.isPanel ? 'normal' : l.status} /><span className="text-xs capitalize">{l.isPanel ? 'Normal' : l.status}</span></span>,
                    cap(l.name),
                    l.isPanel ? 'Within Normal Limits' : `${l.value} ${l.unit}`,
                    l.ref ? `${l.ref.low}–${l.ref.high} ${l.unit}` : '—',
                  ])}
                />
              </SectionCard>

              {/* Body Comp */}
              <SectionCard title="Body Composition" badge="Body Comp" badgeColor="#6366f1">
                <DataTable
                  headers={['Measure', 'Value']}
                  rows={result.body.map((b) => [b.name, b.value])}
                />
              </SectionCard>

              {/* PROs */}
              <SectionCard title="Patient-Reported Outcomes" badge="PROs" badgeColor="#b45309">
                <DataTable
                  headers={['Outcome', 'Value', 'Category']}
                  rows={result.pros.map((p) => [p.name, p.value, cap(p.category)])}
                />
              </SectionCard>

              {/* Medications */}
              <SectionCard title="Medications / Protocols" badge="Meds" badgeColor="#7c3aed">
                <DataTable
                  headers={['Compound', 'Dose', 'Frequency']}
                  rows={result.meds.map((m) => [cap(m.name), m.dose || '—', m.freq || '—'])}
                />
              </SectionCard>

              {/* Adverse Events */}
              <SectionCard title="Adverse Events" badge="AE" badgeColor="#dc2626">
                <DataTable
                  headers={['Event', 'Severity', 'Status', 'Relatedness']}
                  rows={result.ae.map((a) => [
                    a.name,
                    <span key="sev" style={{ fontWeight: 600, color: a.severity === 'severe' ? '#dc2626' : a.severity === 'moderate' ? '#ea580c' : '#f59e0b', textTransform: 'capitalize' }}>{a.severity}</span>,
                    <span key="res" style={{ textTransform: 'capitalize' }}>{a.resolution}</span>,
                    <span key="rel" style={{ textTransform: 'capitalize' }}>{a.related}</span>,
                  ])}
                />
              </SectionCard>

              {/* Export bar */}
              <div className="flex gap-3 justify-center flex-wrap pt-2 pb-4">
                <button onClick={handleExportCSV} className="btn-primary text-sm">Export CSV ↓</button>
                <button
                  onClick={handleExportJSON}
                  className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                  style={{ border: '1.5px solid var(--border-mid)', color: 'var(--text-dark)', background: 'white', cursor: 'pointer' }}
                >
                  Export JSON ↓
                </button>
                <button
                  onClick={handleSaveLog}
                  className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                  style={{ border: '1.5px solid var(--border-mid)', color: 'var(--text-dark)', background: 'white', cursor: 'pointer' }}
                >
                  Save to Log →
                </button>
              </div>
            </div>
          )}

          {/* ── Session Log ── */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mt-5" style={{ border: '1.5px solid var(--border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>Session Record Log</h3>
            {log.length === 0 ? (
              <p className="text-sm italic text-center py-6" style={{ color: 'var(--text-light)' }}>No records captured yet. Extract a SOAP note to begin.</p>
            ) : (
              <div className="space-y-0">
                {log.map((r, i) => (
                  <div key={i} className="flex justify-between items-center py-3" style={{ borderBottom: i < log.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>{r.meta.patientId || `Patient ${i + 1}`} — <span className="capitalize">{r.meta.visitType}</span></div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
                        {r.meta.encounterDate || 'No date'} · {r.meta.clinician || 'Unknown clinician'} · {r.meta.clinic} · {r.labs.length} labs, {r.adverseEvents.length} AEs
                      </div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: 'rgba(200,149,44,0.12)', color: 'var(--gold)' }}>Captured</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 text-sm font-medium px-5 py-3.5 rounded-xl shadow-lg z-50"
          style={{ background: 'var(--navy)', color: 'white' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
