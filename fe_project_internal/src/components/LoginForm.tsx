"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"

interface LoginCredentials {
  email: string
  password: string
}

// Mock user data cho demo
const mockUsers = [
  { email: "superadmin@nextu.com", password: "admin123", role: "SuperAdmin", name: "John Doe" },
  { email: "admin@nextu.com", password: "admin123", role: "Admin", name: "Jane Smith" },
  { email: "manager@nextu.com", password: "admin123", role: "Manager", name: "Mike Johnson" },
  { email: "membership@nextu.com", password: "admin123", role: "Staff_Membership", name: "Emily Chen" },
  { email: "services@nextu.com", password: "admin123", role: "Staff_Services", name: "Carlos Martinez" },
  { email: "content@nextu.com", password: "admin123", role: "Staff_Content", name: "Rachel Green" },
]

export default function LoginForm() {
  const router = useRouter()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check credentials
    const user = mockUsers.find((u) => u.email === credentials.email && u.password === credentials.password)

    if (user) {
      // Store user info in localStorage (in real app, use proper auth)
      localStorage.setItem(
        "nextu_internal_user",
        JSON.stringify({
          id: Math.random().toString(36).substr(2, 9),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: "/placeholder.svg?height=32&width=32",
          location: user.role === "Admin" ? "San Francisco, CA" : undefined,
        }),
      )

      // Direct redirect to role-specific dashboard
      const roleRoutes = {
        SuperAdmin: "/internal/superadmin",
        Admin: "/internal/admin",
        Manager: "/internal/manager",
        Staff_Membership: "/internal/staff-membership",
        Staff_Services: "/internal/staff-services",
        Staff_Content: "/internal/staff-content",
      }

      const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || "/internal"
      router.push(redirectPath)
    } else {
      setError("Invalid email or password")
    }

    setIsLoading(false)
  }

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }))
    if (error) setError("") // Clear error when user types
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Next U Internal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your internal dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={credentials.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
