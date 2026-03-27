import Link from 'next/link';
import Image from 'next/image';

interface FooterContent {
  brandDescription: string;
  trustBadges: string[];
  quickLinks: { label: string; href: string }[];
  legalLinks: { label: string; href: string }[];
  contactItems: { label: string; value: string; sub: string; href: string | null }[];
  disclaimer: string;
  copyright: string;
  bottomLinks: { label: string; href: string }[];
}

const contactIcons = [
  // Phone
  <svg key="phone" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>,
  // Email
  <svg key="email" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>,
  // Shipping
  <svg key="shipping" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>,
];

export default function Footer({ content }: { content: FooterContent }) {
  return (
    <footer style={{ background: 'var(--navy)' }} className="text-white">
      {/* Gold accent top line */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(to right, transparent, var(--gold), transparent)' }} />

      {/* Main footer body */}
      <div className="container-xl">
        <div className="grid grid-cols-12 gap-6 md:gap-x-10 md:gap-y-8 pt-10 md:pt-14 pb-8 md:pb-12">

          {/* ── Brand column (wider) */}
          <div className="col-span-12 md:col-span-4 lg:col-span-4 flex flex-col gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center w-fit">
              <Image src="/logo.webp" alt="PeptidePure™" width={140} height={34} style={{ height: '34px', width: 'auto' }} />
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              {content.brandDescription}
            </p>

            {/* Trust badges row */}
            <div className="flex flex-wrap gap-2 pt-1">
              {content.trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="text-xs px-2.5 py-1 rounded-md font-medium"
                  style={{
                    background: 'rgba(200,149,44,0.1)',
                    border: '1px solid rgba(200,149,44,0.25)',
                    color: 'var(--gold-light)',
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* ── Spacer on lg */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* ── Quick Links */}
          <div className="col-span-6 sm:col-span-6 md:col-span-2 lg:col-span-2">
            <ColumnHeader>Quick Links</ColumnHeader>
            <ul className="space-y-2.5 mt-3">
              {content.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-gold transition-colors" style={{ flexShrink: 0 }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal */}
          <div className="col-span-6 sm:col-span-6 md:col-span-2 lg:col-span-2">
            <ColumnHeader>Legal</ColumnHeader>
            <ul className="space-y-2.5 mt-3">
              {content.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-gold transition-colors" style={{ flexShrink: 0 }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support / Contact */}
          <div className="col-span-12 sm:col-span-12 md:col-span-4 lg:col-span-3">
            <ColumnHeader>Support</ColumnHeader>
            <ul className="space-y-4 mt-3">
              {content.contactItems.map((item, i) => (
                <li key={item.label} className="flex items-start gap-3">
                  {/* Icon pill */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: 'rgba(200,149,44,0.12)',
                      border: '1px solid rgba(200,149,44,0.2)',
                      color: 'var(--gold)',
                    }}
                  >
                    {contactIcons[i]}
                  </div>
                  {/* Text */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-0.5">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-gray-200 hover:text-white transition-colors font-medium"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-200 font-medium">{item.value}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="container-xl">
        <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
      </div>

      {/* Disclaimer */}
      <div className="container-xl">
        <p className="text-xs text-gray-500 py-6 leading-relaxed text-center max-w-4xl mx-auto">
          {content.disclaimer}
        </p>
      </div>

      {/* Bottom bar */}
      <div style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container-xl py-3.5! flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-xs text-gray-600 text-center sm:text-left order-2 sm:order-1">
            {content.copyright}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 order-1 sm:order-2">
            {content.bottomLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--gold)' }}>
        {children}
      </h4>
      <div className="mt-1.5 h-px w-6" style={{ background: 'var(--gold)', opacity: 0.4 }} />
    </div>
  );
}

