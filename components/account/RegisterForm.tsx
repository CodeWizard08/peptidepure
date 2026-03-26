'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Field, PasswordField } from './AccountPrimitives';
import { UserIcon, MailIcon, PhoneIcon, IdIcon, ClinicIcon, UploadIcon } from './AccountIcons';

export default function RegisterForm() {
  const supabase = createClient();
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regClinic, setRegClinic] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regNpi, setRegNpi] = useState('');
  const [regCredential, setRegCredential] = useState('');
  const [regFile, setRegFile] = useState<File | null>(null);
  const [regWarning, setRegWarning] = useState('');
  const [regDragging, setRegDragging] = useState(false);
  const [regAgree1, setRegAgree1] = useState(false);
  const [regAgree2, setRegAgree2] = useState(false);
  const [regSignature, setRegSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(''); setRegWarning(''); setRegLoading(true);
    if (!regName.trim() || !regClinic.trim() || !regNpi.trim() || !regCredential) {
      setRegError('Please fill in all required fields.'); setRegLoading(false); return;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters.'); setRegLoading(false); return;
    }
    if (!/^\d{10}$/.test(regNpi.trim())) {
      setRegError('NPI Number must be exactly 10 digits.'); setRegLoading(false); return;
    }
    if (regFile && regFile.size > 10 * 1024 * 1024) {
      setRegError('License file must be under 10 MB.'); setRegLoading(false); return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: regEmail, password: regPassword,
      options: { data: { full_name: regName, clinic: regClinic, phone: regPhone, npi_number: regNpi, credential: regCredential } },
    });
    if (error) { setRegError(error.message); setRegLoading(false); return; }

    const warnings: string[] = [];
    if (regFile && data.user) {
      const fileExt = regFile.name.split('.').pop();
      const { error: uploadError } = await supabase.storage.from('licenses').upload(`${data.user.id}/license.${fileExt}`, regFile, { cacheControl: '3600', upsert: true });
      if (uploadError) warnings.push('License document could not be uploaded — please email it to support@peptidepure.com.');
    }
    if (regSignature && data.user) {
      try {
        const blob = await (await fetch(regSignature)).blob();
        await supabase.storage.from('licenses').upload(`${data.user.id}/signature.png`, blob, { contentType: 'image/png', upsert: true });
      } catch { /* non-fatal */ }
    }
    setRegLoading(false);
    if (warnings.length > 0) setRegWarning(warnings.join(' '));
    setRegSuccess(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setRegSignature('');
  };

  const captureSignature = () => { if (canvasRef.current) setRegSignature(canvasRef.current.toDataURL()); };

  const onCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath(); ctx.moveTo((e.clientX - rect.left) * canvas.width / rect.width, (e.clientY - rect.top) * canvas.height / rect.height);
  };
  const onCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = 'var(--navy)';
    ctx.lineTo((e.clientX - rect.left) * canvas.width / rect.width, (e.clientY - rect.top) * canvas.height / rect.height); ctx.stroke();
  };
  const onCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); setIsDrawing(true);
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect(); const touch = e.touches[0];
    ctx.beginPath(); ctx.moveTo((touch.clientX - rect.left) * canvas.width / rect.width, (touch.clientY - rect.top) * canvas.height / rect.height);
  };
  const onCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect(); const touch = e.touches[0];
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = 'var(--navy)';
    ctx.lineTo((touch.clientX - rect.left) * canvas.width / rect.width, (touch.clientY - rect.top) * canvas.height / rect.height); ctx.stroke();
  };

  return (
    <div id="register-form" className="rounded-3xl p-8 md:p-10 relative scroll-mt-28" style={{ background: 'white', border: '1px solid rgba(11,31,58,0.08)', boxShadow: '0 8px 40px rgba(11,31,58,0.07)' }}>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: 'rgba(11,31,58,0.06)', border: '1px solid rgba(11,31,58,0.12)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--navy)' }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--navy)' }}>New Clinician</span>
        </div>
        <h2 className="text-2xl font-black" style={{ color: 'var(--navy)', letterSpacing: '-0.02em' }}>Register</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>Apply for verified clinician access</p>
      </div>

      {regSuccess ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <svg className="w-8 h-8" style={{ color: '#10B981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--navy)' }}>Registration Successful</h3>
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>Please check your email to verify your account.</p>
          {regWarning && (
            <div className="mt-4 text-xs px-4 py-3 rounded-xl text-left" style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.3)', color: '#92400E' }}>{regWarning}</div>
          )}
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" placeholder="Full Name *" icon={<UserIcon />} value={regName} onChange={setRegName} required />
            <Field label="Email" type="email" placeholder="Email *" icon={<MailIcon />} value={regEmail} onChange={setRegEmail} required />
          </div>
          <PasswordField label="Password" placeholder="Password *" value={regPassword} onChange={setRegPassword} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Clinic / Practice" placeholder="Clinic / Practice *" icon={<ClinicIcon />} value={regClinic} onChange={setRegClinic} required />
            <Field label="Phone" type="tel" placeholder="Phone Number" icon={<PhoneIcon />} value={regPhone} onChange={setRegPhone} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="NPI Number" placeholder="NPI Number *" icon={<IdIcon />} value={regNpi} onChange={setRegNpi} required />
            <div className="group">
              <div className="relative flex items-center rounded-xl transition-all duration-200" style={{ background: 'rgba(11,31,58,0.04)', border: '1px solid rgba(11,31,58,0.1)' }}>
                <span className="absolute left-4" style={{ color: 'var(--text-light)' }}><IdIcon /></span>
                <select value={regCredential} onChange={(e) => setRegCredential(e.target.value)} aria-label="Credential Type" required
                  className="w-full py-3.5 text-sm bg-transparent focus:outline-none appearance-none"
                  style={{ paddingLeft: '2.75rem', paddingRight: '1rem', color: regCredential ? 'var(--text-dark)' : 'var(--text-light)' }}>
                  <option value="">Credential Type *</option>
                  {['MD', 'DO', 'PA-C', 'NP', 'ND', 'DC', 'PharmD', 'Researcher', 'Other'].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {regError && <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', color: '#DC2626' }}>{regError}</div>}

          {/* File upload */}
          <div>
            <input ref={fileRef} type="file" className="sr-only" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setRegFile(e.target.files?.[0] ?? null)} />
            <button type="button" onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setRegDragging(true); }}
              onDragLeave={() => setRegDragging(false)}
              onDrop={(e) => { e.preventDefault(); setRegDragging(false); const f = e.dataTransfer.files?.[0]; if (f) setRegFile(f); }}
              className="w-full flex flex-col items-center justify-center gap-2 py-5 rounded-xl text-sm transition-all duration-200"
              style={{ background: regDragging ? 'rgba(200,149,44,0.06)' : 'rgba(11,31,58,0.03)', border: regDragging ? '1.5px dashed var(--gold)' : '1.5px dashed rgba(11,31,58,0.18)', color: regFile ? 'var(--gold)' : 'var(--text-light)' }}>
              <UploadIcon />
              <span className="font-medium">{regFile ? regFile.name : 'Upload license documents'}</span>
              <span className="text-xs" style={{ color: 'var(--text-light)' }}>{regFile ? 'Click to change file' : 'PDF, PNG, JPG — drag & drop or click'}</span>
            </button>
          </div>

          {/* Signature */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--navy)' }}>
              Signature <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div className="relative rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(11,31,58,0.15)', background: 'white' }}>
              <canvas ref={canvasRef} width={500} height={120} className="w-full cursor-crosshair" style={{ height: '120px', touchAction: 'none' }}
                onMouseDown={onCanvasMouseDown}
                onMouseMove={onCanvasMouseMove}
                onMouseUp={() => { setIsDrawing(false); captureSignature(); }}
                onMouseLeave={() => { if (isDrawing) { setIsDrawing(false); captureSignature(); } }}
                onTouchStart={onCanvasTouchStart}
                onTouchMove={onCanvasTouchMove}
                onTouchEnd={(e) => { e.preventDefault(); setIsDrawing(false); captureSignature(); }}
              />
              {!regSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs" style={{ color: 'var(--text-light)' }}>Draw your signature here</span>
                </div>
              )}
            </div>
            <button type="button" className="text-xs mt-1.5 underline underline-offset-2 transition-colors hover:opacity-70" style={{ color: 'var(--text-light)' }} onClick={clearSignature}>
              Clear signature
            </button>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            {[
              { checked: regAgree1, setChecked: setRegAgree1, text: (<>I agree to the Peptide Pure LLC Provider{' '}<a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: 'var(--gold)' }} onClick={(e) => e.stopPropagation()}>Terms &amp; Conditions</a>{' '}(including Clinician Use Only and IRB restrictions).</>) },
              { checked: regAgree2, setChecked: setRegAgree2, text: (<>The undersigned physician/provider agrees to participate as a site participant in the{' '}<a href="https://dzbvaswimmaxfvambivu.supabase.co/storage/v1/object/public/peptides/wp-content/uploads/2025/12/IRB-Provider-Site-Participation-Agreement.pdf" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: 'var(--gold)' }} onClick={(e) => e.stopPropagation()}>IRB-approved observational registry</a>{' '}Mortensen Medical Research Network.</>) },
            ].map(({ checked, setChecked, text }, i) => (
              <label key={i} className="flex gap-3 cursor-pointer">
                <div className="mt-0.5 w-5 h-5 shrink-0 rounded-md flex items-center justify-center transition-all duration-200"
                  style={{ background: checked ? 'var(--navy)' : 'white', border: checked ? '1.5px solid var(--navy)' : '1.5px solid rgba(11,31,58,0.2)', boxShadow: checked ? '0 2px 8px rgba(11,31,58,0.2)' : 'none' }}
                  onClick={() => setChecked((v) => !v)}>
                  {checked && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </div>
                <span className="text-xs leading-relaxed transition-colors" style={{ color: checked ? 'var(--text-dark)' : 'var(--text-mid)' }} onClick={() => setChecked((v) => !v)}>{text}</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={regLoading || !regAgree1 || !regAgree2 || !regSignature}
            className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: regLoading || !regAgree1 || !regAgree2 || !regSignature ? 'var(--text-light)' : 'linear-gradient(135deg, var(--navy) 0%, #1e4080 100%)',
              boxShadow: !regLoading && regAgree1 && regAgree2 && regSignature ? '0 4px 20px rgba(11,31,58,0.3)' : 'none',
              letterSpacing: '0.02em', cursor: !regAgree1 || !regAgree2 || !regSignature ? 'not-allowed' : 'pointer', opacity: regLoading ? 0.7 : 1,
            }}>
            {regLoading ? 'Submitting…' : 'Register'}
          </button>
        </form>
      )}
    </div>
  );
}
