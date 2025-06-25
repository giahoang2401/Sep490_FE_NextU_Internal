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
  availableLocations: Location[]
  onSubmit: (data: CreateAccountData) => void
  onCancel: () => void
}

export interface ProfileInfo {
  phone: string;
  gender: string;
  dob: string;
  locationId: string;
  note: string;
  department: string;
  level: string;
}

export interface CreateAccountData {
  name: string;
  email: string;
  password: string;
  role: string;
  location: string;
  profileInfo?: ProfileInfo;
}

export interface Location {
  id: string
  name: string
  description: string
}
export interface CreateAdminPayload {
  userName: string
  email: string
  password: string
  locationId: string
  skipEmailVerification?: boolean
}
