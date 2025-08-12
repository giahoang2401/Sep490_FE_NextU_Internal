// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// const roleDashboard = {
//   super_admin: '/super-admin',
//   admin: '/admin',
//   manager: '/manager',
//   staff_onboarding: '/staff-onboarding',
//   staff_service: '/staff-services',
//   staff_content: '/staff-content',
// }

// export function middleware(request: NextRequest) {
//   const userStr = request.cookies.get('nextu_internal_user')?.value
//   let user = null
//   try {
//     user = userStr ? JSON.parse(userStr) : null
//   } catch (e) {
//     const res = NextResponse.redirect(new URL('/login', request.url))
//     res.headers.set('x-middleware', 'root')
//     res.cookies.set('mw', 'root', { path: '/' })
//     return res
//   }

//   const path = request.nextUrl.pathname

//   // Nếu chưa đăng nhập
//   if (!user || !user.role) {
//     const res = NextResponse.redirect(new URL('/login', request.url))
//     res.headers.set('x-middleware', 'root')
//     res.cookies.set('mw', 'root', { path: '/' })
//     return res
//   }

//   // Nếu vào nhầm route, redirect về dashboard đúng role
//   const expectedPath = roleDashboard[user.role as keyof typeof roleDashboard]
//   if (expectedPath && !path.startsWith(expectedPath)) {
//     const res = NextResponse.redirect(new URL(expectedPath, request.url))
//     res.headers.set('x-middleware', 'root')
//     res.cookies.set('mw', 'root', { path: '/' })
//     return res
//   }

//   const res = NextResponse.next()
//   res.headers.set('x-middleware', 'root')
//   res.cookies.set('mw', 'root', { path: '/' })
//   return res
// }

// export const config = {
//   matcher: [
//     '/super-admin/:path*',
//     '/admin/:path*',
//     '/manager/:path*',
//     '/staff-onboarding/:path*',
//     '/staff-services/:path*',
//     '/staff-content/:path*',
//   ],
// } 