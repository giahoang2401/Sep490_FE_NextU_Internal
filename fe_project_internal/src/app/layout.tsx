"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type React from "react"
import AdminLayout from "../components/Internal/layouts/AdminLayout"
import ManagerLayout from "../components/Internal/layouts/ManagerLayout"
import SuperAdminLayout from "../components/Internal/layouts/SuperAdminLayout"
import StaffMembershipLayout from "../components/Internal/layouts/StaffMembershipLayout"
import StaffServicesLayout from "../components/Internal/layouts/StaffServicesLayout"
import StaffContentLayout from "../components/Internal/layouts/StaffContentLayout"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  )
}
