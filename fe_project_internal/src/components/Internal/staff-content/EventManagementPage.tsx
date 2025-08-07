"use client"

import { useState, useEffect } from "react"
import { Calendar, Users, MapPin, DollarSign, Clock, Plus, ArrowLeft, Save, Send, Settings, Image, FileText, AlertCircle, Edit, Trash2, Eye, X } from "lucide-react"
import RoleBasedLayout from "../layouts/RoleBasedLayout"
import type { User } from "../types"
import Link from "next/link"
import api from "@/utils/axiosConfig"
import { Notify } from "notiflix"

// Types based on backend API response
interface EventCategory {
  id: number
  name: string
  description: string
}

interface EventLevel {
  id: number
  name: string
  description: string
}

// CRUD operation types
interface CreateCategoryRequest {
  name: string
  description: string
}

interface CreateLevelRequest {
  name: string
  description: string
}

interface UpdateCategoryRequest {
  id: number
  name: string
  description: string
}

interface UpdateLevelRequest {
  id: number
  name: string
  description: string
}

interface EventSchedule {
  id: string
  startTime: string
  endTime: string
  ticketTypes: ScheduleTicketType[]
}

interface ScheduleTicketType {
  id: string
  name: string
  price: number
  totalQuantity: number
}

interface TicketType {
  id: string
  name: string
  price: number
  totalQuantity: number
}

interface AddOn {
  id: string
  name: string
  description: string
  price: number
}

interface EventLocation {
  id: string
  name: string
  address: string
  description?: string
  mapUrl?: string
}

interface Event {
  id: string
  code: string
  title: string
  description: string
  categoryId: number
  categoryName: string
  levelId: number
  levelName: string
  isPublished: boolean
  schedules: EventSchedule[]
  addOns: AddOn[]
  locations: EventLocation[]
}

// New interface for creating pending events
interface PendingEventRequest {
  title: string
  description: string
  notes: string // Changed from optional to required
  categoryId: number
  levelId: number
  scheduleMasters: ScheduleMaster[]
  addOns: {
    name: string
    price: number
  }[]
  locations: {
    name: string
    address: string
  }[]
}

interface ScheduleMaster {
  startDate: string
  recurrenceEndDate: string
  duration: string // Format: "2:00:00"
  recurrenceType: number // Always 2 for weekly
  repeatCount: number
  ticketTypes: ScheduleMasterTicketType[]
}

interface ScheduleMasterTicketType {
  name: string
  price: number
  totalQuantity: number
  maxPerUser: number
  isEarlyBird: boolean
  earlyBirdDeadline: string
  discountRate: number // 1 for 100% discount as per new API example
}

const mockUser: User = {
  id: "6",
  name: "Rachel Green",
  email: "rachel@nextu.com",
  role: "Staff_Content",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

// Event creation steps - redesigned for better UX
const eventSteps = [
  { id: 1, title: "Basic Information", description: "Title, category, description, image" },
  { id: 2, title: "Schedule", description: "Date, time, duration, repeat pattern" },
  { id: 3, title: "Ticket Types", description: "Pricing, quantity, ticket categories" },
  { id: 4, title: "Add-ons", description: "Additional services, equipment, meals" },
  { id: 5, title: "Location", description: "Name, address, description, map" },
  { id: 6, title: "Preview", description: "Review and submit for approval" },
]

export default function EventManagementPage() {
  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  
  // Data states
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [levels, setLevels] = useState<EventLevel[]>([])
  const [pendingEvents, setPendingEvents] = useState<Event[]>([])
  
  // Loading states
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingLevels, setIsLoadingLevels] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // CRUD modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<EventCategory | null>(null)
  const [editingLevel, setEditingLevel] = useState<EventLevel | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'level', id: number, name: string } | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<PendingEventRequest>({
    title: "",
    description: "",
    notes: "", // Changed back to empty string to allow user input
    categoryId: 0,
    levelId: 0,
    scheduleMasters: [],
    addOns: [],
    locations: []
  })

  // Temporary form states for better UX
  const [tempSchedule, setTempSchedule] = useState({
    startDate: "",
    endDate: "",
    duration: "2:00:00",
    repeatCount: 1
  })

  const [tempTicketTypes, setTempTicketTypes] = useState<ScheduleMasterTicketType[]>([])
  const [tempEarlyBirdDeadline, setTempEarlyBirdDeadline] = useState("")
  const [tempDiscountRate, setTempDiscountRate] = useState(1) // 1 for 100% discount as per new API example

  // Helper function to format datetime for input
  const formatDateTimeForInput = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ""
      // Format for datetime-local input: YYYY-MM-DDTHH:MM
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } catch (error) {
      return ""
    }
  }

  // Helper function to format duration with leading zeros (e.g., "2:00:00" -> "02:00:00")
  const formatDuration = (duration: string): string => {
    if (!duration || !duration.includes(':')) {
      // If duration is not in the correct format, convert it
      const hours = parseInt(duration) || 2
      return `${String(hours).padStart(2, '0')}:00:00`
    }
    
    // Split the duration into parts
    const parts = duration.split(':')
    if (parts.length >= 3) {
      // Format: "H:MM:SS" -> "HH:MM:SS"
      const hours = String(parseInt(parts[0]) || 0).padStart(2, '0')
      const minutes = String(parseInt(parts[1]) || 0).padStart(2, '0')
      const seconds = String(parseInt(parts[2]) || 0).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    } else if (parts.length === 2) {
      // Format: "H:MM" -> "HH:MM:00"
      const hours = String(parseInt(parts[0]) || 0).padStart(2, '0')
      const minutes = String(parseInt(parts[1]) || 0).padStart(2, '0')
      return `${hours}:${minutes}:00`
    } else {
      // Single number -> "HH:00:00"
      const hours = String(parseInt(parts[0]) || 2).padStart(2, '0')
      return `${hours}:00:00`
    }
  }

  // Helper function to update formData from tempSchedule
  const updateFormDataFromTempSchedule = (updatedTempSchedule?: typeof tempSchedule) => {
    const scheduleToUse = updatedTempSchedule || tempSchedule
    if (scheduleToUse.startDate && scheduleToUse.endDate) {
      try {
        const startDate = new Date(scheduleToUse.startDate)
        const endDate = new Date(scheduleToUse.endDate)
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Invalid date format")
          return
        }
        
        // Format duration with leading zeros
        const formattedDuration = formatDuration(scheduleToUse.duration || "2:00:00")
        
        const newScheduleMasters = [{
          startDate: startDate.toISOString(),
          recurrenceEndDate: endDate.toISOString(),
          duration: formattedDuration,
          recurrenceType: 2,
          repeatCount: scheduleToUse.repeatCount || 1,
          ticketTypes: tempTicketTypes || []
        }]
        
        setFormData(prevData => ({
          ...prevData,
          scheduleMasters: newScheduleMasters
        }))
      } catch (error) {
        console.error("Error updating schedule:", error)
      }
    }
  }

  // API Service Functions
  const fetchEvents = async () => {
    setIsLoadingEvents(true)
    try {
      const response = await api.get("/api/Event")
      setEvents(response.data)
    } catch (error) {
      console.error("Error fetching events:", error)
      Notify.failure("Failed to load events")
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const fetchEventDetails = async (eventId: string) => {
    try {
      const response = await api.get(`/api/Event/${eventId}`)
      setSelectedEvent(response.data)
      setShowEventDetails(true)
    } catch (error) {
      console.error("Error fetching event details:", error)
      Notify.failure("Failed to load event details")
    }
  }

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await api.get("/api/EventCategories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      Notify.failure("Failed to load categories")
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const fetchLevels = async () => {
    setIsLoadingLevels(true)
    try {
      const response = await api.get("/api/EventLevels")
      setLevels(response.data)
    } catch (error) {
      console.error("Error fetching levels:", error)
      Notify.failure("Failed to load levels")
    } finally {
      setIsLoadingLevels(false)
    }
  }

  const createPendingEvent = async (eventData: PendingEventRequest) => {
    setIsSubmitting(true)
    try {
      // Validate required fields
      if (!eventData.title || !eventData.title.trim()) {
        Notify.failure("Title is required")
        return
      }
      if (!eventData.description || !eventData.description.trim()) {
        Notify.failure("Description is required")
        return
      }
      if (!eventData.notes || !eventData.notes.trim()) {
        Notify.failure("Notes is required")
        return
      }
      if (!eventData.categoryId || eventData.categoryId < 1) {
        Notify.failure("Please select a valid category")
        return
      }
      if (!eventData.levelId || eventData.levelId < 1) {
        Notify.failure("Please select a valid level")
        return
      }
      if (!eventData.scheduleMasters || eventData.scheduleMasters.length === 0) {
        Notify.failure("At least one schedule is required")
        return
      }

      // Validate schedule data
      for (const schedule of eventData.scheduleMasters) {
        if (!schedule.startDate || !schedule.recurrenceEndDate) {
          Notify.failure("Start date and end date are required for all schedules")
          return
        }
      }

      // Format the data according to the successful API response
      const requestData = {
        title: eventData.title.trim(),
        description: eventData.description.trim(),
        notes: eventData.notes.trim(),
        categoryId: parseInt(eventData.categoryId.toString()),
        levelId: parseInt(eventData.levelId.toString()),
        scheduleMasters: eventData.scheduleMasters.map(schedule => ({
          startDate: schedule.startDate,
          recurrenceEndDate: schedule.recurrenceEndDate,
          duration: formatDuration(schedule.duration || "2:00:00"),
          recurrenceType: 2, // Always 2 for weekly
          repeatCount: schedule.repeatCount || 1,
          ticketTypes: schedule.ticketTypes && schedule.ticketTypes.length > 0 ? schedule.ticketTypes.map(ticket => ({
            name: ticket.name || "",
            price: parseInt(ticket.price.toString()) || 0,
            totalQuantity: parseInt(ticket.totalQuantity.toString()) || 0,
            maxPerUser: parseInt(ticket.maxPerUser.toString()) || 1,
            isEarlyBird: ticket.isEarlyBird !== undefined ? ticket.isEarlyBird : true,
            earlyBirdDeadline: ticket.earlyBirdDeadline || new Date().toISOString(),
            discountRate: parseFloat(ticket.discountRate.toString()) || 0.15
          })) : []
        })),
        addOns: eventData.addOns ? eventData.addOns.map(addon => ({
          name: addon.name || "",
          price: parseInt(addon.price.toString()) || 0
        })) : [],
        locations: eventData.locations ? eventData.locations.map(location => ({
          name: location.name || "",
          address: location.address || ""
        })) : []
      }

      console.log("Sending request data:", JSON.stringify(requestData, null, 2)) // Debug log

      const response = await api.post("/api/PendingEvent", requestData)
      Notify.success("Event submitted for review successfully!")
      setShowCreateForm(false)
      setFormData({
        title: "",
        description: "",
        notes: "",
        categoryId: 0,
        levelId: 0,
        scheduleMasters: [],
        addOns: [],
        locations: []
      })
      setCurrentStep(1)
      fetchEvents() // Refresh events list
    } catch (error: any) {
      console.error("Error creating pending event:", error)
      console.error("Error response:", error.response?.data)
      Notify.failure(error.response?.data?.message || "Failed to submit event for review")
    } finally {
      setIsSubmitting(false)
    }
  }

  // CRUD functions for Categories
  const createCategory = async (categoryData: CreateCategoryRequest) => {
    try {
      await api.post("/api/EventCategories", categoryData)
      Notify.success("Category created successfully!")
      setShowCategoryModal(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (error: any) {
      Notify.failure(error.response?.data?.message || "Failed to create category")
    }
  }

  const updateCategory = async (categoryData: UpdateCategoryRequest) => {
    try {
      await api.put(`/api/EventCategories/${categoryData.id}`, categoryData)
      Notify.success("Category updated successfully!")
      setShowCategoryModal(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (error: any) {
      Notify.failure(error.response?.data?.message || "Failed to update category")
    }
  }

  const deleteCategory = async (id: number) => {
    try {
      await api.delete(`/api/EventCategories/${id}`)
      Notify.success("Category deleted successfully!")
      setShowDeleteConfirm(false)
      setItemToDelete(null)
      fetchCategories()
    } catch (error: any) {
      Notify.failure(error.response?.data?.message || "Failed to delete category")
    }
  }

  // CRUD functions for Levels
  const createLevel = async (levelData: CreateLevelRequest) => {
    try {
      await api.post("/api/EventLevels", levelData)
      Notify.success("Level created successfully!")
      setShowLevelModal(false)
      setEditingLevel(null)
      fetchLevels()
    } catch (error: any) {
      Notify.failure(error.response?.data?.message || "Failed to create level")
    }
  }

  const updateLevel = async (levelData: UpdateLevelRequest) => {
    try {
      await api.put(`/api/EventLevels/${levelData.id}`, levelData)
      Notify.success("Level updated successfully!")
      setShowLevelModal(false)
      setEditingLevel(null)
      fetchLevels()
    } catch (error: any) {
      Notify.failure(error.response?.data?.message || "Failed to update level")
    }
  }

  const deleteLevel = async (id: number) => {
    try {
      await api.delete(`/api/EventLevels/${id}`)
      Notify.success("Level deleted successfully!")
      setShowDeleteConfirm(false)
      setItemToDelete(null)
      fetchLevels()
    } catch (error: any) {
      Notify.failure(error.response?.data?.message || "Failed to delete level")
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchEvents()
    fetchCategories()
    fetchLevels()
  }, [])

  // Initialize tempSchedule when entering step 2
  useEffect(() => {
    if (currentStep === 2) {
      if (formData.scheduleMasters.length === 0) {
        // Initialize with default values if no schedule exists
        setTempSchedule({
          startDate: "",
          endDate: "",
          duration: "02:00:00", // Use formatted duration with leading zeros
          repeatCount: 1
        })
      } else {
        // Sync with existing schedule data
        const schedule = formData.scheduleMasters[0]
        setTempSchedule({
          startDate: formatDateTimeForInput(schedule.startDate),
          endDate: formatDateTimeForInput(schedule.recurrenceEndDate),
          duration: schedule.duration,
          repeatCount: schedule.repeatCount
        })
      }
    }
  }, [currentStep, formData.scheduleMasters])

  // Filter events by status
  const publishedEvents = events.filter(event => event.isPublished)
  const pendingEventsList = events.filter(event => !event.isPublished)

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? 
      { text: "Published", className: "bg-green-100 text-green-800" } :
      { text: "Under Review", className: "bg-yellow-100 text-yellow-800" }
  }

  return (
    <RoleBasedLayout role="staff_content" user={mockUser} title="Event/Workshop Management">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link href="/staff-content" className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Event/Workshop Management</h1>
          </div>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Event/Workshop
          </button>
        </div>
        <p className="text-gray-600">Create and manage events/workshops with full workflow from basic information to publication</p>
      </div>

      {!showCreateForm ? (
        <div className="space-y-8">
          {/* Categories and Levels Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Categories */}
            <div className="bg-white shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-6 w-6 text-green-600 mr-3" />
                    Event Categories
                  </h2>
                  <button
                    onClick={() => {
                      setEditingCategory(null)
                      setShowCategoryModal(true)
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Category
                  </button>
                </div>
              </div>
              <div className="p-6">
                {isLoadingCategories ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories</h3>
                    <p className="text-gray-500 mb-4">Create your first event category to get started</p>
                    <button
                      onClick={() => {
                        setEditingCategory(null)
                        setShowCategoryModal(true)
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingCategory(category)
                                setShowCategoryModal(true)
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit category"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete({ type: 'category', id: category.id, name: category.name })
                                setShowDeleteConfirm(true)
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Event Levels */}
            <div className="bg-white shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Users className="h-6 w-6 text-purple-600 mr-3" />
                    Event Levels
                  </h2>
                  <button
                    onClick={() => {
                      setEditingLevel(null)
                      setShowLevelModal(true)
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Level
                  </button>
                </div>
              </div>
              <div className="p-6">
                {isLoadingLevels ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : levels.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Levels</h3>
                    <p className="text-gray-500 mb-4">Create your first event level to get started</p>
                    <button
                      onClick={() => {
                        setEditingLevel(null)
                        setShowLevelModal(true)
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Level
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {levels.map((level) => (
                      <div key={level.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{level.name}</h3>
                            <p className="text-sm text-gray-600">{level.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingLevel(level)
                                setShowLevelModal(true)
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit level"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete({ type: 'level', id: level.id, name: level.name })
                                setShowDeleteConfirm(true)
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete level"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Published Events */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                Published Events/Workshops
              </h2>
            </div>
            <div className="p-6">
              {isLoadingEvents ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {publishedEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(event.isPublished).className}`}>
                          {getStatusBadge(event.isPublished).text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{event.categoryName} • {event.levelName}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        {event.schedules.length > 0 && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(event.schedules[0].startTime)} at {formatTime(event.schedules[0].startTime)}
                          </div>
                        )}
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.locations.length > 0 ? event.locations[0].name : "Location TBD"}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {event.schedules.length > 0 && event.schedules[0].ticketTypes.length > 0 ? 
                            `${event.schedules[0].ticketTypes[0].price.toLocaleString('en-US')} VND` : 
                            "Price TBD"
                          }
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          {event.schedules.length > 0 ? 
                            event.schedules.reduce((total, schedule) => 
                              total + schedule.ticketTypes.reduce((scheduleTotal, ticket) => scheduleTotal + ticket.totalQuantity, 0), 0
                            ) : 0} total capacity
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button 
                          onClick={() => fetchEventDetails(event.id)}
                          className="px-3 py-1 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1 inline" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Events */}
          {pendingEventsList.length > 0 && (
            <div className="bg-white shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="h-6 w-6 text-yellow-600 mr-3" />
                  Pending Review Events
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pendingEventsList.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Under Review
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{event.categoryName} • {event.levelName}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        {event.schedules.length > 0 && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(event.schedules[0].startTime)} at {formatTime(event.schedules[0].startTime)}
                          </div>
                        )}
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.locations.length > 0 ? event.locations[0].name : "Location TBD"}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button 
                          onClick={() => fetchEventDetails(event.id)}
                          className="px-3 py-1 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1 inline" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Event Creation Form
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Create New Event/Workshop</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {eventSteps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step.id <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  <div className="ml-2 hidden md:block">
                    <p className={`text-sm font-medium ${step.id <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < eventSteps.length - 1 && (
                    <div className={`w-8 h-0.5 ml-4 ${step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content Based on Current Step */}
          <div className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Step 1: Basic Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder='Example: "Yoga & Wellness Retreat"'
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Category</label>
                      <select 
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Select event category...</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Level</label>
                      <select 
                        value={formData.levelId}
                        onChange={(e) => setFormData({...formData, levelId: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Select event level...</option>
                        {levels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Description</label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Enter detailed description, objectives, highlights..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Enter any additional notes or comments..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Promotional Image/Video</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Drag and drop or click to upload image</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Event title should be concise and attractive</li>
                        <li>• Provide clear description of content and benefits</li>
                        <li>• Use high-quality images</li>
                        <li>• Choose appropriate category and level</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Step 2: Schedule & Timing</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="datetime-local"
                          value={formatDateTimeForInput(tempSchedule.startDate)}
                          onChange={(e) => {
                            const startDate = e.target.value
                            const updatedTempSchedule = {
                              ...tempSchedule,
                              startDate: startDate
                            }
                            setTempSchedule(updatedTempSchedule)
                            // Update formData when user changes
                            if (startDate && tempSchedule.endDate) {
                              updateFormDataFromTempSchedule(updatedTempSchedule)
                            }
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="datetime-local"
                          value={formatDateTimeForInput(tempSchedule.endDate)}
                          onChange={(e) => {
                            const endDate = e.target.value
                            const updatedTempSchedule = {
                              ...tempSchedule,
                              endDate: endDate
                            }
                            setTempSchedule(updatedTempSchedule)
                            // Update formData when user changes
                            if (tempSchedule.startDate && endDate) {
                              updateFormDataFromTempSchedule(updatedTempSchedule)
                            }
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                      <select 
                        value={tempSchedule.duration}
                        onChange={(e) => {
                          const duration = e.target.value
                          const updatedTempSchedule = {
                            ...tempSchedule,
                            duration: duration
                          }
                          setTempSchedule(updatedTempSchedule)
                          // Update formData when duration changes
                          if (tempSchedule.startDate && tempSchedule.endDate) {
                            updateFormDataFromTempSchedule(updatedTempSchedule)
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="2:00:00">2 hours</option>
                        <option value="4:00:00">4 hours</option>
                        <option value="6:00:00">6 hours</option>
                        <option value="8:00:00">8 hours</option>
                        <option value="10:00:00">10 hours</option>
                        <option value="12:00:00">12 hours</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select duration for each event session</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Repeat Count</label>
                      <input
                        type="number"
                        value={tempSchedule.repeatCount}
                        onChange={(e) => {
                          const repeatCount = parseInt(e.target.value) || 1
                          const updatedTempSchedule = {
                            ...tempSchedule,
                            repeatCount: repeatCount
                          }
                          setTempSchedule(updatedTempSchedule)
                          // Update formData when repeat count changes
                          if (tempSchedule.startDate && tempSchedule.endDate) {
                            updateFormDataFromTempSchedule(updatedTempSchedule)
                          }
                        }}
                        placeholder="1"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Number of times the event will repeat weekly</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">📅 Schedule Reference</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Morning Yoga:</strong> 6:00 - 8:00</p>
                      <p><strong>Creative Workshop:</strong> 14:00 - 17:00</p>
                      <p><strong>Cooking Together:</strong> 18:00 - 21:00</p>
                      <p><strong>Weekend Retreat:</strong> Saturday - Sunday</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Step 3: Ticket Types</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Event Tickets</h4>
                      <p className="text-sm text-gray-600">Define different ticket types with pricing and quantities</p>
                    </div>
                    <button
                      onClick={() => {
                        const newTicketType: ScheduleMasterTicketType = {
                          name: "",
                          price: 0,
                          totalQuantity: 0,
                          maxPerUser: 1,
                          isEarlyBird: true,
                          earlyBirdDeadline: "",
                          discountRate: 0.15
                        }
                        setTempTicketTypes([...tempTicketTypes, newTicketType])
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Ticket Type
                    </button>
                  </div>
                  
                  {tempTicketTypes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h5 className="text-lg font-medium text-gray-900 mb-2">No ticket types added yet</h5>
                      <p className="text-sm mb-4">Start by adding your first ticket type to define pricing and capacity</p>
                      <button
                        onClick={() => {
                          const newTicketType: ScheduleMasterTicketType = {
                            name: "",
                            price: 0,
                            totalQuantity: 0,
                            maxPerUser: 1,
                            isEarlyBird: true,
                            earlyBirdDeadline: "",
                            discountRate: 0.15
                          }
                          setTempTicketTypes([...tempTicketTypes, newTicketType])
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Ticket Type
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tempTicketTypes.map((ticket, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">Ticket Type {index + 1}</h5>
                            <button
                              onClick={() => {
                                const updatedTickets = tempTicketTypes.filter((_, i) => i !== index)
                                setTempTicketTypes(updatedTickets)
                              }}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Name</label>
                              <input
                                type="text"
                                value={ticket.name}
                                onChange={(e) => {
                                  const updatedTickets = [...tempTicketTypes]
                                  updatedTickets[index] = {
                                    ...updatedTickets[index],
                                    name: e.target.value
                                  }
                                  setTempTicketTypes(updatedTickets)
                                }}
                                placeholder="e.g., Regular, VIP, Early Bird"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Price (VND)</label>
                              <input
                                type="number"
                                value={ticket.price}
                                onChange={(e) => {
                                  const updatedTickets = [...tempTicketTypes]
                                  updatedTickets[index] = {
                                    ...updatedTickets[index],
                                    price: parseInt(e.target.value) || 0
                                  }
                                  setTempTicketTypes(updatedTickets)
                                }}
                                placeholder="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Available</label>
                              <input
                                type="number"
                                value={ticket.totalQuantity}
                                onChange={(e) => {
                                  const updatedTickets = [...tempTicketTypes]
                                  updatedTickets[index] = {
                                    ...updatedTickets[index],
                                    totalQuantity: parseInt(e.target.value) || 0
                                  }
                                  setTempTicketTypes(updatedTickets)
                                }}
                                placeholder="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Max Per User</label>
                              <input
                                type="number"
                                value={ticket.maxPerUser}
                                onChange={(e) => {
                                  const updatedTickets = [...tempTicketTypes]
                                  updatedTickets[index] = {
                                    ...updatedTickets[index],
                                    maxPerUser: parseInt(e.target.value) || 1
                                  }
                                  setTempTicketTypes(updatedTickets)
                                }}
                                placeholder="1"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          
                          {/* Early Bird Settings */}
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <h6 className="font-medium text-blue-900 mb-3">Early Bird Settings</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Early Bird Deadline</label>
                                <input
                                  type="datetime-local"
                                  value={ticket.earlyBirdDeadline}
                                  onChange={(e) => {
                                    const updatedTickets = [...tempTicketTypes]
                                    updatedTickets[index] = {
                                      ...updatedTickets[index],
                                      earlyBirdDeadline: e.target.value
                                    }
                                    setTempTicketTypes(updatedTickets)
                                  }}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Rate (%)</label>
                                <input
                                  type="number"
                                  value={Math.round(ticket.discountRate * 100)}
                                  onChange={(e) => {
                                    const updatedTickets = [...tempTicketTypes]
                                    updatedTickets[index] = {
                                      ...updatedTickets[index],
                                      discountRate: (parseInt(e.target.value) || 0) / 100
                                    }
                                    setTempTicketTypes(updatedTickets)
                                  }}
                                  placeholder="15"
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Section */}
                {tempTicketTypes.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">📊 Ticket Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Total Ticket Types:</span>
                        <span className="ml-2 text-blue-900">{tempTicketTypes.length}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Total Capacity:</span>
                        <span className="ml-2 text-blue-900">
                          {tempTicketTypes.reduce((total, ticket) => total + ticket.totalQuantity, 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Price Range:</span>
                        <span className="ml-2 text-blue-900">
                          {tempTicketTypes.length > 0 ? 
                            `${Math.min(...tempTicketTypes.map(t => t.price)).toLocaleString('en-US')} - ${Math.max(...tempTicketTypes.map(t => t.price)).toLocaleString('en-US')} VND` : 
                            "Not set"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Step 4: Add-ons</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Additional Services</h4>
                      <p className="text-sm text-gray-600">Offer extra services, equipment, or meals to enhance the event experience</p>
                    </div>
                    <button
                      onClick={() => {
                        const newAddOn = {
                          name: "",
                          description: "",
                          price: 0
                        }
                        setFormData({
                          ...formData,
                          addOns: [...formData.addOns, newAddOn]
                        })
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Add-on
                    </button>
                  </div>
                  
                  {formData.addOns.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h5 className="text-lg font-medium text-gray-900 mb-2">No add-ons added yet</h5>
                      <p className="text-sm mb-4">Add optional services or items that participants can purchase</p>
                      <button
                        onClick={() => {
                          const newAddOn = {
                            name: "",
                            price: 0
                          }
                          setFormData({
                            ...formData,
                            addOns: [...formData.addOns, newAddOn]
                          })
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Add-on
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.addOns.map((addon, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-green-50">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">Add-on {index + 1}</h5>
                            <button
                              onClick={() => {
                                const updatedAddOns = formData.addOns.filter((_, i) => i !== index)
                                setFormData({
                                  ...formData,
                                  addOns: updatedAddOns
                                })
                              }}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Add-on Name</label>
                              <input
                                type="text"
                                value={addon.name}
                                onChange={(e) => {
                                  const updatedAddOns = [...formData.addOns]
                                  updatedAddOns[index] = {
                                    ...updatedAddOns[index],
                                    name: e.target.value
                                  }
                                  setFormData({
                                    ...formData,
                                    addOns: updatedAddOns
                                  })
                                }}
                                placeholder="e.g., Meal, Workshop, Equipment"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Price (VND)</label>
                              <input
                                type="number"
                                value={addon.price}
                                onChange={(e) => {
                                  const updatedAddOns = [...formData.addOns]
                                  updatedAddOns[index] = {
                                    ...updatedAddOns[index],
                                    price: parseInt(e.target.value) || 0
                                  }
                                  setFormData({
                                    ...formData,
                                    addOns: updatedAddOns
                                  })
                                }}
                                placeholder="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Section */}
                {formData.addOns.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-900 mb-2">📦 Add-ons Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700 font-medium">Total Add-ons:</span>
                        <span className="ml-2 text-green-900">{formData.addOns.length}</span>
                      </div>
                      <div>
                        <span className="text-green-700 font-medium">Price Range:</span>
                        <span className="ml-2 text-green-900">
                          {formData.addOns.length > 0 ? 
                            `${Math.min(...formData.addOns.map(a => a.price)).toLocaleString('en-US')} - ${Math.max(...formData.addOns.map(a => a.price)).toLocaleString('en-US')} VND` : 
                            "Not set"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Step 5: Location</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Event Location</h4>
                      <p className="text-sm text-gray-600">Provide venue details and address information</p>
                    </div>
                    <button
                      onClick={() => {
                        const newLocation = {
                          name: "",
                          address: ""
                        }
                        setFormData({
                          ...formData,
                          locations: [...formData.locations, newLocation]
                        })
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </button>
                  </div>
                  
                  {formData.locations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h5 className="text-lg font-medium text-gray-900 mb-2">No locations added yet</h5>
                      <p className="text-sm mb-4">Add venue information where the event will take place</p>
                      <button
                        onClick={() => {
                          const newLocation = {
                            name: "",
                            address: ""
                          }
                          setFormData({
                            ...formData,
                            locations: [...formData.locations, newLocation]
                          })
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Location
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.locations.map((location, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">Location {index + 1}</h5>
                            <button
                              onClick={() => {
                                const updatedLocations = formData.locations.filter((_, i) => i !== index)
                                setFormData({
                                  ...formData,
                                  locations: updatedLocations
                                })
                              }}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                              <input
                                type="text"
                                value={location.name}
                                onChange={(e) => {
                                  const updatedLocations = [...formData.locations]
                                  updatedLocations[index] = {
                                    ...updatedLocations[index],
                                    name: e.target.value
                                  }
                                  setFormData({
                                    ...formData,
                                    locations: updatedLocations
                                  })
                                }}
                                placeholder="e.g., NextNest Wellness Center"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                              <input
                                type="text"
                                value={location.address}
                                onChange={(e) => {
                                  const updatedLocations = [...formData.locations]
                                  updatedLocations[index] = {
                                    ...updatedLocations[index],
                                    address: e.target.value
                                  }
                                  setFormData({
                                    ...formData,
                                    locations: updatedLocations
                                  })
                                }}
                                placeholder="Full address of the venue"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Step 6: Preview & Submit</h3>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Event Summary</h4>
                    
                    {/* Basic Information */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">📝 Basic Information</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Title:</span>
                          <span className="ml-2 font-medium">{formData.title || "Not set"}</span>
                        </div>

                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium">
                            {categories.find(c => c.id === formData.categoryId)?.name || "Not selected"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Level:</span>
                          <span className="ml-2 font-medium">
                            {levels.find(l => l.id === formData.levelId)?.name || "Not selected"}
                          </span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-gray-600">Description:</span>
                          <p className="mt-1 text-gray-800">{formData.description || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Schedule */}
                    {formData.scheduleMasters.length > 0 && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3">📅 Schedule</h5>
                        {formData.scheduleMasters.map((schedule, index) => (
                          <div key={index} className="text-sm">
                            <div><span className="text-gray-600">Start:</span> <span className="ml-2 font-medium">{new Date(schedule.startDate).toLocaleString()}</span></div>
                            <div><span className="text-gray-600">End:</span> <span className="ml-2 font-medium">{new Date(schedule.recurrenceEndDate).toLocaleString()}</span></div>
                            <div><span className="text-gray-600">Duration:</span> <span className="ml-2 font-medium">{schedule.duration}</span></div>
                            <div><span className="text-gray-600">Recurrence:</span> <span className="ml-2 font-medium">{schedule.recurrenceType === 2 ? "Weekly" : "One-time"}</span></div>
                            <div><span className="text-gray-600">Repeat Count:</span> <span className="ml-2 font-medium">{schedule.repeatCount}</span></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ticket Types */}
                    {tempTicketTypes.length > 0 && (
                      <div className="mb-6 p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3">🎫 Ticket Types</h5>
                        <div className="space-y-2">
                          {tempTicketTypes.map((ticket, index) => (
                            <div key={index} className="text-sm flex justify-between items-center">
                              <span className="font-medium">{ticket.name || `Ticket ${index + 1}`}</span>
                              <span>{ticket.price.toLocaleString('en-US')} VND ({ticket.totalQuantity} available)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add-ons */}
                    {formData.addOns.length > 0 && (
                      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3">📦 Add-ons</h5>
                        <div className="space-y-2">
                          {formData.addOns.map((addon, index) => (
                            <div key={index} className="text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{addon.name || `Add-on ${index + 1}`}</span>
                                <span>{addon.price.toLocaleString('en-US')} VND</span>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locations */}
                    {formData.locations.length > 0 && (
                      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3">📍 Locations</h5>
                        <div className="space-y-2">
                          {formData.locations.map((location, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{location.name || `Location ${index + 1}`}</div>
                              <div className="text-gray-600">{location.address}</div>

                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center">
                                      <button 
                    onClick={() => {
                      // Prepare the final data for submission
                      const finalData: PendingEventRequest = {
                        ...formData,
                        scheduleMasters: formData.scheduleMasters.map(schedule => ({
                          ...schedule,
                          ticketTypes: tempTicketTypes || []
                        }))
                      }
                      
                      // Validate required fields before submission
                      if (!finalData.title || !finalData.title.trim()) {
                        Notify.failure("Title is required")
                        return
                      }
                      if (!finalData.description || !finalData.description.trim()) {
                        Notify.failure("Description is required")
                        return
                      }
                      if (!finalData.notes || !finalData.notes.trim()) {
                        Notify.failure("Notes is required")
                        return
                      }
                      if (!finalData.categoryId || finalData.categoryId < 1) {
                        Notify.failure("Please select a valid category")
                        return
                      }
                      if (!finalData.levelId || finalData.levelId < 1) {
                        Notify.failure("Please select a valid level")
                        return
                      }
                      if (!finalData.scheduleMasters || finalData.scheduleMasters.length === 0) {
                        Notify.failure("At least one schedule is required")
                        return
                      }
                      
                      createPendingEvent(finalData)
                    }}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Submitting for Review...
                      </div>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Event for Review
                      </>
                    )}
                  </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add more steps as needed */}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
              <button 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Save className="h-4 w-4 mr-2 inline" />
                  Save Draft
                </button>
                {currentStep < eventSteps.length ? (
                  <button 
                    onClick={() => setCurrentStep(Math.min(eventSteps.length, currentStep + 1))}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      // Prepare the final data for submission
                      const finalData: PendingEventRequest = {
                        ...formData,
                        scheduleMasters: formData.scheduleMasters.map(schedule => ({
                          ...schedule,
                          ticketTypes: tempTicketTypes || []
                        }))
                      }
                      
                      // Validate required fields before submission
                      if (!finalData.title || !finalData.title.trim()) {
                        Notify.failure("Title is required")
                        return
                      }
                      if (!finalData.description || !finalData.description.trim()) {
                        Notify.failure("Description is required")
                        return
                      }
                      if (!finalData.notes || !finalData.notes.trim()) {
                        Notify.failure("Notes is required")
                        return
                      }
                      if (!finalData.categoryId || finalData.categoryId < 1) {
                        Notify.failure("Please select a valid category")
                        return
                      }
                      if (!finalData.levelId || finalData.levelId < 1) {
                        Notify.failure("Please select a valid level")
                        return
                      }
                      if (!finalData.scheduleMasters || finalData.scheduleMasters.length === 0) {
                        Notify.failure("At least one schedule is required")
                        return
                      }
                      
                      createPendingEvent(finalData)
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2 inline" />
                        Submit for Review
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
              <button 
                onClick={() => setShowEventDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedEvent.title}</h3>
                  <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Code:</span>
                      <span className="ml-2 text-sm text-gray-600">{selectedEvent.code}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Category:</span>
                      <span className="ml-2 text-sm text-gray-600">{selectedEvent.categoryName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Level:</span>
                      <span className="ml-2 text-sm text-gray-600">{selectedEvent.levelName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedEvent.isPublished).className}`}>
                        {getStatusBadge(selectedEvent.isPublished).text}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Schedules</h4>
                  {selectedEvent.schedules.map((schedule, index) => (
                    <div key={schedule.id} className="mb-3 p-3 bg-gray-50 rounded">
                      <div className="text-sm">
                        <div><strong>Start:</strong> {formatDate(schedule.startTime)} at {formatTime(schedule.startTime)}</div>
                        <div><strong>End:</strong> {formatDate(schedule.endTime)} at {formatTime(schedule.endTime)}</div>
                      </div>
                    </div>
                  ))}

                  <h4 className="font-medium text-gray-900 mb-3 mt-4">Ticket Types</h4>
                  {selectedEvent.schedules.length > 0 && selectedEvent.schedules[0].ticketTypes.map((ticket, index) => (
                    <div key={ticket.id} className="mb-2 p-2 bg-blue-50 rounded">
                      <div className="text-sm">
                        <div><strong>{ticket.name}</strong></div>
                        <div>Price: {ticket.price.toLocaleString('en-US')} VND</div>
                        <div>Quantity: {ticket.totalQuantity}</div>
                      </div>
                    </div>
                  ))}

                  {selectedEvent.addOns.length > 0 && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-3 mt-4">Add-ons</h4>
                      {selectedEvent.addOns.map((addon, index) => (
                        <div key={addon.id} className="mb-2 p-2 bg-green-50 rounded">
                          <div className="text-sm">
                            <div><strong>{addon.name}</strong></div>
                            <div>{addon.description}</div>
                            <div>Price: {addon.price.toLocaleString('en-US')} VND</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {selectedEvent.locations.length > 0 && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-3 mt-4">Locations</h4>
                      {selectedEvent.locations.map((location, index) => (
                        <div key={location.id} className="mb-2 p-2 bg-yellow-50 rounded">
                          <div className="text-sm">
                            <div><strong>{location.name}</strong></div>
                            <div>{location.address}</div>
                            {location.description && <div>{location.description}</div>}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCategory ? "Edit Category" : "Create Category"}
              </h2>
              <button 
                onClick={() => {
                  setShowCategoryModal(false)
                  setEditingCategory(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CategoryForm 
              category={editingCategory}
              onSubmit={(data) => {
                if (editingCategory) {
                  updateCategory({ ...data, id: editingCategory.id })
                } else {
                  createCategory(data)
                }
              }}
              onCancel={() => {
                setShowCategoryModal(false)
                setEditingCategory(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Level Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingLevel ? "Edit Level" : "Create Level"}
              </h2>
              <button 
                onClick={() => {
                  setShowLevelModal(false)
                  setEditingLevel(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <LevelForm 
              level={editingLevel}
              onSubmit={(data) => {
                if (editingLevel) {
                  updateLevel({ ...data, id: editingLevel.id })
                } else {
                  createLevel(data)
                }
              }}
              onCancel={() => {
                setShowLevelModal(false)
                setEditingLevel(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                Confirm Delete
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{itemToDelete.name}"</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setItemToDelete(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (itemToDelete.type === 'category') {
                      deleteCategory(itemToDelete.id)
                    } else {
                      deleteLevel(itemToDelete.id)
                    }
                  }}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  )
}

// Category Form Component
interface CategoryFormProps {
  category?: EventCategory | null
  onSubmit: (data: CreateCategoryRequest) => void
  onCancel: () => void
}

function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.description.trim()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            id="categoryName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter category name"
            required
          />
        </div>
        <div>
          <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="categoryDescription"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter category description"
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          {category ? "Update" : "Create"}
        </button>
      </div>
    </form>
  )
}

// Level Form Component
interface LevelFormProps {
  level?: EventLevel | null
  onSubmit: (data: CreateLevelRequest) => void
  onCancel: () => void
}

function LevelForm({ level, onSubmit, onCancel }: LevelFormProps) {
  const [formData, setFormData] = useState({
    name: level?.name || "",
    description: level?.description || ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.description.trim()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="levelName" className="block text-sm font-medium text-gray-700 mb-1">
            Level Name *
          </label>
          <input
            type="text"
            id="levelName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter level name"
            required
          />
        </div>
        <div>
          <label htmlFor="levelDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="levelDescription"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter level description"
            required
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
        >
          {level ? "Update" : "Create"}
        </button>
      </div>
    </form>
  )
} 