import type React from "react"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  location?: string
  region?: string
}

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
}

export interface DashboardCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "increase" | "decrease" | "neutral"
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
}

export interface TableRow {
  [key: string]: any
}

export interface CreateAccountFormProps {
  userType: "admin" | "staff" | "partner"
  availableRoles: string[]
  availableLocations: string[]
  onSubmit: (data: CreateAccountData) => void
  onCancel: () => void
}

export interface CreateAccountData {
  name: string
  email: string
  role: string
  location: string
  permissions?: string[]
}

export interface Location {
  id: string
  name: string
  region: string
  city: string
}
