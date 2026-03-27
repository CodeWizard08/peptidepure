'use client';

import React, { useState, useEffect } from 'react';
import { FormHeader } from '@/components/forms/FormPrimitives';

// ── Types ──────────────────────────────────────────────────────────────────

interface Vital      { name: string; value: string; unit: string }
interface LabRef     { low: number; high: number; unit: string }
interface Lab        { name: string; value: number | string; unit: string; status: 'normal' | 'low' | 'high' | 'unknown'; ref: LabRef | null; isPanel?: boolean }
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

// ── Constants (defined outside component to avoid recreating each render) ──

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  fontWeight: 600,
  color: 'var(--text-light)',
  marginBottom: '5px',
};

const INPUT_BASE: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  background: 'var(--surface)',
  color: 'var(--text-dark)',
  outline: 'none',
};

const SECTION_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  vitals: { color: '#16a34a', bg: 'rgba(22,163,74,0.06)',    border: 'rgba(22,163,74,0.2)'   },
  labs:   { color: '#0284c7', bg: 'rgba(2,132,199,0.06)',    border: 'rgba(2,132,199,0.2)'   },
  body:   { color: '#6366f1', bg: 'rgba(99,102,241,0.06)',   border: 'rgba(99,102,241,0.2)'  },
  pros:   { color: '#b45309', bg: 'rgba(180,83,9,0.06)',     border: 'rgba(180,83,9,0.2)'    },
  meds:   { color: '#7c3aed', bg: 'rgba(124,58,237,0.06)',   border: 'rgba(124,58,237,0.2)'  },
  ae:     { color: '#dc2626', bg: 'rgba(220,38,38,0.06)',    border: 'rgba(220,38,38,0.2)'   },
};

// ── Lab reference ranges ───────────────────────────────────────────────────

const LAB_RANGES: Record<string, LabRef> = {
  'tsh':                { low: 0.4,  high: 4.0,  unit: 'mIU/L'  },
  'free t4':            { low: 0.8,  high: 1.8,  unit: 'ng/dL'  },
  'free t3':            { low: 2.3,  high: 4.2,  unit: 'pg/mL'  },
  'total t':            { low: 300,  high: 1000, unit: 'ng/dL'  },
  'total testosterone': { low: 300,  high: 1000, unit: 'ng/dL'  },
  'free t':             { low: 9,    high: 30,   unit: 'pg/mL'  },
  'free testosterone':  { low: 9,    high: 30,   unit: 'pg/mL'  },
  'estradiol':          { low: 10,   high: 40,   unit: 'pg/mL'  },
  'e2':                 { low: 10,   high: 40,   unit: 'pg/mL'  },
  'igf-1':              { low: 100,  high: 350,  unit: 'ng/mL'  },
  'igf1':               { low: 100,  high: 350,  unit: 'ng/mL'  },
  'hgb a1c':            { low: 4.0,  high: 5.7,  unit: '%'      },
  'a1c':                { low: 4.0,  high: 5.7,  unit: '%'      },
  'hba1c':              { low: 4.0,  high: 5.7,  unit: '%'      },
  'crp':                { low: 0,    high: 3.0,  unit: 'mg/L'   },
  'hs-crp':             { low: 0,    high: 1.0,  unit: 'mg/L'   },
  'glucose':            { low: 70,   high: 100,  unit: 'mg/dL'  },
  'fasting glucose':    { low: 70,   high: 100,  unit: 'mg/dL'  },
  'insulin':            { low: 2.6,  high: 24.9, unit: 'uIU/mL' },
  'fasting insulin':    { low: 2.6,  high: 24.9, unit: 'uIU/mL' },
  'creatinine':         { low: 0.6,  high: 1.2,  unit: 'mg/dL'  },
  'bun':                { low: 7,    high: 20,   unit: 'mg/dL'  },
  'gfr':                { low: 60,   high: 999,  unit: 'mL/min' },
  'egfr':               { low: 60,   high: 999,  unit: 'mL/min' },
  'alt':                { low: 7,    high: 56,   unit: 'U/L'    },
  'ast':                { low: 10,   high: 40,   unit: 'U/L'    },
  'alp':                { low: 44,   high: 147,  unit: 'U/L'    },
  'total bilirubin':    { low: 0.1,  high: 1.2,  unit: 'mg/dL'  },
  'albumin':            { low: 3.5,  high: 5.5,  unit: 'g/dL'   },
  'total protein':      { low: 6.0,  high: 8.3,  unit: 'g/dL'   },
  'wbc':                { low: 4.5,  high: 11.0, unit: 'K/uL'   },
  'rbc':                { low: 4.2,  high: 5.9,  unit: 'M/uL'   },
  'hemoglobin':         { low: 12,   high: 17.5, unit: 'g/dL'   },
  'hgb':                { low: 12,   high: 17.5, unit: 'g/dL'   },
  'hematocrit':         { low: 36,   high: 51,   unit: '%'      },
  'hct':                { low: 36,   high: 51,   unit: '%'      },
  'platelets':          { low: 150,  high: 400,  unit: 'K/uL'   },
  'plt':                { low: 150,  high: 400,  unit: 'K/uL'   },
  'vitamin d':          { low: 30,   high: 100,  unit: 'ng/mL'  },
  '25-oh vitamin d':    { low: 30,   high: 100,  unit: 'ng/mL'  },
  'dhea-s':             { low: 100,  high: 400,  unit: 'mcg/dL' },
  'dhea':               { low: 100,  high: 400,  unit: 'mcg/dL' },
  'cortisol':           { low: 6,    high: 18,   unit: 'mcg/dL' },
  'progesterone':       { low: 0.1,  high: 25,   unit: 'ng/mL'  },
  'psa':                { low: 0,    high: 4.0,  unit: 'ng/mL'  },
  'ferritin':           { low: 12,   high: 300,  unit: 'ng/mL'  },
  'iron':               { low: 60,   high: 170,  unit: 'mcg/dL' },
  'b12':                { low: 200,  high: 900,  unit: 'pg/mL'  },
  'folate':             { low: 2.7,  high: 17,   unit: 'ng/mL'  },
  'magnesium':          { low: 1.7,  high: 2.2,  unit: 'mg/dL'  },
  'sodium':             { low: 136,  high: 145,  unit: 'mEq/L'  },
  'potassium':          { low: 3.5,  high: 5.0,  unit: 'mEq/L'  },
  'chloride':           { low: 98,   high: 106,  unit: 'mEq/L'  },
  'calcium':            { low: 8.5,  high: 10.5, unit: 'mg/dL'  },
  'co2':                { low: 23,   high: 29,   unit: 'mEq/L'  },
  'bicarbonate':        { low: 23,   high: 29,   unit: 'mEq/L'  },
  'triglycerides':      { low: 0,    high: 150,  unit: 'mg/dL'  },
  'total cholesterol':  { low: 0,    high: 200,  unit: 'mg/dL'  },
  'ldl':                { low: 0,    high: 100,  unit: 'mg/dL'  },
  'hdl':                { low: 40,   high: 999,  unit: 'mg/dL'  },
  'lh':                 { low: 1.5,  high: 9.3,  unit: 'mIU/mL' },
  'fsh':                { low: 1.5,  high: 12.4, unit: 'mIU/mL' },
  'prolactin':          { low: 2,    high: 18,   unit: 'ng/mL'  },
  'shbg':               { low: 10,   high: 57,   unit: 'nmol/L' },
  'homocysteine':       { low: 0,    high: 15,   unit: 'umol/L' },
  'uric acid':          { low: 2.5,  high: 7.0,  unit: 'mg/dL'  },
  'sed rate':           { low: 0,    high: 20,   unit: 'mm/hr'  },
  'esr':                { low: 0,    high: 20,   unit: 'mm/hr'  },
};

// ── Parser ─────────────────────────────────────────────────────────────────

function cap(str: string) {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseSOAP(text: string): ExtractionResult {
  const result: ExtractionResult = { vitals: [], labs: [], body: [], pros: [], meds: [], ae: [], rawText: text };

  // VITALS
  const vitalDefs = [
    { regex: /\b(?:bp|blood pressure)[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})/gi, fmt: (m: RegExpExecArray) => ({ name: 'Blood Pressure', value: `${m[1]}/${m[2]}`, unit: 'mmHg' }) },
    { regex: /\b(?:hr|heart rate|pulse)[:\s]*(\d{2,3})\s*(?:bpm)?/gi,      fmt: (m: RegExpExecArray) => ({ name: 'Heart Rate',    value: m[1], unit: 'bpm'  }) },
    { regex: /\b(?:temp|temperature)[:\s]*(\d{2,3}\.?\d?)\s*(?:°?[fF])?/gi, fmt: (m: RegExpExecArray) => ({ name: 'Temperature',  value: m[1], unit: '°F'   }) },
    { regex: /\b(?:spo2|o2 sat|oxygen sat)[:\s]*(\d{2,3})\s*%?/gi,          fmt: (m: RegExpExecArray) => ({ name: 'SpO2',         value: m[1], unit: '%'    }) },
    { regex: /\b(?:rr|resp(?:iratory)? rate)[:\s]*(\d{1,2})/gi,             fmt: (m: RegExpExecArray) => ({ name: 'Resp Rate',    value: m[1], unit: '/min' }) },
  ];
  for (const vd of vitalDefs) {
    let m: RegExpExecArray | null;
    while ((m = vd.regex.exec(text)) !== null) result.vitals.push(vd.fmt(m));
  }

  // LABS
  const labRx = /\b(tsh|free t4|free t3|total t(?:estosterone)?|free t(?:estosterone)?|estradiol|e2|igf-?1|hgb a1c|a1c|hba1c|hs?-?crp|(?:fasting )?glucose|(?:fasting )?insulin|creatinine|bun|e?gfr|alt|ast|alp|total bilirubin|albumin|total protein|wbc|rbc|hemoglobin|hgb|hematocrit|hct|platelets|plt|vitamin d|25-oh vitamin d|dhea-?s?|cortisol|progesterone|psa|ferritin|iron|b12|folate|magnesium|sodium|potassium|chloride|calcium|co2|bicarbonate|triglycerides|total cholesterol|ldl|hdl|lh|fsh|prolactin|shbg|homocysteine|uric acid|sed rate|esr)\b[:\s]*(\d+\.?\d*)/gi;
  let lm: RegExpExecArray | null;
  const seenLabs = new Set<string>();
  while ((lm = labRx.exec(text)) !== null) {
    const name = lm[1].toLowerCase().trim();
    if (seenLabs.has(name)) continue;
    seenLabs.add(name);
    const val = parseFloat(lm[2]);
    const ref = LAB_RANGES[name] ?? null;
    const unit = ref ? ref.unit : '';
    let status: Lab['status'] = 'unknown';
    if (ref) status = val < ref.low ? 'low' : val > ref.high ? 'high' : 'normal';
    result.labs.push({ name, value: val, unit, status, ref });
  }
  const wnlPanels = text.match(/\b(cbc|bmp|cmp|hepatic panel|liver panel|lipid panel|thyroid panel)\b[:\s]*(?:wnl|normal|within normal limits|unremarkable)/gi);
  if (wnlPanels) {
    for (const wp of wnlPanels) {
      const panelName = wp.replace(/[:\s]*(wnl|normal|within normal limits|unremarkable)/i, '').trim();
      result.labs.push({ name: panelName, value: 'WNL', unit: '', status: 'normal', ref: null, isPanel: true });
    }
  }

  // BODY COMP (deduplicated per measure name)
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
  const seenBody = new Set<string>();
  for (const bd of bodyDefs) {
    let m: RegExpExecArray | null;
    while ((m = bd.regex.exec(text)) !== null) {
      if (!seenBody.has(bd.name)) { seenBody.add(bd.name); result.body.push({ name: bd.name, value: m[1] }); }
    }
  }
  const wtDown = text.match(/(?:weight|wt)\s+(?:down|lost|decreased|dropped)\s+(\d+\.?\d?)\s*(?:lbs?|pounds?|kg)?/i)
    ?? text.match(/(?:lost|down)\s+(\d+\.?\d?)\s*(?:lbs?|pounds?|kg)/i);
  if (wtDown) result.body.push({ name: 'Weight Change', value: `-${wtDown[1]} lbs` });
  const wtUp = text.match(/(?:weight|wt)\s+(?:up|gained|increased)\s+(\d+\.?\d?)\s*(?:lbs?|pounds?|kg)?/i)
    ?? text.match(/(?:gained|up)\s+(\d+\.?\d?)\s*(?:lbs?|pounds?|kg)/i);
  if (wtUp && !wtDown) result.body.push({ name: 'Weight Change', value: `+${wtUp[1]} lbs` });

  // PROs
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
  const positiveRxList = [
    /(?:improved|better|increased|good)\s+(energy|stamina|endurance|focus|concentration|mood|libido|sex drive|appetite|digestion|mobility|flexibility|strength|recovery|sleep quality|mental clarity)/gi,
    /(energy|stamina|endurance|focus|concentration|mood|libido|sex drive|appetite|digestion|mobility|flexibility|strength|recovery|sleep quality|mental clarity)\s+(?:improved|better|increased|good)/gi,
  ];
  for (const rx of positiveRxList) {
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

  // MEDICATIONS
  const peptideList = [
    'bpc-157','bpc157','bpc 157','tb-500','tb500','tb 500','cjc-1295','cjc\\/ipamorelin','cjc\\/ipa','ipamorelin',
    'tirzepatide','tirz','semaglutide','sema','retatrutide','reta','tesamorelin','sermorelin','hexarelin','mk-677',
    'ghk-cu','ghk cu','pt-141','pt141','bremelanotide','mt-2','mt2','melanotan','kisspeptin','kiss-10',
    'ss-31','elamipretide','nad\\+','nad','glutathione','gsh','aod-9604','aod9604','selank','semax','dsip',
    'epithalon','epitalon','mots-c','motsc','thymosin alpha-1','ta-1','ta1','kpv','snap-8','snap8','ara-290',
    'oxytocin','hcg','hgh','igf-1 lr3','igf lr3','rapamycin','sirolimus','metformin',
  ];
  const medRx = new RegExp(`\\b(${peptideList.join('|')})\\b[,\\s]*(?:(\\d+\\.?\\d*)\\s*(mg|mcg|iu|units?|ml))?`, 'gi');
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

  // ADVERSE EVENTS
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
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
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

// ── Icons ──────────────────────────────────────────────────────────────────

const ICONS: Record<string, React.ReactElement> = {
  vitals: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  labs:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  body:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  pros:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  meds:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  ae:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

// ── Sub-components ─────────────────────────────────────────────────────────

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  );
}

function SectionCard({ sectionKey, title, badge, count, children }: {
  sectionKey: keyof typeof SECTION_COLORS;
  title: string;
  badge: string;
  count: number;
  children: React.ReactNode;
}) {
  const c = SECTION_COLORS[sectionKey];
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1.5px solid var(--border)', borderTop: `3px solid ${c.color}` }}
    >
      <div className="px-6 md:px-8 py-5" style={{ borderBottom: '1px solid var(--border)', background: c.bg }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span style={{ color: c.color }}>{ICONS[sectionKey]}</span>
            <h3 className="font-semibold text-base" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: c.border, color: c.color }}
            >
              {badge}
            </span>
            <span
              className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: c.color, color: 'white' }}
            >
              {count}
            </span>
          </div>
        </div>
      </div>
      <div className="px-6 md:px-8 py-5">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm italic py-2" style={{ color: 'var(--text-light)' }}>
      {message}
    </p>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (React.ReactNode | string)[][] }) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left pb-2 pt-1 pr-6 text-xs uppercase tracking-wider font-semibold whitespace-nowrap"
                style={{ color: 'var(--text-light)', borderBottom: '1.5px solid var(--border)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="py-2.5 pr-6 align-middle"
                  style={{
                    color: 'var(--text-dark)',
                    borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LabStatusPill({ status }: { status: Lab['status'] }) {
  const map: Record<Lab['status'], { label: string; bg: string; color: string }> = {
    normal:  { label: 'Normal',  bg: 'rgba(22,163,74,0.1)',  color: '#16a34a' },
    low:     { label: 'Low',     bg: 'rgba(245,158,11,0.1)', color: '#b45309' },
    high:    { label: 'High',    bg: 'rgba(220,38,38,0.1)',  color: '#dc2626' },
    unknown: { label: 'N/A',     bg: 'rgba(107,114,128,0.1)',color: '#6b7280' },
  };
  const s = map[status];
  return (
    <span
      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

function AESeverityPill({ severity }: { severity: AE['severity'] }) {
  const map: Record<AE['severity'], { bg: string; color: string }> = {
    mild:     { bg: 'rgba(245,158,11,0.1)', color: '#b45309' },
    moderate: { bg: 'rgba(234,88,12,0.1)',  color: '#c2410c' },
    severe:   { bg: 'rgba(220,38,38,0.1)',  color: '#dc2626' },
  };
  const s = map[severity];
  return (
    <span
      className="inline-block text-xs font-semibold capitalize px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {severity}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function SoapCaptureForm() {
  const today = new Date().toISOString().split('T')[0];

  const [meta, setMeta] = useState<EncounterMeta>({
    patientId: '', encounterDate: today, clinician: '', clinic: '',
    visitType: 'followup', protocols: '', weekNum: '',
  });
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [parseError, setParseError] = useState('');
  const [log, setLog] = useState<SessionRecord[]>([]);
  const [toast, setToast] = useState('');
  const [saving, setSaving] = useState(false);

  // Scroll to results when they arrive
  useEffect(() => {
    if (result) {
      document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function setField(key: keyof EncounterMeta) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setMeta((p) => ({ ...p, [key]: e.target.value }));
  }

  function handleExtract() {
    if (!note.trim()) { showToast('Paste a SOAP note first'); return; }
    setLoading(true);
    setParseError('');
    setTimeout(() => {
      try {
        setResult(parseSOAP(note));
      } catch {
        setParseError('Extraction failed — please check the note format and try again.');
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function handleClear() {
    setNote('');
    setResult(null);
    setParseError('');
  }

  function handleExportCSV() {
    if (!result) return;
    const m = [meta.patientId, meta.encounterDate, meta.clinician, meta.clinic, meta.visitType, meta.protocols, meta.weekNum].map((v) => `"${v}"`).join(',');
    let csv = 'Category,Field,Value,Unit,Status,Patient_ID,Date,Clinician,Clinic,Visit_Type,Protocols,Week\n';
    for (const v of result.vitals) csv += `Vital,"${v.name}","${v.value}","${v.unit}",,${m}\n`;
    for (const l of result.labs)   csv += `Lab,"${cap(l.name)}","${l.isPanel ? 'WNL' : l.value}","${l.unit}","${l.status}",${m}\n`;
    for (const b of result.body)   csv += `BodyComp,"${b.name}","${b.value}",,,${m}\n`;
    for (const p of result.pros)   csv += `PRO,"${p.name}","${p.value}",,"${p.category}",${m}\n`;
    for (const md of result.meds)  csv += `Medication,"${cap(md.name)}","${md.dose}","${md.freq}",,${m}\n`;
    for (const a of result.ae)     csv += `AdverseEvent,"${a.name}","${a.severity}","${a.resolution}","${a.related}",${m}\n`;
    downloadFile(csv, `irb-${meta.patientId || 'unknown'}-${meta.encounterDate}.csv`, 'text/csv');
    showToast('CSV exported');
  }

  function handleExportJSON() {
    if (!result) return;
    downloadFile(JSON.stringify(buildRecord(result, meta), null, 2), `irb-${meta.patientId || 'unknown'}-${meta.encounterDate}.json`, 'application/json');
    showToast('JSON exported');
  }

  async function handleSaveLog() {
    if (!result) return;
    const record = buildRecord(result, meta);
    setLog((prev) => [...prev, record]);
    setSaving(true);
    try {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'soap_capture', data: record }),
      });
      showToast('Record saved to database');
    } catch {
      showToast('Saved locally — database sync failed');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = INPUT_BASE;

  const summary = result
    ? [
        { key: 'vitals', num: result.vitals.length, lbl: 'Vitals',      color: SECTION_COLORS.vitals.color },
        { key: 'labs',   num: result.labs.length,   lbl: 'Lab Values',  color: SECTION_COLORS.labs.color   },
        { key: 'body',   num: result.body.length,   lbl: 'Body Comp',   color: SECTION_COLORS.body.color   },
        { key: 'pros',   num: result.pros.length,   lbl: 'PROs',        color: SECTION_COLORS.pros.color   },
        { key: 'meds',   num: result.meds.length,   lbl: 'Medications', color: SECTION_COLORS.meds.color   },
        { key: 'ae',     num: result.ae.length,     lbl: 'Adverse Events', color: SECTION_COLORS.ae.color  },
      ]
    : [];

  return (
    <div style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      <FormHeader
        breadcrumb="Clinical Forms · PPRN-001-2025"
        title="SOAP Note Data Capture"
        subtitle="Paste any SOAP note — labs, vitals, body composition, PROs, medications, and adverse events are auto-extracted into structured IRB fields."
      />

      <div className="py-10">
        <div className="container-xl">

          {/* ── Encounter Details ── */}
          <div className="bg-white rounded-2xl overflow-hidden mb-4" style={{ border: '1.5px solid var(--border)' }}>
            <div className="px-6 md:px-8 py-4" style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-base font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Encounter Details
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Records are saved to the database when you click "Save to Log."
              </p>
            </div>
            <div className="px-6 md:px-8 py-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="ptId" label="Patient ID / Initials">
                  <input id="ptId" style={inputStyle} placeholder="e.g. JM-0042" value={meta.patientId} onChange={setField('patientId')} />
                </Field>
                <Field id="encDate" label="Date of Encounter">
                  <input id="encDate" type="date" style={inputStyle} value={meta.encounterDate} onChange={setField('encounterDate')} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field id="clinician" label="Clinician">
                  <input id="clinician" style={inputStyle} placeholder="Dr. Smith" value={meta.clinician} onChange={setField('clinician')} />
                </Field>
                <Field id="clinic" label="Clinic / Site">
                  <input id="clinic" style={inputStyle} placeholder="WestlakeRX" value={meta.clinic} onChange={setField('clinic')} />
                </Field>
                <Field id="visitType" label="Visit Type">
                  <select
                    id="visitType"
                    value={meta.visitType}
                    onChange={setField('visitType')}
                    style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="initial">Initial Consult</option>
                    <option value="followup">Follow-Up</option>
                    <option value="labs">Labs Review</option>
                    <option value="adverse">Adverse Event</option>
                    <option value="discharge">Discharge</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id="protocols" label="Protocol(s)">
                  <input id="protocols" style={inputStyle} placeholder="e.g. BPC-157, Tirzepatide" value={meta.protocols} onChange={setField('protocols')} />
                </Field>
                <Field id="weekNum" label="Week #">
                  <input id="weekNum" type="number" style={inputStyle} placeholder="e.g. 4" min={0} max={104} value={meta.weekNum} onChange={setField('weekNum')} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── SOAP Input ── */}
          <div className="bg-white rounded-2xl overflow-hidden mb-4" style={{ border: '1.5px solid var(--border)' }}>
            <div className="px-6 md:px-8 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>
                Clinical Note
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
                Paste any SOAP note, progress note, or clinical encounter below.
              </p>
            </div>
            <div className="px-6 md:px-8 py-6">
              <label htmlFor="soapNote" style={LABEL_STYLE}>SOAP Note</label>
              <textarea
                id="soapNote"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={13}
                placeholder={`S: Patient reports improved energy, decreased joint pain (6/10 → 3/10). Sleeping better, 7hrs/night. No nausea or injection site reactions. Weight down 4 lbs since last visit.

O: Vitals: BP 122/78, HR 68, Temp 98.4. Weight 187 lbs. BMI 27.2. Waist 34in. Body fat 22% via bioimpedance.
Labs: TSH 2.1, Free T4 1.2, Total T 680, Free T 18.2, IGF-1 245, Hgb A1c 5.4, CRP 0.8. BMP wnl. CBC wnl.

A: Good response to BPC-157 5mg/wk and CJC/Ipamorelin. Labs within normal limits.

P: Continue current protocol. Added Tirzepatide 2.5mg/wk for metabolic optimization.`}
                style={{
                  ...inputStyle,
                  minHeight: '260px',
                  resize: 'vertical',
                  lineHeight: '1.75',
                  marginBottom: '20px',
                  fontFamily: 'var(--font-body)',
                }}
              />
              {note && (
                <p className="text-xs mb-4" style={{ color: 'var(--text-light)' }}>
                  {note.split(/\s+/).filter(Boolean).length} words
                </p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleExtract}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                  style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Extracting…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Extract &amp; Structure Data
                    </>
                  )}
                </button>
                {(result || note) && (
                  <button
                    onClick={handleClear}
                    className="text-sm font-medium px-4 py-2.5 rounded-full transition-colors"
                    style={{ border: '1.5px solid var(--border-mid)', color: 'var(--text-mid)', background: 'transparent', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {parseError && (
                <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}>
                  {parseError}
                </div>
              )}
            </div>
          </div>

          {/* ── Results ── */}
          {result && (
            <>
              {/* Scroll anchor */}
              <div id="results-anchor" style={{ scrollMarginTop: '80px' }} />

              {/* Summary bar */}
              <div
                className="rounded-2xl mb-4 overflow-hidden"
                style={{ background: 'var(--navy)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="px-6 md:px-8 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" style={{ color: 'var(--gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>Extraction Complete</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 divide-x" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {summary.map((s) => (
                    <div key={s.key} className="text-center px-4 py-5">
                      <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.num}</div>
                      <div className="text-xs mt-1 leading-tight" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data sections */}
              <div className="space-y-3">

                <SectionCard sectionKey="vitals" title="Vitals" badge="Vitals" count={result.vitals.length}>
                  {result.vitals.length === 0
                    ? <EmptyState message="No vitals detected in note." />
                    : <DataTable
                        headers={['Vital Sign', 'Value', 'Unit']}
                        rows={result.vitals.map((v) => [
                          <span key="n" className="font-medium">{v.name}</span>,
                          <span key="v" className="font-mono text-sm">{v.value}</span>,
                          <span key="u" style={{ color: 'var(--text-light)' }}>{v.unit}</span>,
                        ])}
                      />
                  }
                </SectionCard>

                <SectionCard sectionKey="labs" title="Laboratory Values" badge="Labs" count={result.labs.length}>
                  {result.labs.length === 0
                    ? <EmptyState message="No lab values detected in note." />
                    : <DataTable
                        headers={['Lab', 'Value', 'Status', 'Reference Range']}
                        rows={result.labs.map((l) => [
                          <span key="n" className="font-medium">{cap(l.name)}</span>,
                          <span key="v" className="font-mono text-sm">{l.isPanel ? 'Within Normal Limits' : `${l.value} ${l.unit}`}</span>,
                          <LabStatusPill key="s" status={l.isPanel ? 'normal' : l.status} />,
                          <span key="r" style={{ color: 'var(--text-light)', fontSize: '13px' }}>
                            {l.ref ? `${l.ref.low}–${l.ref.high} ${l.unit}` : '—'}
                          </span>,
                        ])}
                      />
                  }
                </SectionCard>

                <SectionCard sectionKey="body" title="Body Composition" badge="Body Comp" count={result.body.length}>
                  {result.body.length === 0
                    ? <EmptyState message="No body composition data detected in note." />
                    : <DataTable
                        headers={['Measure', 'Value']}
                        rows={result.body.map((b) => [
                          <span key="n" className="font-medium">{b.name}</span>,
                          <span key="v" className="font-mono text-sm">{b.value}</span>,
                        ])}
                      />
                  }
                </SectionCard>

                <SectionCard sectionKey="pros" title="Patient-Reported Outcomes" badge="PROs" count={result.pros.length}>
                  {result.pros.length === 0
                    ? <EmptyState message="No patient-reported outcomes detected in note." />
                    : <DataTable
                        headers={['Outcome', 'Finding', 'Category']}
                        rows={result.pros.map((p) => [
                          <span key="n" className="font-medium">{p.name}</span>,
                          <span key="v" className={p.value === 'Improved' ? 'font-semibold' : ''} style={{ color: p.value === 'Improved' ? '#16a34a' : p.value === 'Worsened' ? '#dc2626' : 'var(--text-mid)' }}>{p.value}</span>,
                          <span key="c" className="capitalize text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-mid)', color: 'var(--text-mid)' }}>{p.category}</span>,
                        ])}
                      />
                  }
                </SectionCard>

                <SectionCard sectionKey="meds" title="Medications / Protocols" badge="Meds" count={result.meds.length}>
                  {result.meds.length === 0
                    ? <EmptyState message="No medications or protocols detected in note." />
                    : <DataTable
                        headers={['Compound', 'Dose', 'Frequency']}
                        rows={result.meds.map((m) => [
                          <span key="n" className="font-medium">{cap(m.name)}</span>,
                          <span key="d" className="font-mono text-sm">{m.dose || '—'}</span>,
                          <span key="f" style={{ color: 'var(--text-mid)', textTransform: 'capitalize' }}>{m.freq || '—'}</span>,
                        ])}
                      />
                  }
                </SectionCard>

                <SectionCard sectionKey="ae" title="Adverse Events" badge="AE" count={result.ae.length}>
                  {result.ae.length === 0
                    ? (
                      <div className="flex items-center gap-2 py-1">
                        <svg className="w-4 h-4 shrink-0" style={{ color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm" style={{ color: '#16a34a', fontWeight: 500 }}>No adverse events detected.</p>
                      </div>
                    )
                    : <DataTable
                        headers={['Event', 'Severity', 'Status', 'Relatedness']}
                        rows={result.ae.map((a) => [
                          <span key="n" className="font-medium">{a.name}</span>,
                          <AESeverityPill key="s" severity={a.severity} />,
                          <span key="res" className="capitalize text-sm" style={{ color: 'var(--text-mid)' }}>{a.resolution}</span>,
                          <span key="rel" className="capitalize text-sm" style={{ color: 'var(--text-light)' }}>{a.related}</span>,
                        ])}
                      />
                  }
                </SectionCard>
              </div>

              {/* Export bar */}
              <div
                className="mt-4 rounded-2xl px-6 md:px-8 py-5 flex items-center justify-between flex-wrap gap-4"
                style={{ background: 'white', border: '1.5px solid var(--border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>Export this record</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>Download or save to the session log below.</p>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  <button
                    onClick={handleExportCSV}
                    className="btn-primary text-sm flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    CSV
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="text-sm font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
                    style={{ border: '1.5px solid var(--border-mid)', color: 'var(--text-dark)', background: 'transparent', cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    JSON
                  </button>
                  <button
                    onClick={handleSaveLog}
                    disabled={saving}
                    className="text-sm font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors"
                    style={{ border: '1.5px solid var(--border-mid)', color: 'var(--text-dark)', background: 'transparent', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    {saving ? 'Saving...' : 'Save to Log'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── Session Log ── */}
          <div className="mt-4 bg-white rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--border)' }}>
            <div className="px-6 md:px-8 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)' }}>
                  Session Record Log
                </h3>
                {log.length > 0 && (
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(200,149,44,0.12)', color: 'var(--gold)' }}
                  >
                    {log.length} {log.length === 1 ? 'record' : 'records'}
                  </span>
                )}
              </div>
            </div>
            <div className="px-6 md:px-8">
              {log.length === 0 ? (
                <div className="py-8 text-center">
                  <svg className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--border-mid)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--text-light)' }}>No records yet. Extract a note and click "Save to Log."</p>
                </div>
              ) : (
                log.map((r, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-4"
                    style={{ borderBottom: i < log.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-dark)' }}>
                          {r.meta.patientId || `Patient ${i + 1}`}
                          <span className="font-normal ml-2 capitalize" style={{ color: 'var(--text-light)' }}>{r.meta.visitType}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
                          {r.meta.encounterDate || 'No date'}
                          {r.meta.clinician && <> · {r.meta.clinician}</>}
                          {r.meta.clinic && <> · {r.meta.clinic}</>}
                          {' · '}{r.labs.length} labs · {r.adverseEvents.length} AEs
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full shrink-0 ml-3"
                      style={{ background: 'rgba(200,149,44,0.12)', color: 'var(--gold)' }}
                    >
                      Captured
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 text-sm font-medium px-5 py-3.5 rounded-xl z-50 pointer-events-none"
          style={{ background: 'var(--navy)', color: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
