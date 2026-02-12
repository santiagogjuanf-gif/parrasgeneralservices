'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle } from 'lucide-react'

declare global {
  interface Window {
    turnstile: {
      render: (selector: string, options: Record<string, unknown>) => void
      reset: (selector: string) => void
    }
  }
}

interface FormData {
  name: string
  email: string
  phone: string
  companyName: string
  serviceType: string
  requestedDate: string
  contactTimePreference: string
  addressLine1: string
  addressLine2: string
  city: string
  province: string
  postalCode: string
  message: string
  consent: boolean
}

interface FormErrors {
  name?: string
  email?: string
  serviceType?: string
  addressLine1?: string
  city?: string
  province?: string
  postalCode?: string
  message?: string
  consent?: string
  contactTimePreference?: string
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  serviceType: '',
  requestedDate: '',
  contactTimePreference: 'ANYTIME',
  addressLine1: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  message: '',
  consent: false,
}

export default function ContactContent() {
  const t = useTranslations('contact')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.turnstile) {
        window.turnstile.render('#turnstile-widget', {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
          callback: (token: string) => setTurnstileToken(token),
        })
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) newErrors.name = t('form.required')
    if (!formData.email.trim()) {
      newErrors.email = t('form.required')
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('form.invalidEmail')
      }
    }
    if (!formData.serviceType) newErrors.serviceType = t('form.required')
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = t('form.required')
    if (!formData.city.trim()) newErrors.city = t('form.required')
    if (!formData.province.trim()) newErrors.province = t('form.required')
    if (!formData.postalCode.trim()) newErrors.postalCode = t('form.required')
    if (!formData.message.trim()) newErrors.message = t('form.required')
    if (!formData.contactTimePreference) newErrors.contactTimePreference = t('form.required')
    if (!formData.consent) newErrors.consent = t('form.required')

    return newErrors
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          turnstileToken,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Request failed')
      }

      setIsSuccess(true)
      setFormData(initialFormData)
    } catch {
      setSubmitError(t('form.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const serviceOptions = [
    { value: 'office', label: t('form.serviceOffice') },
    { value: 'janitorial', label: t('form.serviceJanitorial') },
    { value: 'disinfection', label: t('form.serviceDisinfection') },
    { value: 'floor', label: t('form.serviceFloor') },
    { value: 'carpet', label: t('form.serviceCarpet') },
    { value: 'post-construction', label: t('form.servicePostConstruction') },
    { value: 'retail', label: t('form.serviceRetail') },
    { value: 'other', label: t('form.serviceOther') },
  ]

  const contactTimeOptions = [
    { value: 'ANYTIME', label: t('form.anytime') },
    { value: 'AM', label: t('form.am') },
    { value: 'PM', label: t('form.pm') },
  ]

  const inputClassName = (fieldName: keyof FormErrors) =>
    `w-full border ${
      errors[fieldName] ? 'border-red-400' : 'border-[#E2E8F0]'
    } rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0B7A3B]/20 focus:border-[#0B7A3B] text-[#334155]`

  if (isSuccess) {
    return (
      <>
        {/* Hero */}
        <section className="bg-[#F6F8FA] py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0B7A3B] md:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="mt-4 text-lg text-[#334155]">{t('hero.subtitle')}</p>
          </div>
        </section>

        {/* Success card */}
        <section className="py-16">
          <div className="mx-auto max-w-2xl px-4">
            <div className="rounded-xl bg-[#E7F6ED] p-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-[#0B7A3B]" />
              <p className="mt-4 text-lg font-medium text-[#0B7A3B]">
                {t('form.success')}
              </p>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-[#F6F8FA] py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold text-[#0B7A3B] md:text-4xl">
            {t('hero.title')}
          </h1>
          <p className="mt-4 text-lg text-[#334155]">{t('hero.subtitle')}</p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-xl bg-white p-8 shadow-sm"
          >
            {submitError && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {submitError}
              </div>
            )}

            {/* Full Name */}
            <div className="mb-5">
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={inputClassName('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputClassName('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-5">
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('form.phoneHint')}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0B7A3B]/20 focus:border-[#0B7A3B] text-[#334155]"
              />
            </div>

            {/* Company Name */}
            <div className="mb-5">
              <label
                htmlFor="companyName"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.companyName')}
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder={t('form.companyNameHint')}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0B7A3B]/20 focus:border-[#0B7A3B] text-[#334155]"
              />
            </div>

            {/* Service Type */}
            <div className="mb-5">
              <label
                htmlFor="serviceType"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.serviceType')} <span className="text-red-500">*</span>
              </label>
              <select
                id="serviceType"
                name="serviceType"
                required
                value={formData.serviceType}
                onChange={handleChange}
                className={inputClassName('serviceType')}
              >
                <option value="">{t('form.serviceTypeSelect')}</option>
                {serviceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-sm text-red-500">{errors.serviceType}</p>
              )}
            </div>

            {/* Requested Service Date */}
            <div className="mb-5">
              <label
                htmlFor="requestedDate"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.requestedDate')}
              </label>
              <input
                type="date"
                id="requestedDate"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0B7A3B]/20 focus:border-[#0B7A3B] text-[#334155]"
              />
              <p className="mt-1 text-xs text-[#334155]/60">{t('form.requestedDateHint')}</p>
            </div>

            {/* Address Line 1 */}
            <div className="mb-5">
              <label
                htmlFor="addressLine1"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.addressLine1')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                required
                value={formData.addressLine1}
                onChange={handleChange}
                className={inputClassName('addressLine1')}
              />
              {errors.addressLine1 && (
                <p className="mt-1 text-sm text-red-500">{errors.addressLine1}</p>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="mb-5">
              <label
                htmlFor="addressLine2"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.addressLine2')}
              </label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0B7A3B]/20 focus:border-[#0B7A3B] text-[#334155]"
              />
            </div>

            {/* City / Province / Postal Code grid */}
            <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="mb-1 block text-sm font-medium text-[#334155]"
                >
                  {t('form.city')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClassName('city')}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              {/* Province */}
              <div>
                <label
                  htmlFor="province"
                  className="mb-1 block text-sm font-medium text-[#334155]"
                >
                  {t('form.province')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleChange}
                  className={inputClassName('province')}
                />
                {errors.province && (
                  <p className="mt-1 text-sm text-red-500">{errors.province}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-1 block text-sm font-medium text-[#334155]"
                >
                  {t('form.postalCode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleChange}
                  className={inputClassName('postalCode')}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                )}
              </div>
            </div>

            {/* Contact Time Preference */}
            <div className="mb-5">
              <label
                htmlFor="contactTimePreference"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.contactTime')} <span className="text-red-500">*</span>
              </label>
              <select
                id="contactTimePreference"
                name="contactTimePreference"
                required
                value={formData.contactTimePreference}
                onChange={handleChange}
                className={inputClassName('contactTimePreference')}
              >
                {contactTimeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.contactTimePreference && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.contactTimePreference}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="mb-5">
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-medium text-[#334155]"
              >
                {t('form.message')} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className={inputClassName('message')}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            {/* Consent */}
            <div className="mb-6">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-[#E2E8F0] text-[#0B7A3B] focus:ring-[#0B7A3B]/20"
                />
                <span className="text-sm text-[#334155]">
                  {t('form.consent')} <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.consent && (
                <p className="mt-1 text-sm text-red-500">{errors.consent}</p>
              )}
            </div>

            {/* Turnstile widget */}
            <div className="mb-6">
              <div id="turnstile-widget" />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-lg bg-[#0B7A3B] px-6 py-3 font-medium text-white transition-colors hover:bg-[#096832] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
