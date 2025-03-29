import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import jwt from 'jsonwebtoken'

const intlMiddleware = createMiddleware({
  locales: ["en", "vi"],
  defaultLocale: "en",
})

// Các route cần xác thực
const privatePaths = ['/profile', '/dashboard', '/admin']
const authPaths = ['/login', '/register']

const SECRET_KEY = process.env.JWT_SECRET as string // Thay bằng secret thực tế

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value
  const { pathname } = req.nextUrl

  console.log("Token received:", token)

  // Kiểm tra nếu route có locale (VD: /en/profile, /vi/dashboard)
  const pathWithoutLocale = pathname.replace(/^\/(en|vi)/, '')

  // Kiểm tra tính hợp lệ của JWT
  let isAuthenticated = false
  if (token) {
    try {
      jwt.verify(token, SECRET_KEY)
      isAuthenticated = true
    } catch (error) {
      console.error("Invalid token:", error)
    }
  }

  // Nếu chưa đăng nhập và cố vào trang bảo mật -> Chuyển hướng về login
  if (privatePaths.some(path => pathWithoutLocale.startsWith(path)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Nếu đã đăng nhập mà vào /login hoặc /register -> Chuyển hướng về dashboard
  if (authPaths.includes(pathWithoutLocale) && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', req.url))
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
    '/login',
    '/register'
  ],
}
