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



export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const userData = localStorage.getItem("nextu_internal_user")
    if (userData) {
      const user = JSON.parse(userData)
      const roleRoutes = {
        super_admin: "/super-admin",
        admin: "/admin",
        manager: "/manager",
        staff_membership: "/staff-membership",
        staff_services: "/staff-services",
        staff_content: "/staff-content",
      }
      const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes]
      if (redirectPath) {
        router.replace(redirectPath)
        return
      }
    }
    router.replace("/login")
  }, [router])
  return null
}
