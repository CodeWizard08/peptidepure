'use client';

/**
 * ReconstitutionCalculator
 *
 * Pure client-side reconstitution math for clinicians and patients.
 *
 *   vial strength (mg)  ────┐
 *   BAC water added (mL) ──┼──→  units to draw on a U-100 syringe
 *   target dose (mcg)   ────┘
 *
 * Formula:
 *   mcg per mL = (vialMg × 1000) / waterMl
 *   mL to draw = targetDoseMcg / mcgPerMl
 *   units      = mL to draw × 100   (U-100 insulin syringe)
 *
 * Pre-fills vialMg from the product's metadata.strength when possible.
 */

import { useState, useMemo } from 'react';

function parseStrengthMg(strength?: string): number | null {
  if (!strength) return null;
  // matches "10mg", "500mcg", "1500 mg", etc.
  const match = strength.trim().match(/^(\d+(?:\.\d+)?)\s*(mg|mcg)$/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return match[2].toLowerCase() === 'mcg' ? value / 1000 : value;
}

function parseAmountMl(amount?: string): number | null {
  if (!amount) return null;
  const match = amount.trim().match(/^(\d+(?:\.\d+)?)\s*ml$/i);
  return match ? parseFloat(match[1]) : null;
}

export default function ReconstitutionCalculator({
  defaultStrength,
  defaultAmount,
  baseName,
}: {
  defaultStrength?: string;
  defaultAmount?: string;
  baseName: string;
}) {
  const initialMg = parseStrengthMg(defaultStrength) ?? 10;
  const initialMl = parseAmountMl(defaultAmount) ?? 2;

  const [vialMg, setVialMg] = useState(initialMg);
  const [waterMl, setWaterMl] = useState(initialMl);
  const [targetMcg, setTargetMcg] = useState(250);

  const result = useMemo(() => {
    if (vialMg <= 0 || waterMl <= 0 || targetMcg <= 0) return null;
    const totalMcg = vialMg * 1000;
    const mcgPerMl = totalMcg / waterMl;
    const mlPerDose = targetMcg / mcgPerMl;
    const units = mlPerDose * 100;
    const dosesPerVial = totalMcg / targetMcg;
    return {
      mcgPerMl,
      mlPerDose,
      units,
      dosesPerVial,
      isOverDraw: units > 100,
    };
  }, [vialMg, waterMl, targetMcg]);

  return (
    <div
      className="rounded-2xl bg-white overflow-hidden h-full"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{
          background: 'linear-gradient(90deg, var(--navy) 0%, #11305c 100%)',
          borderBottom: '1px solid rgba(200,149,44,0.25)',
        }}
      >
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--gold)" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5m4.75-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
        <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
          Reconstitution Calculator
        </h3>
      </div>

      <div className="p-5">
        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-mid)' }}>
          Calculate exactly how many units to draw on a U-100 insulin syringe for your target dose.
          Pre-filled with {baseName} defaults — adjust as needed.
        </p>

        {/* Inputs */}
        <div className="space-y-4 mb-5">
          <NumberInput
            label="Vial Strength"
            unit="mg"
            value={vialMg}
            onChange={setVialMg}
            step={0.5}
            min={0.1}
            help="Total peptide in the vial (e.g. 10mg)"
          />
          <NumberInput
            label="Bacteriostatic Water Added"
            unit="mL"
            value={waterMl}
            onChange={setWaterMl}
            step={0.5}
            min={0.1}
            help="Volume of BAC water used to reconstitute"
          />
          <NumberInput
            label="Target Dose"
            unit="mcg"
            value={targetMcg}
            onChange={setTargetMcg}
            step={50}
            min={1}
            help="Single-injection dose in micrograms"
          />
        </div>

        {/* Result */}
        {result && (
          <div
            className="rounded-xl p-4"
            style={{
              background: result.isOverDraw ? '#FEF2F2' : 'var(--gold-pale)',
              border: result.isOverDraw
                ? '1px solid #FECACA'
                : '1px solid rgba(200,149,44,0.3)',
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: result.isOverDraw ? '#991B1B' : 'var(--gold)' }}
            >
              Draw to
            </p>
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className="text-5xl font-bold tabular-nums"
                style={{ color: result.isOverDraw ? '#991B1B' : 'var(--navy)' }}
              >
                {result.units.toFixed(1)}
              </span>
              <span className="text-base font-semibold" style={{ color: 'var(--text-mid)' }}>
                units on a U-100 syringe
              </span>
            </div>
            <div
              className="grid grid-cols-2 gap-3 pt-3 text-sm"
              style={{ borderTop: '1px solid rgba(11,31,58,0.1)' }}
            >
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>
                  Per mL
                </p>
                <p className="text-base font-semibold tabular-nums" style={{ color: 'var(--navy)' }}>
                  {result.mcgPerMl.toFixed(0)} mcg
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-light)' }}>
                  Doses per vial
                </p>
                <p className="text-base font-semibold tabular-nums" style={{ color: 'var(--navy)' }}>
                  ~{Math.floor(result.dosesPerVial)}
                </p>
              </div>
            </div>
            {result.isOverDraw && (
              <p className="text-xs mt-3 leading-snug" style={{ color: '#991B1B' }}>
                ⚠ Draw exceeds 100 units (1 mL). Use a larger syringe, reduce dose, or add more BAC water to dilute.
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className="px-5 py-2.5"
        style={{ background: 'var(--off-white)', borderTop: '1px solid var(--border)' }}
      >
        <p className="text-xs font-medium" style={{ color: 'var(--text-light)' }}>
          Always double-check reconstitution math. This tool is for reference — clinician supervision required.
        </p>
      </div>
    </div>
  );
}

function NumberInput({
  label,
  unit,
  value,
  onChange,
  step,
  min,
  help,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  help?: string;
}) {
  return (
    <div>
      <label className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-light)' }}>{unit}</span>
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={min}
        className="w-full px-3 py-2.5 rounded-lg text-base font-semibold tabular-nums outline-none transition-colors"
        style={{
          background: 'var(--off-white)',
          border: '1px solid var(--border)',
          color: 'var(--navy)',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      />
      {help && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
          {help}
        </p>
      )}
    </div>
  );
}
