"use client"

import { 
  Home, 
  Users, 
  Settings, 
  FileText, 
  Send, 
  Calendar, 
  CheckCircle, 
  Building, 
  UserPlus, 
  Package,
  MessageSquare,
  Bell,
  Wrench,
  Shield,
  BarChart3
} from "lucide-react"
import type { NavigationItem } from "../types"

// Navigation cho từng role
export const roleNavigations = {
  super_admin: [
    { name: "Dashboard", href: "/super-admin", icon: Home },
    { name: "User Management", href: "/super-admin/users", icon: Users },
    { name: "System Settings", href: "/super-admin/settings", icon: Settings },
    { name: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
  ],
  
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Room Management", href: "/admin/rooms", icon: Building },
    { name: "Event Approval", href: "/admin/event-approval", icon: Calendar },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Reports", href: "/admin/reports", icon: FileText },
  ],
  
  manager: [
    { name: "Dashboard", href: "/manager", icon: Home },
    { name: "Staff Management", href: "/manager/staff", icon: Users },
    { name: "Operations", href: "/manager/operations", icon: Wrench },
    { name: "Reports", href: "/manager/reports", icon: FileText },
  ],
  
  staff_onboarding: [
    { name: "Dashboard", href: "/staff-onboarding", icon: Home },
    { name: "New Staff", href: "/staff-onboarding/new", icon: UserPlus },
    { name: "Packages", href: "/staff-onboarding/packages", icon: Package },
    { name: "Progress Tracking", href: "/staff-onboarding/progress", icon: CheckCircle },
  ],
  
  staff_service: [
    { name: "Dashboard", href: "/staff-services", icon: Home },
    { name: "Feedback Management", href: "/staff-services/feedback", icon: MessageSquare },
    { name: "Notifications", href: "/staff-services/notifications", icon: Bell },
    { name: "Operations", href: "/staff-services/operations", icon: Wrench },
  ],
  
  staff_content: [
    { name: "Content Management", href: "/staff-content", icon: FileText },
    { name: "Content Review", href: "/staff-content/review", icon: Send },
    { name: "Event/Workshop Management", href: "/staff-content/events", icon: Calendar },
  ],
}

// Component Navigation chung
interface NavigationProps {
  role: keyof typeof roleNavigations
  currentPath?: string
}

export default function Navigation({ role, currentPath }: NavigationProps) {
  const navigation = roleNavigations[role] || []
  
  // Cập nhật current state dựa trên currentPath
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: currentPath === item.href
  }))
  
  return updatedNavigation
}

// Helper function để lấy navigation cho role cụ thể
export function getNavigationForRole(role: keyof typeof roleNavigations, currentPath?: string): NavigationItem[] {
  const navigation = roleNavigations[role] || []
  
  return navigation.map(item => ({
    ...item,
    current: currentPath === item.href
  }))
} 