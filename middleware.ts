import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Redirect legacy client access URLs.
 *
 * Old:
 * - /profile
 * - /profile/:code
 *
 * New:
 * - /portal
 * - /portal/:code
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname === '/profile') {
    return NextResponse.redirect(new URL(`/portal${search}`, request.url))
  }

  if (pathname.startsWith('/profile/')) {
    const rest = pathname.slice('/profile'.length) // includes leading '/'
    return NextResponse.redirect(new URL(`/portal${rest}${search}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*'],
}

