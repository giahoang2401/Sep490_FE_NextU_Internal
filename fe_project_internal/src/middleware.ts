// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userStr = request.cookies.get('nextu_internal_user')?.value
  const user = userStr ? JSON.parse(userStr) : null

  // Super admin chỉ được vào /internal/super-admin
  if (request.nextUrl.pathname.startsWith('/super-admin')) {
    if (!user || user.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  // Admin chỉ được vào /internal/admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  // Manager chỉ được vào /internal/manager
  if (request.nextUrl.pathname.startsWith('/manager')) {
    if (!user || user.role !== 'manager') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  // Staff_Membership chỉ được vào /internal/staff-membership
  if (request.nextUrl.pathname.startsWith('/staff-onboarding')) {
    if (!user || user.role !== 'staff_onboarding') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  // Staff_Services chỉ được vào /internal/staff-services
  if (request.nextUrl.pathname.startsWith('/staff-services')) {
    if (!user || user.role !== 'staff_service') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  // Staff_Content chỉ được vào /internal/staff-content
  if (request.nextUrl.pathname.startsWith('/staff-content')) {
    if (!user || user.role !== 'staff_Content') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
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