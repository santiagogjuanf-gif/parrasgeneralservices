/**
 * Central SEO configuration for Parras General Services.
 * Update this file to reflect the business location, contact, and services.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://parrasgeneral.com'

export const BUSINESS = {
  name: 'Parras General Services',
  legalName: 'Parras General Services',
  url: SITE_URL,
  logo: `${SITE_URL}/icons/icon-512.png`,
  phone: '+15193855713',
  phoneFormatted: '+1 (519) 385-5713',
  email: 'info@parrasgeneralservices.ca',
  founded: '2019',
  // ── Address ──────────────────────────────────────────────────────────────
  // TODO: Fill in the exact street address and postal code
  address: {
    streetAddress: '',        // e.g. "123 Main St"
    city: 'Ontario',          // e.g. "Burlington"
    province: 'ON',
    postalCode: '',           // e.g. "L7R 1A1"
    country: 'CA',
    countryName: 'Canada',
  },
  // ── Geo coordinates (optional but helpful for "near me") ─────────────────
  // TODO: Add real coordinates once address is confirmed
  geo: {
    latitude: 43.3255,
    longitude: -79.799,
  },
  // ── Business hours ────────────────────────────────────────────────────────
  openingHours: [
    'Mo-Fr 07:00-18:00',
    'Sa 08:00-14:00',
  ],
  // ── Services listed on Google ────────────────────────────────────────────
  services: [
    'Commercial Cleaning',
    'Office Cleaning',
    'Janitorial Services',
    'Disinfection Services',
    'Floor Care',
    'Carpet Cleaning',
    'Window Cleaning',
    'Power Washing',
    'Retail Cleaning',
  ],
  // ── Social profiles ───────────────────────────────────────────────────────
  social: [] as string[],  // e.g. ['https://www.facebook.com/parrasgeneral']
}

/** JSON-LD LocalBusiness schema — injected in <head> for Google */
export function buildLocalBusinessSchema(locale: string) {
  const addressParts = [
    BUSINESS.address.streetAddress,
    BUSINESS.address.city,
    BUSINESS.address.province,
  ].filter(Boolean).join(', ')

  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'CleaningService'],
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: `${BUSINESS.url}/${locale}`,
    logo: BUSINESS.logo,
    image: BUSINESS.logo,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    foundingDate: BUSINESS.founded,
    description:
      locale === 'es'
        ? 'Empresa profesional de limpieza comercial en Canadá. Limpieza de oficinas, desinfección, cuidado de pisos y más.'
        : locale === 'fr'
          ? 'Entreprise professionnelle de nettoyage commercial au Canada. Nettoyage de bureaux, désinfection, entretien des planchers et plus.'
          : 'Professional commercial cleaning company in Canada. Office cleaning, disinfection, floor care, and more.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.address.streetAddress || undefined,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.province,
      postalCode: BUSINESS.address.postalCode || undefined,
      addressCountry: BUSINESS.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BUSINESS.geo.latitude,
      longitude: BUSINESS.geo.longitude,
    },
    openingHoursSpecification: BUSINESS.openingHours.map((spec) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: spec.startsWith('Mo-Fr')
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        : ['Saturday'],
      opens: spec.split(' ')[1]?.split('-')[0],
      closes: spec.split(' ')[1]?.split('-')[1],
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'es' ? 'Servicios de Limpieza' : locale === 'fr' ? 'Services de Nettoyage' : 'Cleaning Services',
      itemListElement: BUSINESS.services.map((service, i) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service,
          position: i + 1,
        },
      })),
    },
    areaServed: {
      '@type': 'State',
      name: 'Ontario',
      containedInPlace: {
        '@type': 'Country',
        name: 'Canada',
      },
    },
    ...(BUSINESS.social.length > 0 && { sameAs: BUSINESS.social }),
    priceRange: '$$',
    currenciesAccepted: 'CAD',
    paymentAccepted: 'Cash, Credit Card, E-Transfer',
    inLanguage: [locale],
  }
}

/** Per-locale SEO copy */
export const SEO_COPY = {
  en: {
    title: 'Professional Commercial Cleaning Services in Ontario, Canada | Parras General Services',
    description:
      'Top-rated commercial cleaning company in Ontario, Canada. Office cleaning, disinfection, floor care, and janitorial services. Call +1 (519) 385-5713 for a free quote.',
    keywords: [
      'commercial cleaning Ontario',
      'office cleaning near me',
      'janitorial services Ontario',
      'cleaning company Canada',
      'disinfection services Ontario',
      'floor care company',
      'carpet cleaning commercial',
      'window cleaning Ontario',
      'cleaning service near me',
      'Parras General Services',
    ],
    ogImage: `${SITE_URL}/og-image-en.jpg`,
  },
  es: {
    title: 'Servicios Profesionales de Limpieza Comercial en Ontario, Canadá | Parras General Services',
    description:
      'Empresa de limpieza comercial en Ontario, Canadá. Limpieza de oficinas, desinfección, cuidado de pisos y más. Llame al +1 (519) 385-5713 para un presupuesto gratuito.',
    keywords: [
      'limpieza comercial Ontario',
      'empresa de limpieza cerca de mi',
      'servicio de limpieza Canadá',
      'limpieza de oficinas Ontario',
      'servicio de desinfección',
      'limpieza profesional Canadá',
      'empresa de limpieza Ontario',
      'Parras General Services',
    ],
    ogImage: `${SITE_URL}/og-image-es.jpg`,
  },
  fr: {
    title: 'Services de Nettoyage Commercial Professionnel en Ontario, Canada | Parras General Services',
    description:
      'Entreprise de nettoyage commercial en Ontario, Canada. Nettoyage de bureaux, désinfection, entretien des planchers. Appelez le +1 (519) 385-5713 pour un devis gratuit.',
    keywords: [
      'nettoyage commercial Ontario',
      'entreprise de nettoyage près de chez moi',
      'services de nettoyage Canada',
      'nettoyage de bureaux Ontario',
      'désinfection professionnelle',
      'Parras General Services',
    ],
    ogImage: `${SITE_URL}/og-image-fr.jpg`,
  },
} satisfies Record<string, { title: string; description: string; keywords: string[]; ogImage: string }>
