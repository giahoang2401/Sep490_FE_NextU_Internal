"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/internal/login") {
      setIsLoading(false)
      return
    }

    // Check if user is logged in
    const userData = localStorage.getItem("nextu_internal_user")
    if (!userData) {
      router.push("/internal/login")
    } else {
      setIsLoading(false)
    }
  }, [router, pathname])

  // Show loading spinner while checking auth
  if (isLoading && pathname !== "/internal/login") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <div className="min-h-screen bg-gray-100">{children}</div>
}
