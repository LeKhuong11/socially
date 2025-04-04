import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "en",
})

// Các route cần xác thực
const privatePaths = ['/dashboard', '/admin', '/notifications']
const authPaths = ['/signin', '/signup',]

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value
  const { pathname } = req.nextUrl

  // Kiểm tra nếu route có locale (VD: /en/profile, /vi/dashboard)
  const pathWithoutLocale = pathname.replace(/^\/(en|vi)/, '')

  // Kiểm tra tính hợp lệ của JWT
  let isAuthenticated = false
  if (accessToken) {
    try {
      isAuthenticated = true
    } catch (error) {
      console.error("Invalid token:", error)
    }
  }

  // Nếu chưa đăng nhập và cố vào trang bảo mật -> Chuyển hướng về login
  if (privatePaths.some(path => pathWithoutLocale.startsWith(path)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/signin', req.url))
  }

  // Nếu đã đăng nhập mà vào /login hoặc /register -> Chuyển hướng về dashboard
  if (authPaths.includes(pathWithoutLocale) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return intlMiddleware(req) // Middleware xử lý đa ngôn ngữ
}

export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*).*)',  // Bỏ qua API, static files, _next
    '/:locale(en|vi)/:path*',  // Xử lý route có locale
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/signin',
    '/signup',
  ],
}
