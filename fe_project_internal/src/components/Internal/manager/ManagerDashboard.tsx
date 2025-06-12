"use client"

import { Package, FileText, Calendar, Check, X, Filter } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import DataTable from "../shared/dataTable"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User, TableColumn } from "../types"

const navigation: NavigationItem[] = [
  { name: "Review Packages", href: "/internal/manager", icon: Package, current: true },
  { name: "Review Content", href: "/internal/manager/content", icon: FileText },
  { name: "Review Events", href: "/internal/manager/events", icon: Calendar },
]

const mockUser: User = {
  id: "3",
  name: "Mike Johnson",
  email: "mike@nextu.com",
  role: "Manager",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

const reviewColumns: TableColumn[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "submittedBy", label: "Submitted By", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "status", label: "Status" },
]

const reviewData = [
  {
    title: "Premium Living Package",
    type: "Package",
    submittedBy: "Emily Chen (Staff_Membership)",
    date: "2024-01-15",
    status: "Pending",
  },
  {
    title: "NextAcademy Coding Course",
    type: "Content",
    submittedBy: "Rachel Green (Staff_Content)",
    date: "2024-01-14",
    status: "Pending",
  },
  {
    title: "Community Yoga Session",
    type: "Event",
    submittedBy: "Carlos Martinez (Staff_Services)",
    date: "2024-01-13",
    status: "Under Review",
  },
  {
    title: "Student Starter Pack",
    type: "Package",
    submittedBy: "Emily Chen (Staff_Membership)",
    date: "2024-01-12",
    status: "Pending",
  },
]

export default function ManagerDashboard() {
  const renderActions = (row: any) => (
    <div className="flex space-x-2">
      <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
        <Check className="h-3 w-3 mr-1" />
        Approve
      </button>
      <button className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
        <X className="h-3 w-3 mr-1" />
        Reject
      </button>
      <button className="px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 hover:bg-gray-50">
        View
      </button>
    </div>
  )

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Manager" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Review Dashboard" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Review Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-500">Packages Pending</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-500">Content Reviews</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-sm text-gray-500">Event Proposals</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-emerald-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">47</div>
                  <div className="text-sm text-gray-500">Approved This Week</div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Review Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Packages must include clear pricing and service descriptions</li>
              <li>• Content should align with Next U brand guidelines and quality standards</li>
              <li>• Events must have proper safety measures and capacity limits</li>
              <li>• All submissions require approval before going live</li>
            </ul>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>All Types</option>
                <option>Packages</option>
                <option>Content</option>
                <option>Events</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>All Status</option>
                <option>Pending</option>
                <option>Under Review</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>All Submitters</option>
                <option>Staff_Membership</option>
                <option>Staff_Content</option>
                <option>Staff_Services</option>
                <option>Partners</option>
              </select>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="From date"
              />
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="To date"
              />
            </div>
          </div>

          {/* Review Queue */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Review Queue</h3>
              <p className="text-sm text-gray-500 mt-1">Items requiring your approval</p>
            </div>
            <DataTable columns={reviewColumns} data={reviewData} actions={renderActions} />
          </div>

          {/* Quick Review Actions */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Approve All Packages
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Review All Content
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                  Export Review Report
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review History</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Today: 12 items reviewed</div>
                  <div className="text-gray-500">8 approved, 3 rejected, 1 pending</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">This week: 47 items reviewed</div>
                  <div className="text-gray-500">35 approved, 8 rejected, 4 pending</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Average review time: 2.3 hours</div>
                  <div className="text-gray-500">Target: under 4 hours</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RoleLayout>
  )
}
