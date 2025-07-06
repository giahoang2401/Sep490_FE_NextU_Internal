"use client"

import { Home, GraduationCap, Lightbulb, MessageSquare, Plus, Star, DoorOpen } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import DataTable from "../shared/dataTable"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User, TableColumn } from "../types"

const navigation: NavigationItem[] = [
  { name: "NextLiving", href: "/internal/staff-services", icon: Home, current: true },
  { name: "NextAcademy", href: "/internal/staff-services/academy", icon: GraduationCap },
  { name: "Propose Activities", href: "/internal/staff-services/activities", icon: Lightbulb },
  { name: "Member Feedback", href: "/internal/staff-services/feedback", icon: MessageSquare },
  { name: "Room Management", href: "/staff-services/room", icon: DoorOpen },
]

const mockUser: User = {
  id: "5",
  name: "Carlos Martinez",
  email: "carlos@nextu.com",
  role: "Staff_Services",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

const serviceColumns: TableColumn[] = [
  { key: "service", label: "Service", sortable: true },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "users", label: "Active Users", sortable: true },
  { key: "rating", label: "Rating", sortable: true },
]

const serviceData = [
  { service: "House Cleaning", category: "NextLiving", status: "Active", users: 245, rating: "4.8" },
  { service: "Maintenance Requests", category: "NextLiving", status: "Active", users: 189, rating: "4.6" },
  { service: "Coding Bootcamp", category: "NextAcademy", status: "Active", users: 156, rating: "4.9" },
  { service: "Language Exchange", category: "NextAcademy", status: "Maintenance", users: 98, rating: "4.7" },
  { service: "Meal Planning", category: "NextLiving", status: "Active", users: 203, rating: "4.5" },
]

const feedbackData = [
  { service: "House Cleaning", feedback: "Excellent service, very thorough!", rating: 5, user: "Alex R." },
  { service: "Coding Bootcamp", feedback: "Great instructor, learned a lot", rating: 5, user: "Maria G." },
  { service: "Maintenance", feedback: "Quick response time", rating: 4, user: "David K." },
  { service: "Meal Planning", feedback: "Helpful but could use more variety", rating: 4, user: "Sarah J." },
]

export default function StaffServicesDashboard() {
  const renderServiceActions = (row: any) => (
    <div className="flex space-x-2">
      <button className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200">Manage</button>
      <button className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full hover:bg-gray-200">Settings</button>
    </div>
  )

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Services Staff" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Service Management" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Service Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-500">NextLiving Services</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-500">NextAcademy Courses</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Lightbulb className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-sm text-gray-500">Pending Proposals</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">4.7</div>
                  <div className="text-sm text-gray-500">Avg Service Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Active Services</h3>
                  <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </button>
                </div>
                <DataTable columns={serviceColumns} data={serviceData} actions={renderServiceActions} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Propose New Activity</h3>
                <form className="space-y-4">
                  <input
                    type="text"
                    placeholder="Activity name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select Category</option>
                    <option>NextLiving</option>
                    <option>NextAcademy</option>
                    <option>Community</option>
                    <option>Wellness</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Estimated cost ($)"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                    Submit Proposal
                  </button>
                </form>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Feedback</h3>
                <div className="space-y-3">
                  {feedbackData.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4">
                      <div className="text-sm font-medium text-gray-900">{item.service}</div>
                      <div className="text-xs text-gray-600">"{item.feedback}"</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        {item.rating}/5 - {item.user}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">NextLiving Services</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">House Cleaning</div>
                    <div className="text-sm text-blue-700">245 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">Maintenance</div>
                    <div className="text-sm text-blue-700">189 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">Meal Planning</div>
                    <div className="text-sm text-blue-700">203 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">NextAcademy Courses</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">Coding Bootcamp</div>
                    <div className="text-sm text-green-700">156 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">Language Exchange</div>
                    <div className="text-sm text-green-700">98 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Maintenance</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">Financial Literacy</div>
                    <div className="text-sm text-green-700">134 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RoleLayout>
  )
}
