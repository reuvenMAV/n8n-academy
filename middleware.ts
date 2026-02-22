// middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const acceptLang = request.headers.get('accept-language') ?? 'he'
  const locale = acceptLang.startsWith('en') ? 'en' : 'he'

  const response = NextResponse.next()
  response.headers.set('x-next-intl-locale', locale)
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
