"use client"

import { usePathname } from "next/navigation"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import RoleLayout from "../shared/roleLayout"
import { getNavigationForRole } from "../navigation"
import type { User } from "../types"

interface RoleBasedLayoutProps {
  children: React.ReactNode
  role: keyof typeof import("../navigation").roleNavigations
  user: User
  title: string
}

export default function RoleBasedLayout({ children, role, user, title }: RoleBasedLayoutProps) {
  const pathname = usePathname()
  const navigation = getNavigationForRole(role, pathname)
  
  // Map role key to display name
  const roleDisplayNames = {
    super_admin: "Super Admin",
    admin: "Admin",
    manager: "Manager", 
    staff_onboarding: "Staff Onboarding",
    staff_service: "Staff Services",
    staff_content: "Content Staff"
  }

  return (
    <RoleLayout>
      <Sidebar 
        navigation={navigation} 
        title="Next U" 
        userRole={roleDisplayNames[role]} 
      />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={user} title={title} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </RoleLayout>
  )
} 