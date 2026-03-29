import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/sections/PageHero';

export const metadata: Metadata = {
  title: 'Legality & Compliance | Peptide Pure Research Network',
  description:
    'Transparency about the regulatory landscape for compounded peptides, GLP-1 therapies, and IRB-approved research protocols. Peptide Pure Research Network.',
  alternates: { canonical: '/legality' },
};

/* ── Styled callout components ── */
function InfoCallout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-5 my-6"
      style={{ background: '#FFF8E7', borderLeft: '4px solid var(--gold)' }}
    >
      <p className="text-sm font-bold mb-1" style={{ color: 'var(--gold)' }}>{title}</p>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-dark)' }}>{children}</div>
    </div>
  );
}

function WarningCallout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-5 my-6"
      style={{ background: '#FFF0F0', borderLeft: '4px solid #dc2626' }}
    >
      <p className="text-sm font-bold mb-1" style={{ color: '#dc2626' }}>{title}</p>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-dark)' }}>{children}</div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-bold mt-14 mb-4" style={{ color: 'var(--navy)' }}>
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold mt-8 mb-3" style={{ color: 'var(--navy)' }}>
      {children}
    </h3>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-mid)' }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function LegalityPage() {
  return (
    <>
      <PageHero
        sectionLabel="Transparency"
        heading="Legality & Compliance"
        subtitle="Our commitment to transparency about the regulatory landscape for compounded peptides, IRB-approved research, and practitioner protections."
      />

      <section className="py-16">
        <div className="container-xl max-w-3xl">

          {/* ── Intro ── */}
          <Paragraph>
            Peptide Pure Research Network (PPRN) operates at the intersection of cutting-edge regenerative medicine
            and an evolving regulatory landscape. We believe you deserve complete transparency about what that means,
            including the grey areas.
          </Paragraph>
          <Paragraph>
            This page explains the legal frameworks under which we operate, the protections in place for participants,
            and the regulatory realities practitioners should understand before enrolling patients.
          </Paragraph>

          <InfoCallout title="IMPORTANT DISCLOSURE">
            This page is for informational and educational purposes only. It does not constitute legal advice.
            If you have legal questions about your practice&apos;s regulatory exposure, consult a healthcare attorney.
          </InfoCallout>

          {/* ══════════════════════════════════════════════════════════════
             REGULATORY FRAMEWORK
          ══════════════════════════════════════════════════════════════ */}
          <SectionHeading>Regulatory Framework</SectionHeading>

          <SubHeading>FDA &amp; Compounding Pharmacy Law (503A / 503B)</SubHeading>
          <Paragraph>
            Peptide therapies prescribed through PPRN-affiliated practitioners are sourced from licensed compounding
            pharmacies operating under Section 503A or Section 503B of the Federal Food, Drug, and Cosmetic Act (FD&amp;C Act).
          </Paragraph>
          <BulletList items={[
            <><strong>503A pharmacies</strong> compound medications pursuant to valid, patient-specific prescriptions from licensed practitioners.</>,
            <><strong>503B outsourcing facilities</strong> operate under direct FDA oversight and may distribute compounded medications without patient-specific prescriptions.</>,
            <>Both pathways are <strong>legal, federally recognized frameworks</strong> for providing non-commercially-available drug formulations.</>,
          ]} />
          <Paragraph>
            However, compounding pharmacies may not compound drugs that are &ldquo;essentially a copy&rdquo; of a commercially
            available FDA-approved product unless that product appears on the FDA Drug Shortage List at the time of
            compounding, distribution, and dispensing.
          </Paragraph>

          <SubHeading>IRB-Approved Research Protocol</SubHeading>
          <Paragraph>
            All peptide therapies administered through PPRN are conducted under an Institutional Review Board
            (IRB)-approved research protocol:
          </Paragraph>
          <div
            className="rounded-lg p-5 my-4"
            style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>Protocol</p>
                <p className="font-bold" style={{ color: 'var(--navy)' }}>PPRN-001-2025</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>IRB Approval</p>
                <p className="font-bold" style={{ color: 'var(--navy)' }}>IRCM-2025-467</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-light)' }}>Principal Investigator</p>
                <p className="font-bold" style={{ color: 'var(--navy)' }}>M. Scott Mortensen, PA-C</p>
              </div>
            </div>
          </div>
          <Paragraph>
            IRB oversight provides an additional layer of patient protection, requiring informed consent, adverse event
            reporting, data integrity standards, and periodic review of outcomes. This is the same framework used by
            academic medical centers conducting clinical research.
          </Paragraph>

          <SubHeading>21 CFR Part 11 &amp; HIPAA Compliance</SubHeading>
          <Paragraph>
            PPRN data collection systems are designed for compliance with 21 CFR Part 11 (electronic records and signatures)
            and HIPAA privacy and security rules. Patient data is encrypted, access-controlled, and auditable.
          </Paragraph>

          {/* ══════════════════════════════════════════════════════════════
             THE GREY AREA
          ══════════════════════════════════════════════════════════════ */}
          <SectionHeading>The Grey Area: What You Need to Know</SectionHeading>

          <SubHeading>GLP-1 Receptor Agonists (Semaglutide &amp; Tirzepatide)</SubHeading>
          <Paragraph>
            This is the most legally contentious area in compounding pharmacy today.
          </Paragraph>
          <Paragraph>
            The FDA removed tirzepatide from the Drug Shortage List in October 2024 and semaglutide in February 2025.
            Once a drug is off the shortage list, compounding pharmacies lose their legal basis to compound
            &ldquo;essentially a copy&rdquo; of the branded product.
          </Paragraph>

          <WarningCallout title="CEASE-AND-DESIST RISK">
            <strong>Novo Nordisk</strong> (Ozempic/Wegovy) has filed over 130 lawsuits across 40+ states against
            compounding pharmacies and telehealth companies. As of February 2026, Novo escalated with a sweeping
            patent infringement suit against Hims &amp; Hers.
            <br /><br />
            <strong>Eli Lilly</strong> (Mounjaro/Zepbound) has filed dozens of similar lawsuits and cease-and-desist
            campaigns targeting clinics, compounding pharmacies, and medical spas.
            <br /><br />
            Both companies are sending hundreds of cease-and-desist letters demanding immediate cessation of
            compounding activities, with recipients given days to respond or face civil litigation and regulatory referral.
          </WarningCallout>

          <Paragraph>
            Some compounding pharmacies and legal advocates are fighting back. The Outsourcing Facilities Association filed
            suit against the FDA in February 2025, challenging the semaglutide shortage resolution. Some pharmacies are
            reformulating with different salt forms (e.g., semaglutide sodium vs. semaglutide acetate) to argue their
            products are not &ldquo;essentially a copy.&rdquo; Courts are still deciding these questions.
          </Paragraph>

          <InfoCallout title="PPRN POSITION">
            PPRN does not take a position on whether compounded GLP-1s will remain legally available long-term.
            We do take the position that practitioners should enter this space with eyes open.
          </InfoCallout>

          <SubHeading>Non-GLP-1 Peptides (BPC-157, CJC-1295, Thymosin, etc.)</SubHeading>
          <Paragraph>
            The FDA maintains a categorization system for bulk drug substances used in compounding:
          </Paragraph>
          <BulletList items={[
            <><strong>Category 1:</strong> Eligible for compounding. FDA will not take enforcement action.</>,
            <><strong>Category 2:</strong> FDA has identified significant safety concerns. Cannot be compounded unless FDA publishes a final rule authorizing use. <strong>BPC-157 is currently in Category 2.</strong></>,
            <><strong>Category 3:</strong> Under evaluation. Status pending.</>,
          ]} />
          <Paragraph>
            Additionally, the FDA expanded Import Alert 66-78 in 2025 to add 12 more unapproved peptides.
            &ldquo;Research use only&rdquo; peptides purchased from unregulated online vendors are illegal to administer
            to patients and expose practitioners to criminal liability.
          </Paragraph>

          <InfoCallout title="PPRN SOURCING POLICY">
            PPRN protocols only use peptides sourced from licensed 503A or 503B compounding pharmacies. We do not use,
            recommend, or condone &ldquo;research-grade&rdquo; or &ldquo;grey market&rdquo; peptides.
          </InfoCallout>

          {/* ══════════════════════════════════════════════════════════════
             LEGAL STRUCTURES
          ══════════════════════════════════════════════════════════════ */}
          <SectionHeading>Legal Structures &amp; Protections</SectionHeading>

          <SubHeading>Non-Profit Research Organization (501(c)(3))</SubHeading>
          <Paragraph>
            Peptide Pure Research Network operates under Mortensen Medical, a 501(c)(3) non-profit research organization.
            This structure:
          </Paragraph>
          <BulletList items={[
            'Separates research activities from commercial interests',
            'Provides institutional backing for IRB-approved protocols',
            'Ensures that patient safety and scientific integrity, not profit, drive treatment decisions',
            'Aligns with FDA expectations for legitimate clinical research',
          ]} />

          <SubHeading>Private Membership Association (PMA)</SubHeading>
          <Paragraph>
            As an alternative or supplemental legal framework, some practitioners in the peptide and regenerative medicine
            space operate under a Private Membership Association (PMA) structure.
          </Paragraph>
          <Paragraph>
            A PMA is grounded in the First and Fourteenth Amendment right to free association, as affirmed in{' '}
            <em>Griswold v. Connecticut</em> (1965) and subsequent Supreme Court decisions. Within a PMA:
          </Paragraph>
          <BulletList items={[
            'Members voluntarily join a private association and consent to receive services outside the scope of public regulatory frameworks.',
            'The association operates as a private contract between consenting adults, not a public-facing commercial entity.',
            'Services provided within the association may not be subject to the same licensing and regulatory requirements as publicly offered medical services.',
          ]} />

          <InfoCallout title="PRACTITIONER GUIDANCE">
            PPRN recommends that practitioners who wish to explore a PMA structure consult a healthcare attorney
            with specific experience in private association law and FDA enforcement.
          </InfoCallout>

          {/* ══════════════════════════════════════════════════════════════
             HOW PPRN PROTECTS PRACTITIONERS
          ══════════════════════════════════════════════════════════════ */}
          <SectionHeading>How PPRN Protects Practitioners</SectionHeading>
          <Paragraph>
            Participating in PPRN provides practitioners with multiple layers of legal and professional protection:
          </Paragraph>
          <BulletList items={[
            <><strong>IRB-Approved Protocol:</strong> Demonstrates that treatments are part of a legitimate, supervised research framework — not ad hoc prescribing.</>,
            <><strong>Informed Consent Templates:</strong> Standardized, IRB-reviewed consent forms that document patient understanding of risks, benefits, and the investigational nature of therapies.</>,
            <><strong>Adverse Event Reporting:</strong> Structured AE reporting to the IRB within 24 hours for SAEs, demonstrating active safety monitoring.</>,
            <><strong>Data Capture Standards:</strong> 21 CFR Part 11-aligned data collection showing scientific rigor, not just commercial distribution.</>,
            <><strong>Licensed Pharmacy Sources Only:</strong> All peptides sourced from 503A/503B pharmacies, never grey-market or research-only suppliers.</>,
            <><strong>Medical Director Oversight:</strong> Collaborative Practice Agreement with a licensed physician Medical Director providing supervision and accountability.</>,
          ]} />

          {/* ══════════════════════════════════════════════════════════════
             THE BOTTOM LINE
          ══════════════════════════════════════════════════════════════ */}
          <SectionHeading>The Bottom Line</SectionHeading>
          <Paragraph>
            Peptide therapy exists in a regulatory grey area. We are honest about that because we believe trust is built
            through transparency, not through making claims that are too good to be true.
          </Paragraph>

          <SubHeading>What we can tell you:</SubHeading>
          <BulletList items={[
            'Every peptide prescribed through PPRN is sourced from a licensed, regulated pharmacy.',
            'Every treatment is conducted under an IRB-approved research protocol with proper informed consent.',
            'Every adverse event is reported and tracked.',
            'Our goal is to generate the clinical evidence that will either validate these therapies for mainstream adoption or identify risks that justify restricting them.',
          ]} />

          <SubHeading>What we cannot tell you:</SubHeading>
          <BulletList items={[
            'That compounded GLP-1 agonists will remain legally available in their current form. The legal landscape is shifting rapidly.',
            'That a PMA structure will definitively protect you from FDA enforcement. It may help, but it has not been battle-tested for this specific use case.',
            'That peptide therapy is "FDA-approved." It is not. It is investigational, and participants should understand that clearly.',
          ]} />

          <Paragraph>
            If you have legal questions about your practice&apos;s exposure, we encourage you to consult a healthcare attorney.
            PPRN is a research network, not a law firm.
          </Paragraph>

          {/* ── Contact / CTA ── */}
          <div
            className="mt-14 rounded-2xl p-10 text-center"
            style={{ background: 'var(--navy)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
              Questions?
            </p>
            <h2 className="text-2xl font-bold text-white mb-4">
              Contact Our Team
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Reach out with any questions about our research protocols, regulatory framework, or practitioner enrollment.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="mailto:info@peptidepure.com" className="btn-primary px-8 py-3">
                info@peptidepure.com
              </a>
              <Link
                href="/contact"
                className="px-8 py-3 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                Contact Form
              </Link>
            </div>
          </div>

          {/* ── Last updated ── */}
          <p className="text-xs text-center mt-8" style={{ color: 'var(--text-light)' }}>
            Last updated: March 2026
          </p>

        </div>
      </section>
    </>
  );
}
