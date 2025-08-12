// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userStr = request.cookies.get('nextu_internal_user')?.value
  const user = userStr ? JSON.parse(userStr) : null

  // Super admin chỉ được vào 
  if (request.nextUrl.pathname.startsWith('/super-admin')) {
    if (!user || user.role !== 'super_admin') {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.set('mw', 'src', { path: '/' })
      return res
    }
  }
  // Admin chỉ được vào 
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || user.role !== 'admin') {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.set('mw', 'src', { path: '/' })
      return res
    }
  }
  // Manager chỉ được vào 
  if (request.nextUrl.pathname.startsWith('/manager')) {
    if (!user || user.role !== 'manager') {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.set('mw', 'src', { path: '/' })
      return res
    }
  }
  // Staff_Membership chỉ được vào 
  if (request.nextUrl.pathname.startsWith('/staff-onboarding')) {
    if (!user || user.role !== 'staff_onboarding') {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.set('mw', 'src', { path: '/' })
      return res
    }
  }
  // Staff_Services chỉ được vào 
  if (request.nextUrl.pathname.startsWith('/staff-services')) {
    if (!user || user.role !== 'staff_service') {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.set('mw', 'src', { path: '/' })
      return res
    }
  }
  // Staff_Content chỉ được vào
  if (request.nextUrl.pathname.startsWith('/staff-content')) {
    if (!user || user.role !== 'staff_content') {
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.set('mw', 'src', { path: '/' })
      return res
    }
  }

  const res = NextResponse.next()
  res.cookies.set('mw', 'src', { path: '/' })
  return res
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/staff-onboarding/:path*',
    '/staff-services/:path*',
    '/staff-content/:path*',
  ],
}
