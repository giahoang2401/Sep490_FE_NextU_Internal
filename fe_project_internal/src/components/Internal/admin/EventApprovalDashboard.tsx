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
  notes: string | null  // JSON string của array requirements
  agenda: string | null // JSON string của timeline
  instructorName: string // JSON string của instructor info
  phoneNumber: string
  imageUrl: string
  categoryId: number
  categoryName: string
  levelId: number
  levelName: string
  status: number // 0 = pending, 1 = approved
  statusText: string
  scheduleMasters: ScheduleMaster[]
  addOns: AddOn[]
  locations: Location[]
}

interface ScheduleMaster {
  id: string
  startDate: string
  recurrenceEndDate: string
  duration: string
  recurrenceType: number
  repeatCount: number
  schedules: Schedule[]
}

interface Schedule {
  id: string
  startTime: string
  endTime: string
  ticketTypes: TicketType[]
}

interface TicketType {
  id: string
  name: string
  price: number
  totalQuantity: number
  maxPerUser: number
  isEarlyBird: boolean
  earlyBirdDeadline: string
  discountRateEarlyBird: number // Thay đổi tên field theo response mới
  discountRateCombo: number | null // Thêm field mới
}

interface AddOn {
  id: string
  name: string
  price: number
}

interface Location {
  id: string
  name: string
  address: string
}

interface EventApprovalStats {
  totalPending: number
  totalApproved: number
  totalRejected: number
  totalRevenue: number
}

// Utility functions để parse JSON strings (tương tự EventManagementPage)
const parseNotes = (notes: string | null): string[] => {
  if (!notes) return []
  try {
    const parsed = JSON.parse(notes)
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed
    }
  } catch {
    // Fallback: split by newlines
    if (notes.trim()) {
      return notes.split('\n').filter(line => line.trim())
    }
  }
  return []
}

const parseAgenda = (agenda: string | null): Array<{start: string; end: string; title: string; desc?: string}> => {
  if (!agenda) return []
  try {
    const parsed = JSON.parse(agenda)
    if (Array.isArray(parsed) && parsed.every(item => 
      typeof item === 'object' && 
      typeof item.start === 'string' && 
      typeof item.end === 'string' && 
      typeof item.title === 'string'
    )) {
      return parsed
    }
  } catch {
    // Fallback: parse by line format "HH:MM-HH:MM | Title | Description"
    if (agenda.trim()) {
      return agenda.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split('|').map(part => part.trim())
          if (parts.length >= 2) {
            const timeRange = parts[0]
            const title = parts[1]
            const desc = parts[2] || ''
            
            const timeMatch = timeRange.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/)
            if (timeMatch) {
              return {
                start: timeMatch[1],
                end: timeMatch[2],
                title,
                desc
              }
            }
          }
          return null
        })
        .filter(item => item !== null) as Array<{start: string; end: string; title: string; desc?: string}>
    }
  }
  return []
}

const parseInstructor = (instructorName: string | null): {name: string; experience?: string} => {
  if (!instructorName) return { name: '' }
  try {
    const parsed = JSON.parse(instructorName)
    if (typeof parsed === 'object' && typeof parsed.name === 'string') {
      return parsed
    }
  } catch {
    // Fallback: treat entire string as name
    if (instructorName.trim()) {
      return { name: instructorName.trim() }
    }
  }
  return { name: '' }
}

// Helper function to get user initials for avatar
const getUserInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'
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

export default function EventApprovalDashboard() {
  const [events, setEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [toast, setToast] = useState("")
  
  // User state from localStorage
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
    role: string
    location: string
    property_name: string
    region: string
    avatar: string
  }>({
    id: "",
    name: "",
    email: "",
    role: "",
    location: "",
    property_name: "",
    region: "West Coast",
    avatar: ""
  })

  // Get navigation for admin role
  const navigation = getNavigationForRole("admin", "/admin/event-approval")

  // Get user info from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("nextu_internal_user")
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr)
          setUser({
            id: userObj.user_id || "",
            name: userObj.name || "",
            email: userObj.email || "",
            role: userObj.role || "",
            location: userObj.property_name || "",
            property_name: userObj.property_name || "",
            region: "West Coast",
            avatar: getUserInitials(userObj.name || "")
          })
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }
  }, [])

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/PendingEvent')
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setEvents(response.data.data)
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
    totalRevenue: events.reduce((total, event) => {
      // Calculate revenue from all ticket types across all schedule masters
      let eventRevenue = 0
      event.scheduleMasters.forEach(scheduleMaster => {
        scheduleMaster.schedules.forEach(schedule => {
          schedule.ticketTypes.forEach(ticketType => {
            eventRevenue += ticketType.price * ticketType.totalQuantity
          })
        })
      })
      return total + eventRevenue
    }, 0)
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
      setApproving(true)
      if (approvalAction === "approve") {
        // Call the approve API
        const response = await api.post(`/api/PendingEventApproval/${selectedEvent.id}/approve`)
        
        // Check if the response is successful
        if (response.data && response.data.success) {
          // Refresh the events list to get the latest data
          await fetchEvents()
          setToast(response.data.message || "Event approved successfully!")
        } else {
          throw new Error(response.data?.message || "Failed to approve event")
        }
      } else {
        // For reject, we'll keep the local state update for now
        // You can add reject API call here when available
        const updatedEvents = events.map(event => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              status: 0, // Keep as pending for now
              statusText: "Pending"
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
    } catch (error: any) {
      console.error('Error updating event:', error)
      const errorMessage = error.response?.data?.message || error.message || "Error updating event. Please try again."
      setToast(errorMessage)
      setTimeout(() => setToast(""), 3000)
    } finally {
      setApproving(false)
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
  ]

  const eventRows = events.map(event => {
    return {
      ...event,
      categoryName: event.categoryName || "Unknown",
      levelName: event.levelName || "Unknown",
      status: getStatusBadge(event.status)
    }
  })

  if (loading) {
    return (
      <RoleLayout>
             <Sidebar navigation={navigation} title="Next U" userRole="Admin" />

        <div className="lg:pl-64 flex flex-col flex-1 bg-gray-50 min-h-screen">
          <TopNav user={user} title="Event Approval Management" />
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
            <Sidebar navigation={navigation} title="Next U" userRole="Admin" />

      
      <div className="lg:pl-64 flex flex-col flex-1 bg-gray-50 min-h-screen">
        <TopNav user={user} title="Event Approval Management" />
        
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-y-auto">
          {/* Header Section */}
        

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
                {/* Parse các JSON fields để hiển thị đẹp hơn */}
                {(() => {
                  const requirements = parseNotes(selectedEvent.notes)
                  const timeline = parseAgenda(selectedEvent.agenda)
                  const instructor = parseInstructor(selectedEvent.instructorName)
                  
                  return (
                    <>
                      {/* Event Image Preview */}
                      {selectedEvent.imageUrl && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-3">🖼️ Event Image</h5>
                          <img
                            src={selectedEvent.imageUrl}
                            alt="Event preview"
                            className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}

                      {/* Basic Information */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3">📝 Basic Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Code:</span>
                            <span className="ml-2 font-medium">{selectedEvent.code}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Title:</span>
                            <span className="ml-2 font-medium">{selectedEvent.title}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Category:</span>
                            <span className="ml-2 font-medium">{selectedEvent.categoryName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Level:</span>
                            <span className="ml-2 font-medium">{selectedEvent.levelName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <span className="ml-2 font-medium">{selectedEvent.phoneNumber || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <span className="ml-2">{getStatusBadge(selectedEvent.status)}</span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Description:</span>
                            <p className="mt-1 text-gray-800">{selectedEvent.description}</p>
                          </div>
                          
                          {/* Requirements */}
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Requirements:</span>
                            {requirements.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {requirements.map((req, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {req}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-gray-500">No requirements added</p>
                            )}
                          </div>
                          
                          {/* Timeline */}
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Timeline:</span>
                            {timeline.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                {timeline.map((item, index) => (
                                  <div key={index} className="flex items-center space-x-3 text-sm">
                                    <span className="font-medium text-gray-700">{item.start} - {item.end}</span>
                                    <span className="text-gray-600">|</span>
                                    <span className="font-medium">{item.title}</span>
                                    {item.desc && (
                                      <>
                                        <span className="text-gray-600">|</span>
                                        <span className="text-gray-500">{item.desc}</span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-gray-500">No timeline added</p>
                            )}
                          </div>
                          
                          {/* Instructor */}
                          <div className="md:col-span-2">
                            <span className="text-gray-600">Instructor:</span>
                            <div className="mt-1">
                              {instructor.name ? (
                                <div>
                                  <div className="font-medium">{instructor.name}</div>
                                  {instructor.experience && (
                                    <div className="text-sm text-gray-600 mt-1">{instructor.experience}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500 italic">Not provided</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Schedule */}
                      {selectedEvent.scheduleMasters.length > 0 && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-3">📅 Schedule</h5>
                          {selectedEvent.scheduleMasters.map((scheduleMaster, index) => (
                            <div key={index} className="text-sm mb-4">
                              <div className="font-medium text-blue-900 mb-2">Schedule Master {index + 1}</div>
                              <div><span className="text-gray-600">Start:</span> <span className="ml-2 font-medium">{new Date(scheduleMaster.startDate).toLocaleString()}</span></div>
                              <div><span className="text-gray-600">End:</span> <span className="ml-2 font-medium">{new Date(scheduleMaster.recurrenceEndDate).toLocaleString()}</span></div>
                              <div><span className="text-gray-600">Duration:</span> <span className="ml-2 font-medium">{scheduleMaster.duration}</span></div>
                              <div><span className="text-gray-600">Recurrence:</span> <span className="ml-2 font-medium">{scheduleMaster.recurrenceType === 2 ? "Weekly" : "One-time"}</span></div>
                              <div><span className="text-gray-600">Repeat Count:</span> <span className="ml-2 font-medium">{scheduleMaster.repeatCount}</span></div>
                              
                              {/* Hiển thị các schedule cụ thể */}
                              {scheduleMaster.schedules.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-sm font-medium text-blue-800 mb-2">Generated Schedules:</div>
                                  <div className="space-y-1">
                                    {scheduleMaster.schedules.map((schedule, sIndex) => (
                                      <div key={sIndex} className="text-xs bg-white p-2 rounded border border-blue-200">
                                        Session {sIndex + 1}: {formatDate(schedule.startTime)} at {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ticket Types */}
                      {selectedEvent.scheduleMasters.length > 0 && 
                       selectedEvent.scheduleMasters.some(sm => sm.schedules.some(s => s.ticketTypes.length > 0)) && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-3">🎫 Ticket Types</h5>
                          <div className="space-y-3">
                            {(() => {
                              // Lấy 2 loại vé đầu tiên từ schedule đầu tiên
                              const firstSchedule = selectedEvent.scheduleMasters[0]?.schedules[0]
                              if (firstSchedule && firstSchedule.ticketTypes.length > 0) {
                                return firstSchedule.ticketTypes.slice(0, 2).map((ticket, index) => (
                                  <div key={index} className="text-sm border border-green-200 rounded p-3 bg-white">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">{ticket.name}</span>
                                      <span className="font-semibold">{ticket.price.toLocaleString('en-US')} VND</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                                      <div>Quantity: {ticket.totalQuantity} available</div>
                                      <div>Max per user: {ticket.maxPerUser}</div>
                                      <div>Early Bird: {ticket.isEarlyBird ? `${Math.round(ticket.discountRateEarlyBird * 100)}% off` : 'Not enabled'}</div>
                                      <div>Combo: {ticket.discountRateCombo !== null ? `${Math.round(ticket.discountRateCombo * 100)}% off` : 'Not enabled'}</div>
                                    </div>
                                    {ticket.isEarlyBird && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Early bird deadline: {formatDate(ticket.earlyBirdDeadline)}
                                      </div>
                                    )}
                                  </div>
                                ))
                              }
                              return null
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Add-ons */}
                      {selectedEvent.addOns.length > 0 && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-3">📦 Add-ons</h5>
                          <div className="space-y-2">
                            {selectedEvent.addOns.map((addon, index) => (
                              <div key={index} className="text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{addon.name}</span>
                                  <span>{addon.price.toLocaleString('en-US')} VND</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Locations */}
                      {selectedEvent.locations.length > 0 && (
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-3">📍 Locations</h5>
                          <div className="space-y-2">
                            {selectedEvent.locations.map((location, index) => (
                              <div key={index} className="text-sm">
                                <div className="font-medium">{location.name}</div>
                                <div className="text-gray-600">{location.address}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
                    </>
                  )
                })()}
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
                    disabled={approving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className={`flex-1 text-white rounded-lg px-4 py-3 font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
                      approvalAction === "approve" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-red-600 hover:bg-red-700"
                    } ${approving ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleApprovalSubmit}
                    disabled={(approvalAction === "reject" && !rejectionReason.trim()) || approving}
                  >
                    {approving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {approvalAction === "approve" ? "Approving..." : "Rejecting..."}
                      </>
                    ) : (
                      <>
                        {approvalAction === "approve" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {approvalAction === "approve" ? "Approve Event" : "Reject Event"}
                      </>
                    )}
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