"use client"

import React, { useState, useEffect } from "react"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Eye,
  AlertCircle,
  TrendingUp,
  Users
} from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import RoleLayout from "../shared/roleLayout"
import DashboardCard from "../shared/dashboardCard"
import DataTable from "../shared/dataTable"
import { getNavigationForRole } from "../navigation"
import type { User, TableColumn } from "../types"

// Mock data interfaces
interface PendingEvent {
  id: string
  code: string
  title: string
  description: string
  categoryName: string
  levelName: string
  submittedBy: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  schedules: {
    startDate: string
    endDate: string
    repeatPattern?: string
  }[]
  ticketTypes: {
    name: string
    price: number
    totalQuantity: number
  }[]
  addOns: {
    name: string
    description: string
    price: number
  }[]
  locations: {
    name: string
    address: string
    description?: string
  }[]
  totalRevenue?: number
  expectedAttendees?: number
}

interface EventApprovalStats {
  totalPending: number
  totalApproved: number
  totalRejected: number
  totalRevenue: number
}

// Mock data
const mockPendingEvents: PendingEvent[] = [
  {
    id: "1",
    code: "EVT-2024-001",
    title: "Tech Workshop: React Advanced",
    description: "Advanced React workshop covering hooks, context, and performance optimization",
    categoryName: "Technology",
    levelName: "Advanced",
    submittedBy: "Sarah Johnson",
    submittedAt: "2024-01-15T10:30:00Z",
    status: "pending",
    schedules: [
      {
        startDate: "2024-02-15T09:00:00Z",
        endDate: "2024-02-15T17:00:00Z",
        repeatPattern: "none"
      }
    ],
    ticketTypes: [
      { name: "Early Bird", price: 150, totalQuantity: 50 },
      { name: "Regular", price: 200, totalQuantity: 100 },
      { name: "VIP", price: 350, totalQuantity: 20 }
    ],
    addOns: [
      { name: "Workshop Materials", description: "Printed materials and resources", price: 25 },
      { name: "Lunch Package", description: "Catered lunch during workshop", price: 35 }
    ],
    locations: [
      {
        name: "Tech Hub Conference Center",
        address: "123 Innovation Street, San Francisco, CA",
        description: "Modern conference center with state-of-the-art facilities"
      }
    ],
    totalRevenue: 28500,
    expectedAttendees: 170
  },
  {
    id: "2",
    code: "EVT-2024-002",
    title: "Wellness Retreat: Mind & Body",
    description: "A comprehensive wellness retreat focusing on mental and physical health",
    categoryName: "Wellness",
    levelName: "Beginner",
    submittedBy: "Michael Chen",
    submittedAt: "2024-01-14T14:20:00Z",
    status: "pending",
    schedules: [
      {
        startDate: "2024-03-10T08:00:00Z",
        endDate: "2024-03-12T18:00:00Z",
        repeatPattern: "none"
      }
    ],
    ticketTypes: [
      { name: "Standard Package", price: 450, totalQuantity: 80 },
      { name: "Premium Package", price: 650, totalQuantity: 40 }
    ],
    addOns: [
      { name: "Spa Treatment", description: "Relaxing spa session", price: 120 },
      { name: "Nutrition Consultation", description: "Personal nutrition planning", price: 80 }
    ],
    locations: [
      {
        name: "Serenity Resort",
        address: "456 Peaceful Valley Road, Napa, CA",
        description: "Luxurious resort with wellness facilities"
      }
    ],
    totalRevenue: 52000,
    expectedAttendees: 120
  },
  {
    id: "3",
    code: "EVT-2024-003",
    title: "Business Networking Mixer",
    description: "Networking event for professionals and entrepreneurs",
    categoryName: "Business",
    levelName: "Intermediate",
    submittedBy: "Emily Rodriguez",
    submittedAt: "2024-01-13T09:15:00Z",
    status: "approved",
    schedules: [
      {
        startDate: "2024-02-20T18:00:00Z",
        endDate: "2024-02-20T22:00:00Z",
        repeatPattern: "monthly"
      }
    ],
    ticketTypes: [
      { name: "General Admission", price: 75, totalQuantity: 200 },
      { name: "VIP Access", price: 150, totalQuantity: 50 }
    ],
    addOns: [
      { name: "Premium Drinks", description: "Open bar with premium selections", price: 50 },
      { name: "Business Card Printing", description: "Professional business cards", price: 25 }
    ],
    locations: [
      {
        name: "Downtown Business Center",
        address: "789 Commerce Avenue, San Francisco, CA",
        description: "Elegant venue in the heart of downtown"
      }
    ],
    totalRevenue: 22500,
    expectedAttendees: 250
  },
  {
    id: "4",
    code: "EVT-2024-004",
    title: "Creative Writing Workshop",
    description: "Interactive workshop for aspiring writers",
    categoryName: "Education",
    levelName: "Beginner",
    submittedBy: "David Kim",
    submittedAt: "2024-01-12T16:45:00Z",
    status: "rejected",
    schedules: [
      {
        startDate: "2024-02-25T10:00:00Z",
        endDate: "2024-02-25T16:00:00Z",
        repeatPattern: "none"
      }
    ],
    ticketTypes: [
      { name: "Workshop Only", price: 120, totalQuantity: 60 },
      { name: "Workshop + Materials", price: 150, totalQuantity: 40 }
    ],
    addOns: [
      { name: "Writing Portfolio Review", description: "Personal feedback on writing samples", price: 75 }
    ],
    locations: [
      {
        name: "Community Learning Center",
        address: "321 Education Street, Oakland, CA",
        description: "Cozy learning environment with writing facilities"
      }
    ],
    totalRevenue: 12000,
    expectedAttendees: 100
  }
]

function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white pb-4 border-b border-gray-100 flex items-center justify-between p-6">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-3xl font-light" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

const mockUser: User = {
  id: "2",
  name: "Jane Smith",
  email: "jane@nextu.com",
  role: "Admin",
  location: "San Francisco, CA",
  region: "West Coast",
  avatar: "/placeholder.svg?height=32&width=32",
}

export default function EventApprovalDashboard() {
  const [events, setEvents] = useState<PendingEvent[]>(mockPendingEvents)
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [toast, setToast] = useState("")

  // Get navigation for admin role
  const navigation = getNavigationForRole("admin", "/admin/event-approval")

  // Calculate stats
  const stats: EventApprovalStats = {
    totalPending: events.filter(e => e.status === "pending").length,
    totalApproved: events.filter(e => e.status === "approved").length,
    totalRejected: events.filter(e => e.status === "rejected").length,
    totalRevenue: events.reduce((sum, e) => sum + (e.totalRevenue || 0), 0)
  }

  const handleViewDetails = (event: PendingEvent) => {
    setSelectedEvent(event)
    setShowDetailModal(true)
  }

  const handleApprove = (event: PendingEvent) => {
    setSelectedEvent(event)
    setApprovalAction("approve")
    setShowApprovalModal(true)
  }

  const handleReject = (event: PendingEvent) => {
    setSelectedEvent(event)
    setApprovalAction("reject")
    setRejectionReason("")
    setShowApprovalModal(true)
  }

  const handleApprovalSubmit = () => {
    if (!selectedEvent) return

    const updatedEvents = events.map(event => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          status: approvalAction === "approve" ? "approved" : "rejected" as "pending" | "approved" | "rejected"
        }
      }
      return event
    })

    setEvents(updatedEvents)
    setShowApprovalModal(false)
    setSelectedEvent(null)
    setApprovalAction(null)
    setRejectionReason("")
    
    const action = approvalAction === "approve" ? "approved" : "rejected"
    setToast(`Event ${action} successfully!`)
    setTimeout(() => setToast(""), 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
      case "approved":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Unknown</span>
    }
  }

  const renderActions = (row: any) => {
    const event = events.find(e => e.id === row.id)
    if (!event) return null

    return (
      <div className="flex flex-wrap gap-1">
        <button 
          onClick={() => handleViewDetails(event)}
          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 flex items-center gap-1 whitespace-nowrap"
        >
          <Eye className="h-3 w-3" />
          <span className="hidden sm:inline">View</span>
        </button>
        {event.status === "pending" && (
          <>
            <button 
              onClick={() => handleApprove(event)}
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full hover:bg-green-200 flex items-center gap-1 whitespace-nowrap"
            >
              <CheckCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Approve</span>
            </button>
            <button 
              onClick={() => handleReject(event)}
              className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full hover:bg-red-200 flex items-center gap-1 whitespace-nowrap"
            >
              <XCircle className="h-3 w-3" />
              <span className="hidden sm:inline">Reject</span>
            </button>
          </>
        )}
      </div>
    )
  }

  const eventColumns: TableColumn[] = [
    { key: "code", label: "Code", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "categoryName", label: "Category", sortable: true },
    { key: "submittedBy", label: "By", sortable: true },
    { key: "submittedAt", label: "Date", sortable: true },
    { key: "status", label: "Status" },
    { key: "totalRevenue", label: "Revenue" },
  ]

  const eventRows = events.map(event => ({
    ...event,
    submittedAt: formatDate(event.submittedAt),
    totalRevenue: event.totalRevenue ? `$${event.totalRevenue.toLocaleString()}` : "-",
    status: getStatusBadge(event.status)
  }))

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Regional Admin" />
      
      <div className="lg:pl-64 flex flex-col flex-1 bg-gray-50 min-h-screen">
        <TopNav user={mockUser} title="Event Approval Management" />
        
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-y-auto">
          {/* Header Section */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Event Approval Management</h1>
            <p className="text-gray-600">Review and approve event submissions from staff content team</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <DashboardCard 
              title="Pending Events" 
              value={stats.totalPending} 
              change={`${stats.totalPending} awaiting review`}
              changeType="neutral"
              icon={AlertCircle} 
            />
            <DashboardCard 
              title="Approved Events" 
              value={stats.totalApproved} 
              change="Successfully approved"
              changeType="increase"
              icon={CheckCircle} 
            />
            <DashboardCard 
              title="Rejected Events" 
              value={stats.totalRejected} 
              change="Events rejected"
              changeType="decrease"
              icon={XCircle} 
            />
            <DashboardCard 
              title="Total Revenue" 
              value={`$${stats.totalRevenue.toLocaleString()}`} 
              change="Expected revenue"
              changeType="increase"
              icon={TrendingUp} 
            />
          </div>

          {/* Events Table */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Event Submissions</h3>
                  <p className="text-gray-600 text-sm mt-1">Review and manage event approval requests</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Filter by status:</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option value="all">All Events</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <DataTable columns={eventColumns} data={eventRows} actions={renderActions} />
              </div>
            </div>
          </div>

          {/* Event Detail Modal */}
          <Modal open={showDetailModal} title="Event Details" onClose={() => setShowDetailModal(false)}>
            {selectedEvent && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Event Code:</span> {selectedEvent.code}</div>
                      <div><span className="font-medium">Title:</span> {selectedEvent.title}</div>
                      <div><span className="font-medium">Category:</span> {selectedEvent.categoryName}</div>
                      <div><span className="font-medium">Level:</span> {selectedEvent.levelName}</div>
                      <div><span className="font-medium">Submitted By:</span> {selectedEvent.submittedBy}</div>
                      <div><span className="font-medium">Submitted Date:</span> {formatDate(selectedEvent.submittedAt)}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Financial Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Total Revenue:</span> ${selectedEvent.totalRevenue?.toLocaleString()}</div>
                      <div><span className="font-medium">Expected Attendees:</span> {selectedEvent.expectedAttendees}</div>
                      <div><span className="font-medium">Ticket Types:</span> {selectedEvent.ticketTypes.length}</div>
                      <div><span className="font-medium">Add-ons:</span> {selectedEvent.addOns.length}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 text-sm">{selectedEvent.description}</p>
                </div>

                {/* Schedules */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Event Schedule</h4>
                  <div className="space-y-2">
                    {selectedEvent.schedules.map((schedule, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div className="text-sm">
                          <div><span className="font-medium">Start:</span> {formatDate(schedule.startDate)} at {formatTime(schedule.startDate)}</div>
                          <div><span className="font-medium">End:</span> {formatDate(schedule.endDate)} at {formatTime(schedule.endDate)}</div>
                          {schedule.repeatPattern && schedule.repeatPattern !== "none" && (
                            <div><span className="font-medium">Repeat:</span> {schedule.repeatPattern}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Types */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ticket Types</h4>
                  <div className="space-y-2">
                    {selectedEvent.ticketTypes.map((ticket, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{ticket.name}</div>
                          <div className="text-sm text-gray-600">Quantity: {ticket.totalQuantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${ticket.price}</div>
                          <div className="text-sm text-gray-600">Total: ${(ticket.price * ticket.totalQuantity).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                {selectedEvent.addOns.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Add-ons</h4>
                    <div className="space-y-2">
                      {selectedEvent.addOns.map((addon, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{addon.name}</div>
                            <div className="text-sm text-gray-600">{addon.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${addon.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Locations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Event Locations</h4>
                  <div className="space-y-2">
                    {selectedEvent.locations.map((location, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-gray-600">{location.address}</div>
                        {location.description && (
                          <div className="text-sm text-gray-600 mt-1">{location.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedEvent.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        setShowDetailModal(false)
                        handleApprove(selectedEvent)
                      }}
                      className="flex-1 bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Event
                    </button>
                    <button 
                      onClick={() => {
                        setShowDetailModal(false)
                        handleReject(selectedEvent)
                      }}
                      className="flex-1 bg-red-600 text-white rounded-lg px-4 py-3 hover:bg-red-700 font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject Event
                    </button>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* Approval Modal */}
          <Modal 
            open={showApprovalModal} 
            title={approvalAction === "approve" ? "Approve Event" : "Reject Event"} 
            onClose={() => setShowApprovalModal(false)}
          >
            {selectedEvent && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    {approvalAction === "approve" ? (
                      <CheckCircle className="h-6 w-6 text-blue-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {approvalAction === "approve" ? "Approve" : "Reject"} Event: {selectedEvent.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {approvalAction === "approve" 
                          ? "This event will be approved and published to the platform."
                          : "Please provide a reason for rejecting this event."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {approvalAction === "reject" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please provide a detailed reason for rejecting this event..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-3 hover:bg-gray-200 font-medium transition-all duration-200" 
                    onClick={() => setShowApprovalModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className={`flex-1 text-white rounded-lg px-4 py-3 font-medium transition-all duration-200 shadow-md ${
                      approvalAction === "approve" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={handleApprovalSubmit}
                    disabled={approvalAction === "reject" && !rejectionReason.trim()}
                  >
                    {approvalAction === "approve" ? "Approve Event" : "Reject Event"}
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {/* Toast */}
          {toast && (
            <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-in slide-in-from-right-2 duration-300 flex items-center gap-3">
              <span className="text-lg">✓</span>
              <span>{toast}</span>
              <button 
                className="ml-4 text-white hover:text-gray-200 font-bold text-xl transition-colors duration-200" 
                onClick={() => setToast("")}
              >
                ×
              </button>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  )
} 