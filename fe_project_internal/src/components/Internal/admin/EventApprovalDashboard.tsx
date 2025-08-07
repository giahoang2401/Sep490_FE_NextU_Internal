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
import api from "@/utils/setupAxios"

// API data interfaces
interface PendingEvent {
  id: string
  code: string
  title: string
  description: string
  categoryId: number
  levelId: number
  notes: string | null
  status: number // 0 = pending, 1 = approved
  rejectReason: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  schedules: any[]
  ticketTypes: any[]
  addOns: any[]
  locations: any[]
}

interface EventApprovalStats {
  totalPending: number
  totalApproved: number
  totalRejected: number
  totalRevenue: number
}

// Mock data for categories and levels (you can replace with real API calls later)
const mockCategories = {
  1: "Wellness",
  2: "Art", 
  3: "Technology",
  4: "Business",
  5: "Education",
  6: "Sports",
  7: "Music",
  8: "Food",
  9: "Travel",
  10: "Other"
}

const mockLevels = {
  1: "Beginner",
  2: "Intermediate", 
  3: "Advanced",
  4: "Expert",
  5: "All Levels"
}

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
  const [events, setEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [toast, setToast] = useState("")

  // Get navigation for admin role
  const navigation = getNavigationForRole("admin", "/admin/event-approval")

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/PendingEvent')
      
      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data)
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setToast("Error fetching events. Please try again.")
      setTimeout(() => setToast(""), 3000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  // Calculate stats
  const stats: EventApprovalStats = {
    totalPending: events.filter(e => e.status === 0).length,
    totalApproved: events.filter(e => e.status === 1).length,
    totalRejected: 0, // API doesn't have rejected status yet
    totalRevenue: 0 // API doesn't have revenue data yet
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

  const handleApprovalSubmit = async () => {
    if (!selectedEvent) return

    try {
      if (approvalAction === "approve") {
        // Call the approve API
        await api.post(`/api/PendingEvent/${selectedEvent.id}/approve`)
        
        // Update local state to reflect the change
        const updatedEvents = events.map(event => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              status: 1,
              reviewedBy: "current-user-id", // Replace with actual user ID
              reviewedAt: new Date().toISOString(),
              rejectReason: null
            }
          }
          return event
        })

        setEvents(updatedEvents)
        setToast("Event approved successfully!")
      } else {
        // For reject, we'll keep the local state update for now
        // You can add reject API call here when available
        const updatedEvents = events.map(event => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              status: 0, // Keep as pending for now
              rejectReason: rejectionReason
            }
          }
          return event
        })

        setEvents(updatedEvents)
        setToast("Event rejected successfully!")
      }

      setShowApprovalModal(false)
      setSelectedEvent(null)
      setApprovalAction(null)
      setRejectionReason("")
      setTimeout(() => setToast(""), 3000)
    } catch (error) {
      console.error('Error updating event:', error)
      setToast("Error updating event. Please try again.")
      setTimeout(() => setToast(""), 3000)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not reviewed"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
      case 1:
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>
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
        {event.status === 0 && (
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
    { key: "levelName", label: "Level", sortable: true },
    { key: "status", label: "Status" },
    { key: "reviewedAt", label: "Reviewed Date" },
  ]

  const eventRows = events.map(event => {
    return {
      ...event,
      categoryName: mockCategories[event.categoryId as keyof typeof mockCategories] || "Unknown",
      levelName: mockLevels[event.levelId as keyof typeof mockLevels] || "Unknown",
      reviewedAt: formatDate(event.reviewedAt),
      status: getStatusBadge(event.status)
    }
  })

  if (loading) {
    return (
      <RoleLayout>
        <Sidebar navigation={navigation} title="Next U" userRole="Regional Admin" />
        <div className="lg:pl-64 flex flex-col flex-1 bg-gray-50 min-h-screen">
          <TopNav user={mockUser} title="Event Approval Management" />
          <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading events...</div>
            </div>
          </main>
        </div>
      </RoleLayout>
    )
  }

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
                {eventRows.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No events found</p>
                    <p className="text-sm text-gray-400 mt-1">There are currently no events to display</p>
                  </div>
                ) : (
                  <DataTable columns={eventColumns} data={eventRows} actions={renderActions} />
                )}
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
                      <div><span className="font-medium">Category:</span> {mockCategories[selectedEvent.categoryId as keyof typeof mockCategories] || "Unknown"}</div>
                      <div><span className="font-medium">Level:</span> {mockLevels[selectedEvent.levelId as keyof typeof mockLevels] || "Unknown"}</div>
                      <div><span className="font-medium">Status:</span> {selectedEvent.status === 0 ? "Pending" : "Approved"}</div>
                      {selectedEvent.notes && (
                        <div><span className="font-medium">Notes:</span> {selectedEvent.notes}</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Review Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Reviewed By:</span> {selectedEvent.reviewedBy || "Not reviewed"}</div>
                      <div><span className="font-medium">Reviewed Date:</span> {formatDate(selectedEvent.reviewedAt)}</div>
                      {selectedEvent.rejectReason && (
                        <div><span className="font-medium">Rejection Reason:</span> {selectedEvent.rejectReason}</div>
                      )}
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
                  {selectedEvent.schedules.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEvent.schedules.map((schedule, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div className="text-sm">
                            <div>Schedule {index + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No schedules defined</p>
                  )}
                </div>

                {/* Ticket Types */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ticket Types</h4>
                  {selectedEvent.ticketTypes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEvent.ticketTypes.map((ticket, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">Ticket {index + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No ticket types defined</p>
                  )}
                </div>

                {/* Add-ons */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Add-ons</h4>
                  {selectedEvent.addOns.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEvent.addOns.map((addon, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">Add-on {index + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No add-ons defined</p>
                  )}
                </div>

                {/* Locations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Event Locations</h4>
                  {selectedEvent.locations.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEvent.locations.map((location, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">Location {index + 1}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No locations defined</p>
                  )}
                </div>

                {/* Action Buttons */}
                {selectedEvent.status === 0 && (
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