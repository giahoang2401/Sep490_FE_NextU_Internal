"use client"

import React from "react"
import { 
  MessageSquare, 
  Bell, 
  Users, 
  Wrench,
  Home,
  Lightbulb,
  ArrowRight
} from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User as UserType } from "../types"

const navigation: NavigationItem[] = [
  { name: "NextLiving", href: "/staff-services", icon: Home, current: true },
  { name: "Manage Feedback", href: "/staff-services/feedback", icon: MessageSquare },
  { name: "Operation Request", href: "/staff-services/operations", icon: Wrench },
  { name: "Notifications", href: "/staff-services/notifications", icon: Bell },
]

const mockUser: UserType = {
  id: "5",
  name: "Carlos Martinez", 
  email: "carlos@nextu.com",
  role: "Staff_Services",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

export default function StaffServicesDashboard() {
  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Services Staff" />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Staff Services Management" />
        
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Staff Services</h1>
            <p className="text-gray-600">Manage feedback, operations, and resident notifications</p>
          </div>

          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">Total Feedbacks</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wrench className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-600">Operation Requests</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">25</div>
                  <div className="text-sm text-gray-600">Notifications Sent</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">156</div>
                  <div className="text-sm text-gray-600">Active Residents</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Feedback Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-10 w-10 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Feedback</h3>
                  <p className="text-sm text-gray-600">Respond to resident feedback</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending responses:</span>
                  <span className="font-medium text-orange-600">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed today:</span>
                  <span className="font-medium text-green-600">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average rating:</span>
                  <span className="font-medium text-blue-600">4.2/5</span>
                </div>
              </div>
              
              <a
                href="/staff-services/feedback"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm font-medium"
              >
                Manage Feedback
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </div>

            {/* 2. Operation Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <Wrench className="h-10 w-10 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Operation Request</h3>
                  <p className="text-sm text-gray-600">Create and track operations</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active requests:</span>
                  <span className="font-medium text-blue-600">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed today:</span>
                  <span className="font-medium text-green-600">4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">High priority:</span>
                  <span className="font-medium text-red-600">1</span>
                </div>
              </div>
              
              <a
                href="/staff-services/operations"
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center text-sm font-medium"
              >
                Create Request
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </div>

            {/* 3. Resident Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <Bell className="h-10 w-10 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">Send notifications to residents</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sent this week:</span>
                  <span className="font-medium text-purple-600">15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Scheduled:</span>
                  <span className="font-medium text-blue-600">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Read rate:</span>
                  <span className="font-medium text-green-600">87%</span>
                </div>
              </div>
              
              <a
                href="/staff-services/notifications"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center text-sm font-medium"
              >
                Create Notification
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New feedback received</p>
                    <p className="text-xs text-gray-600">From Nguyễn Minh Hoàng - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-green-50 rounded-lg">
                  <Wrench className="h-5 w-5 text-green-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Operation request completed</p>
                    <p className="text-xs text-gray-600">AC maintenance by Nguyễn Văn Tùng - 1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                  <Bell className="h-5 w-5 text-purple-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Notification sent</p>
                    <p className="text-xs text-gray-600">Water maintenance notice to 156 residents - 3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RoleLayout>
  )
}