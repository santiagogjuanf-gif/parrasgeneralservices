export const LOCALES = ['en', 'fr', 'es'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || '4831'

export const SERVICE_TYPES = [
  'Office Cleaning',
  'Janitorial Services',
  'Disinfection Services',
  'Floor Care',
  'Carpet Cleaning',
  'Post-Construction Cleaning',
  'Retail & High-Traffic Cleaning',
  'Other',
] as const

export const PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Northwest Territories',
  'Nunavut',
  'Yukon',
] as const
