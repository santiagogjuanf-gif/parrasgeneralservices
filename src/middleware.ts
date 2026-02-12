import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminPath = process.env.ADMIN_PATH || '4831'

  // Rewrite admin routes: /4831/* -> /panel/*
  if (pathname.startsWith(`/${adminPath}`)) {
    const newPath = pathname.replace(`/${adminPath}`, '/panel') || '/panel'
    return NextResponse.rewrite(new URL(newPath, request.url))
  }

  // Block direct access to /panel
  if (pathname.startsWith('/panel')) {
    return NextResponse.redirect(new URL('/', request.url))
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
