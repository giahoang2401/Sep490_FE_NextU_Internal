import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const roleDashboard = {
  super_admin: '/super-admin',
  admin: '/admin',
  manager: '/manager',
  staff_membership: '/staff-membership',
  staff_services: '/staff-services',
  staff_content: '/staff-content',
}

export function middleware(request: NextRequest) {
  const userStr = request.cookies.get('nextu_internal_user')?.value
  let user = null
  try {
    user = userStr ? JSON.parse(userStr) : null
  } catch (e) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const path = request.nextUrl.pathname

  // Nếu chưa đăng nhập
  if (!user || !user.role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Nếu vào nhầm route, redirect về dashboard đúng role
  const expectedPath = roleDashboard[user.role]
  if (expectedPath && !path.startsWith(expectedPath)) {
    return NextResponse.redirect(new URL(expectedPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/staff-membership/:path*',
    '/staff-services/:path*',
    '/staff-content/:path*',
  ],
} 