"use client"

import type { User } from "../types"
import { Bell, Search, ChevronDown, Settings } from "lucide-react"

interface TopNavProps {
  user: User
  title: string
  onSettingsClick?: () => void
}

export default function TopNav({ user, title, onSettingsClick }: TopNavProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">{title}</h1>
          {user.location && <p className="text-sm text-gray-500 mt-1">Location: {user.location}</p>}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Settings */}
          {onSettingsClick && (
            <button onClick={onSettingsClick} className="p-2 text-gray-400 hover:text-gray-500">
              <Settings className="h-6 w-6" />
            </button>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
          </button>

          {/* User menu */}
          <div className="relative flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8 rounded-full"
                src={user.avatar || "/placeholder.svg?height=32&width=32"}
                alt={user.name}
              />
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
