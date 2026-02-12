import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminPath = process.env.ADMIN_PATH || '4831'

  // Skip i18n for admin routes
  if (pathname.startsWith(`/${adminPath}`)) {
    return NextResponse.next()
  }

  // Skip i18n for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/', '/(en|fr|es)/:path*', '/((?!_next|.*\\..*).*)'],
}
