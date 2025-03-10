import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "en",
})

const isProtectedRoute = createRouteMatcher(['dashboard/(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()

  return intlMiddleware(req)
})

export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*).*)',
    // Áp dụng cho các đường dẫn quốc tế hóa
    '/:locale(en|vi)/:path*'
  ],
}