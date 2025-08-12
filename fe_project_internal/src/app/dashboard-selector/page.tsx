"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileCheck, UserPlus, Wrench, Edit, Shield, Settings, LogOut } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  location?: string
}

const roles = [
  {
    name: "SuperAdmin",
    description: "Full system authority - Create Admin accounts for regions",
    href: "/super-admin",
    icon: Shield,
    color: "bg-red-500",
    permissions: ["Create Admin accounts", "Global system access", "Manage all users and partners"],
    roleKey: "SuperAdmin",
  },
  {
    name: "Admin",
    description: "Regional management - Create staff and partner accounts",
    href: "/internal/admin",
    icon: Settings,
    color: "bg-blue-500",
    permissions: ["Create staff accounts", "Create partner accounts", "Regional oversight"],
    roleKey: "Admin",
  },
  {
    name: "Manager",
    description: "Review packages, content, and events",
    href: "/internal/manager",
    icon: FileCheck,
    color: "bg-green-500",
    permissions: ["Approve/reject packages", "Review content", "Approve events"],
    roleKey: "Manager",
  },
  {
    name: "Staff - Membership",
    description: "Handle user onboarding and payments",
    href: "/internal/staff-membership",
    icon: UserPlus,
    color: "bg-purple-500",
    permissions: ["Process applications", "Send payment instructions", "Create packages"],
    roleKey: "Staff_Membership",
  },
  {
    name: "Staff - Services",
    description: "Manage NextLiving and NextAcademy services",
    href: "/internal/staff-services",
    icon: Wrench,
    color: "bg-orange-500",
    permissions: ["Manage service modules", "Propose activities", "Handle feedback"],
    roleKey: "Staff_Services",
  },
  {
    name: "Staff - Content",
    description: "Create and manage learning content",
    href: "/internal/staff-content",
    icon: Edit,
    color: "bg-indigo-500",
    permissions: ["Create content", "Submit for review", "Manage drafts"],
    roleKey: "Staff_Content",
  },
]

export default function DashboardSelector() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("nextu_internal_user")
    if (userData) {
      const user = JSON.parse(userData)

      // Only SuperAdmin should access this page
      if (user.role !== "SuperAdmin") {
        const roleRoutes = {
          Admin: "/internal/admin",
          Manager: "/internal/manager",
          Staff_Membership: "/internal/staff-membership",
          Staff_Services: "/internal/staff-services",
          Staff_Content: "/internal/staff-content",
        }

        const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes]
        if (redirectPath) {
          router.push(redirectPath)
          return
        }
      }

      setUser(user)
    } else {
      router.push("/internal/login")
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("nextu_internal_user")
    router.push("/internal/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with user info and logout */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                className="h-12 w-12 rounded-full"
                src={user.avatar || "/placeholder.svg?height=48&width=48"}
                alt={user.name}
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Welcome back, {user.name}</h2>
                <p className="text-sm text-gray-600">
                  {user.email} • {user.role}
                </p>
                {user.location && <p className="text-sm text-gray-500">{user.location}</p>}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SuperAdmin Dashboard Selection</h1>
          <p className="text-xl text-gray-600">Choose which dashboard to access</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role) => (
            <Link
              key={role.name}
              href={role.href}
              className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${role.color}`}>
                    {React.createElement(role.icon, { className: "h-6 w-6 text-white" })}
                  </div>
                  <h3 className="ml-4 text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {role.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">{role.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Permissions:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors">
                  <span className="text-sm font-medium">Access Dashboard</span>
                  <svg
                    className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Hierarchy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Account Creation Permissions</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-red-500 mr-2" />
                  <span>
                    <strong>SuperAdmin:</strong> Can create Admin accounts for regions
                  </span>
                </div>
                <div className="flex items-center">
                  <Settings className="h-4 w-4 text-blue-500 mr-2" />
                  <span>
                    <strong>Admin:</strong> Can create Staff and Partner accounts in their region
                  </span>
                </div>
                <div className="flex items-center">
                  <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                  <span>
                    <strong>Manager:</strong> Reviews and approves submissions
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-3">System Features</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Responsive design for all devices</p>
                <p>• Role-based access control</p>
                <p>• Account creation workflows</p>
                <p>• Review and approval systems</p>
                <p>• Real-time notifications</p>
                <p>• Comprehensive reporting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
