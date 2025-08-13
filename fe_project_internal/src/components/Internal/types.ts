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
  isLoading?: boolean
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
  locationId: string
  locationName: string
  cityId: string
  cityName: string
}

// New interfaces for location management
export interface City {
  id: string
  name: string
  description: string
}

export interface LocationDetail {
  id: string
  name: string
  description: string | null
  cityId: string
  cityName: string
}

export interface Property {
  id: string
  name: string
  description: string | null
  locationId: string
  locationName: string
  cityId: string
  cityName: string
}

export interface CreateCityData {
  name: string
  description: string
}

export interface CreateLocationData {
  cityId: string
  name: string
  description: string
}

export interface CreatePropertyData {
  locationId: string
  name: string
  description: string
}

export interface UpdateCityData {
  name: string
  description: string
}

export interface UpdateLocationData {
  cityId: string
  name: string
  description: string
}

export interface UpdatePropertyData {
  locationId: string
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

export interface Admin {
  accountId: string
  username: string
  email: string | null
  emailVerified: boolean
  isLocked: boolean
  loginAttempt: number
  refreshTokenExpiry: string | null
  createdAt: string
  phone: string | null
  gender: string | null
  dob: string | null
  address: string | null
  avatarUrl: string | null
  profileCreatedAt: string
  profileUpdatedAt: string | null
  roleKey: string
  roleName: string
  roleType: string
  locationId: string
  locationName: string
  cityId: string | null
  description: string | null
}
