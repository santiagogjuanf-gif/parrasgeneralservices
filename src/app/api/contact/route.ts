import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Verify Turnstile if secret is configured
    if (process.env.TURNSTILE_SECRET_KEY) {
      const valid = await verifyTurnstile(body.turnstileToken || '')
      if (!valid) {
        return NextResponse.json(
          { error: 'CAPTCHA verification failed.' },
          { status: 400 }
        )
      }
    }

    const { name, email, phone, companyName, serviceType, requestedDate, contactTimePreference, addressLine1, addressLine2, city, province, postalCode, message } = body

    if (!name || !email || !serviceType || !addressLine1 || !city || !province || !postalCode || !message) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      )
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        companyName: companyName || null,
        serviceType,
        requestedDate: requestedDate || null,
        contactTimePreference: contactTimePreference || 'ANYTIME',
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        province,
        postalCode,
        message,
      },
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
