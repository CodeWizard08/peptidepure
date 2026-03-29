export interface HeroSection {
  sectionLabel: string;
  heading: string;
  subtitle: string;
}

export const VALID_CONTENT_PAGES = [
  'home',
  'hero-slider',
  'peptides',
  'how-it-works',
  'our-company',
  'coa',
  'contact',
  'footer',
  'inventory',
  'privacy',
  'terms',
  'shipping',
  'refunds',
  'accessibility',
  'peptide-dosing-safety',
  'how-to-get-started',
] as const;

export type ContentPage = (typeof VALID_CONTENT_PAGES)[number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasKeys(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return keys.every((key) => key in value);
}

function validateHero(value: unknown): boolean {
  return hasKeys(value, ['sectionLabel', 'heading', 'subtitle']);
}

const PAGE_REQUIRED_KEYS: Record<ContentPage, readonly string[]> = {
  home: ['trustBar', 'threeSteps', 'usaResearch', 'whyDifferent', 'freeShipping', 'finalCta', 'complianceNotice'],
  'hero-slider': ['duration', 'slides'],
  peptides: ['hero', 'customBadge', 'starterPackages', 'protocols'],
  'how-it-works': ['hero', 'intro', 'educationalFocus', 'createAccount', 'afterVerification', 'solutionFeatures', 'relevanceStats', 'steps'],
  'our-company': ['hero', 'structure', 'clinicalContext', 'principles', 'cta'],
  coa: ['hero', 'qualityBadges', 'gridHeading', 'filterLabel', 'sortLabel', 'records', 'footerText'],
  contact: ['hero', 'sidebar', 'form', 'successMessage'],
  footer: ['brandDescription', 'trustBadges', 'quickLinks', 'legalLinks', 'contactItems', 'disclaimer', 'copyright', 'bottomLinks'],
  inventory: ['lastUpdated', 'inventory'],
  privacy: ['hero', 'intro', 'sections'],
  terms: ['hero', 'intro', 'sections'],
  shipping: ['hero', 'sections'],
  refunds: ['hero', 'intro', 'sections'],
  accessibility: ['hero', 'intro', 'sections'],
  'peptide-dosing-safety': ['hero', 'overview', 'safetyPrinciples', 'reconstitutionSteps', 'conversionRule', 'peptides', 'disclaimer'],
  'how-to-get-started': ['hero', 'intro', 'steps', 'resources', 'support'],
};

export function validateContentShape(page: string, data: unknown): void {
  if (!VALID_CONTENT_PAGES.includes(page as ContentPage)) {
    throw new Error(`Invalid content page "${page}".`);
  }

  const typedPage = page as ContentPage;
  const requiredKeys = PAGE_REQUIRED_KEYS[typedPage];

  if (!hasKeys(data, requiredKeys)) {
    throw new Error(
      `Invalid content shape for "${page}". Required keys: ${requiredKeys.join(', ')}.`
    );
  }

  if ('hero' in data && !validateHero(data.hero)) {
    throw new Error(`Invalid hero shape for "${page}". Expected sectionLabel, heading, subtitle.`);
  }
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterContactItem {
  label: string;
  value: string;
  sub: string;
  href: string | null;
}

export interface FooterContent {
  brandDescription: string;
  trustBadges: string[];
  quickLinks: FooterLink[];
  legalLinks: FooterLink[];
  contactItems: FooterContactItem[];
  disclaimer: string;
  copyright: string;
  bottomLinks: FooterLink[];
}

export interface HeroSlide {
  video: string;
  image: string;
  tag: string;
  heading: string;
  subtitle: string;
  description: string;
}

export interface HeroSliderContent {
  duration: number;
  slides: HeroSlide[];
}

export interface HomeContent {
  trustBar: { icon: string; text: string }[];
  threeSteps: {
    sectionLabel: string;
    heading: string;
    subtitle: string;
    steps: {
      step: string;
      title: string;
      desc: string;
      ctaLabel: string;
      ctaHref: string;
    }[];
  };
  usaResearch: {
    sectionLabel: string;
    heading: string;
    tagline: string;
    description: string;
    bulletPoints: string[];
    ctaLabel: string;
    ctaHref: string;
    image: string;
    imageAlt: string;
    badgeStat: string;
    badgeLabel: string;
    compoundPills: string[];
  };
  whyDifferent: {
    sectionLabel: string;
    heading: string;
    subtitle: string;
    features: { title: string; desc: string; stat: string }[];
  };
  freeShipping: {
    badgeLabel: string;
    heading: string;
    headingHighlight: string;
    description: string;
    metrics: { value: string; label: string; sub: string }[];
    featureCards: { title: string; sub: string }[];
    complianceCard: { title: string; desc: string };
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  finalCta: {
    badgeLabel: string;
    heading: string;
    headingHighlight: string;
    description: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  complianceNotice: {
    heading: string;
    text: string;
  };
}

export interface PeptidesContent {
  hero: HeroSection;
  customBadge: string;
  starterPackages: {
    name: string;
    price: string;
    wholesale: string;
    retail: string;
    tier: string;
    desc: string;
    focus: string;
    detail: string;
    bonus: string;
    highlight: boolean;
  }[];
  protocols: {
    heading: string;
    subtitle: string;
    items: {
      name: string;
      tags: string[];
      image?: string;
      peptides?: string[];
      description?: string;
    }[];
  };
}

export interface ShippingSection {
  type: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  extra?: string;
  columns?: string[];
  rows?: string[][];
}

export interface ShippingPageContent {
  hero: HeroSection;
  sections: ShippingSection[];
}

export interface PolicySection {
  title: string;
  text?: string;
  items?: string[];
  extra?: string;
}

export interface PolicyPageContent {
  hero: HeroSection;
  intro: string;
  effectiveDate?: string;
  sections: PolicySection[];
}

export interface ContactPageContent {
  hero: HeroSection;
  sidebar: {
    sectionLabel: string;
    heading: string;
    description: string;
    contactItems: { title: string; detail: string; sub: string }[];
    accessNote: string;
  };
  form: {
    heading: string;
    submitLabel: string;
    disclaimer: string;
    credentialOptions: string[];
    subjectOptions: string[];
  };
  successMessage: {
    heading: string;
    text: string;
  };
}

export interface CoaContent {
  hero: HeroSection;
  qualityBadges: { label: string; value: string }[];
  gridHeading: string;
  filterLabel: string;
  sortLabel: string;
  records: {
    compound: string;
    peptide: string;
    lab: string;
    purity: string;
    batch: string;
    date: string;
    pdf: string;
  }[];
  summaryChart?: {
    compound: string;
    lab?: string;
    date: string;
    purity: number;
  }[];
  footerText: string;
}

export interface OurCompanyPageContent {
  hero: HeroSection;
  structure: {
    sectionLabel: string;
    heading: string;
    description: string;
    researchEntity: {
      title: string;
      description: string;
      items: string[];
    };
    peptidePure: {
      title: string;
      description: string;
      items: string[];
    };
  };
  clinicalContext: {
    heading: string;
    intro: string;
    problems: string[];
    solution: string;
    conclusion: string;
  };
  principles: {
    sectionLabel: string;
    heading: string;
    items: { icon: string; title: string; desc: string }[];
  };
  cta: {
    heading: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
}

export interface HowItWorksContent {
  hero: HeroSection;
  intro: {
    sectionLabel: string;
    heading: string;
    paragraphs: string[];
    videoUrl: string;
    videoTitle: string;
  };
  educationalFocus: {
    heading: string;
    items: string[];
  };
  createAccount: {
    heading: string;
    description: string;
  };
  afterVerification: {
    heading: string;
    items: string[];
  };
  solutionFeatures: { title: string; desc: string }[];
  relevanceStats: {
    sectionLabel: string;
    items: { stat: string; label: string; desc: string }[];
  };
  steps: {
    heading: string;
    subtitle: string;
    items: { step: string; icon: string; title: string; desc: string }[];
  };
}

export interface HowToGetStartedContent {
  hero: HeroSection;
  intro: string;
  steps: {
    number: string;
    title: string;
    text: string;
    items: string[];
  }[];
  resources: {
    heading: string;
    items: {
      title: string;
      description: string;
      href: string;
      label: string;
    }[];
  };
  support: {
    heading: string;
    text: string;
    contacts: {
      name: string;
      role: string;
      email: string;
    }[];
  };
}

export interface PeptideDosingContent {
  hero: HeroSection;
  overview: {
    heading: string;
    body: string;
  };
  safetyPrinciples: {
    heading: string;
    items: string[];
  };
  reconstitutionSteps: {
    heading: string;
    steps: {
      num: string;
      title: string;
      desc: string;
    }[];
  };
  conversionRule: {
    heading: string;
    body: string;
    formula: string;
  };
  peptides: {
    name: string;
    category: string;
    categoryColor: string;
    vial: string;
    diluent: string;
    concentration: string;
    startingDose: string;
    startingUnits: string;
    notes: string;
    storage: string;
  }[];
  disclaimer: {
    heading: string;
    body: string;
  };
}
