import type React from "react"

interface RoleLayoutProps {
  children: React.ReactNode
}

export default function RoleLayout({ children }: RoleLayoutProps) {
  return <div className="h-screen flex overflow-hidden bg-gray-100">{children}</div>
}
