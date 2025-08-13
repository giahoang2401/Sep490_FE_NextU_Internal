"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { jwtDecode } from "jwt-decode"
import api from "../utils/axiosConfig"
import { setCookie } from "cookies-next"

interface LoginCredentials {
  email: string
  password: string
}

interface CustomJwtPayload {
  email: string
  fullName?: string
  location?: string
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string
}

export default function LoginForm() {
  const router = useRouter()
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const params = new URLSearchParams()
      params.append("grant_type", "password")
      params.append("username", credentials.email)
      params.append("password", credentials.password)
      params.append("client_id", "nextu_internal")
      params.append("scope", "openid profile roles email offline_access")

      const { data } = await api.post("/api/auth/connect/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })

      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)
      localStorage.setItem("id_token", data.id_token)
      localStorage.setItem("token_expires_in", data.expires_in.toString())

      // Lưu thông tin user từ API response mới
      const userInfo = {
        name: data.full_name,
        email: data.email,
        role: data.role.toLowerCase(),
        location: data.property_id,
        user_id: data.user_id,
        property_name: data.propertyname_Locationname_CityName,
        permissions: data.permission || [],
        avatar: "/placeholder.svg?height=32&width=32",
      }
      localStorage.setItem("nextu_internal_user", JSON.stringify(userInfo))
      setCookie("nextu_internal_user", JSON.stringify(userInfo), { path: '/' })

      const roleKey = data.role.toLowerCase()
      console.log("🚀 Login Response - Role:", data.role, "| Role Key:", roleKey)
      
      const roleRoutes = {
        super_admin: "/super-admin",
        admin: "/admin", 
        manager: "/manager",
        staff_onboarding: "/staff-onboarding",
        staff_service: "/staff-services",
        staff_content: "/staff-content",
      }
      const redirectPath = roleRoutes[roleKey as keyof typeof roleRoutes] || "/"
      console.log("🎯 Redirect Path:", redirectPath)
      
      router.push(redirectPath)
    } catch (err: any) {
      setError(err.response?.data?.error_description || err.response?.data?.message || err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Next U Internal</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your internal dashboard</p>
        </div>

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
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
