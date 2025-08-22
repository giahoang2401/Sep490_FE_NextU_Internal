"use client"

import { usePathname } from "next/navigation"
import { getNavigationForRole } from "@/components/Internal/navigation"
import Sidebar from "@/components/Internal/shared/sidebar"

export default function StaffOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const navigation = getNavigationForRole("staff_onboarding", pathname)

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar navigation={navigation} title="Next U" userRole="Staff Onboarding" />
      <div className="lg:pl-64 flex flex-col flex-1">
        {children}
      </div>
    </div>
  )
}
