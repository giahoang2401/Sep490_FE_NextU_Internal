"use client"

import { UserPlus, CreditCard, Users, Package, Calendar, Mail, CheckCircle } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import DashboardCard from "../shared/dashboardCard"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User } from "../types"

const navigation: NavigationItem[] = [
  { name: "Applications", href: "/internal/staff-membership", icon: UserPlus, current: true },
  { name: "Payment Guide", href: "/internal/staff-membership/payments", icon: CreditCard },
  { name: "User Status", href: "/internal/staff-membership/status", icon: Users },
  { name: "Create Packages", href: "/internal/staff-membership/packages", icon: Package },
  { name: "Schedule Events", href: "/internal/staff-membership/events", icon: Calendar },
]

const mockUser: User = {
  id: "4",
  name: "Emily Chen",
  email: "emily@nextu.com",
  role: "Staff_Membership",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

const pendingApplications = [
  { id: 1, name: "Alex Rodriguez", email: "alex@email.com", package: "Premium", applied: "2 hours ago" },
  { id: 2, name: "Maria Garcia", email: "maria@email.com", package: "Standard", applied: "4 hours ago" },
  { id: 3, name: "David Kim", email: "david@email.com", package: "Student", applied: "6 hours ago" },
  { id: 4, name: "Sarah Johnson", email: "sarah@email.com", package: "Premium", applied: "1 day ago" },
]

export default function StaffMembershipDashboard() {
  const handleApprove = (applicationId: number) => {
    console.log("Approving application:", applicationId)
    // API call to approve application
  }

  const handleReject = (applicationId: number) => {
    console.log("Rejecting application:", applicationId)
    // API call to reject application
  }

  const handleSendPaymentEmail = (email: string, packageType: string) => {
    console.log("Sending payment email to:", email, "for package:", packageType)
    // API call to send payment instructions
  }

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Membership Staff" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Membership Management" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Membership Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard title="Pending Applications" value="23" change="+5" changeType="increase" icon={UserPlus} />
            <DashboardCard title="Payment Pending" value="12" change="-2" changeType="decrease" icon={CreditCard} />
            <DashboardCard title="Active Members" value="1,847" change="+18" changeType="increase" icon={Users} />
            <DashboardCard title="Events This Month" value="8" change="+3" changeType="increase" icon={Calendar} />
          </div>

          {/* Pending Applications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Applications</h3>
              <div className="space-y-4">
                {pendingApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-900">{application.name}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                        <div className="text-xs text-gray-400">Applied {application.applied}</div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {application.package}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(application.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(application.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleSendPaymentEmail(application.email, application.package)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                      >
                        <Mail className="h-4 w-4 inline mr-1" />
                        Send Payment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                  <div className="font-medium text-blue-900">Send Payment Reminder</div>
                  <div className="text-sm text-blue-700">Email payment instructions to pending users</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                  <div className="font-medium text-green-900">Upgrade User Status</div>
                  <div className="text-sm text-green-700">Promote user to premium membership</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                  <div className="font-medium text-purple-900">Schedule Onboarding</div>
                  <div className="text-sm text-purple-700">Book orientation session</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors">
                  <div className="font-medium text-orange-900">Create Package</div>
                  <div className="text-sm text-orange-700">Design new membership package</div>
                </button>
              </div>
            </div>
          </div>

          {/* Membership Tools */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Membership Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Send Payment Email</h4>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="User email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select Package</option>
                    <option>Student Package - $500</option>
                    <option>Standard Package - $800</option>
                    <option>Premium Package - $1200</option>
                    <option>Executive Package - $1800</option>
                  </select>
                  <textarea
                    placeholder="Additional message (optional)"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                    Send Payment Instructions
                  </button>
                </form>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Schedule Event</h4>
                <form className="space-y-3">
                  <input
                    type="text"
                    placeholder="Event name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max participants"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Event Type</option>
                    <option>Onboarding Session</option>
                    <option>Community Meeting</option>
                    <option>Welcome Event</option>
                    <option>Information Session</option>
                  </select>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                    Create Event
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Package Creation */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Package</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Package name"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Price ($)"
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Package Type</option>
                <option>Student</option>
                <option>Professional</option>
                <option>Premium</option>
                <option>Executive</option>
              </select>
              <textarea
                placeholder="Package description"
                className="md:col-span-2 lg:col-span-3 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button className="md:col-span-2 lg:col-span-3 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
                Submit Package for Review
              </button>
            </form>
          </div>
        </main>
      </div>
    </RoleLayout>
  )
}
