"use client"

import React, { useState } from "react"
import { 
  Bell, 
  Plus, 
  Search, 
  Send,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  Filter,
  Home,
  Lightbulb,
  MessageSquare,
  Wrench
} from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User as UserType } from "../types"

const navigation: NavigationItem[] = [
  { name: "NextLiving", href: "/staff-services", icon: Home },
  { name: "Manage Feedback", href: "/staff-services/feedback", icon: MessageSquare },
  { name: "Operation Request", href: "/staff-services/operations", icon: Wrench },
  { name: "Notifications", href: "/staff-services/notifications", icon: Bell, current: true },
]

const mockUser: UserType = {
  id: "5",
  name: "Carlos Martinez", 
  email: "carlos@nextu.com",
  role: "Staff_Services",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

// Mock Notifications Data
const mockNotifications = [
  {
    id: "1",
    title: "Thông báo cắt nước định kỳ",
    content: "Thông báo cắt nước để bảo trì hệ thống từ 8:00 - 12:00 ngày 20/01/2024. Mong mọi người chuẩn bị nước dự trữ.",
    type: "utility",
    priority: "high",
    status: "active",
    targetAudience: "all_residents",
    scheduledDate: "2024-01-18T08:00:00Z",
    createdAt: "2024-01-15T16:00:00Z",
    sentTo: 156,
    readBy: 89,
    createdBy: "Carlos Martinez"
  },
  {
    id: "2",
    title: "Dịch vụ dọn phòng tuần này",
    content: "Lịch dọn phòng tuần này từ thứ 2-6. Vui lòng đăng ký trước 24h qua app hoặc reception.",
    type: "service",
    priority: "medium",
    status: "active", 
    targetAudience: "active_members",
    scheduledDate: "2024-01-16T09:00:00Z",
    createdAt: "2024-01-15T13:20:00Z",
    sentTo: 98,
    readBy: 72,
    createdBy: "Carlos Martinez"
  },
  {
    id: "3",
    title: "Bảo trì thang máy tầng 1-5",
    content: "Thang máy số 1 sẽ được bảo trì từ 9:00 - 17:00 ngày 19/01/2024. Vui lòng sử dụng thang máy số 2.",
    type: "maintenance",
    priority: "high",
    status: "scheduled",
    targetAudience: "all_residents",
    scheduledDate: "2024-01-19T09:00:00Z",
    createdAt: "2024-01-15T10:30:00Z",
    sentTo: 0,
    readBy: 0,
    createdBy: "Carlos Martinez"
  },
  {
    id: "4",
    title: "Khuyến mãi dịch vụ giặt ủi",
    content: "Giảm 20% cho dịch vụ giặt ủi trong tuần này. Áp dụng cho tất cả các gói dịch vụ.",
    type: "service",
    priority: "low",
    status: "active",
    targetAudience: "premium_members",
    scheduledDate: "2024-01-14T10:00:00Z",
    createdAt: "2024-01-14T08:00:00Z",
    sentTo: 45,
    readBy: 32,
    createdBy: "Carlos Martinez"
  },
  {
    id: "5",
    title: "Thông báo cúp điện định kỳ",
    content: "Sẽ có cúp điện từ 22:00 ngày 21/01 đến 6:00 ngày 22/01 để bảo trì hệ thống điện. Generator dự phòng sẽ được kích hoạt.",
    type: "utility",
    priority: "high",
    status: "scheduled",
    targetAudience: "all_residents",
    scheduledDate: "2024-01-21T22:00:00Z",
    createdAt: "2024-01-15T14:45:00Z",
    sentTo: 0,
    readBy: 0,
    createdBy: "Carlos Martinez"
  }
]

export default function ResidentNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [showCreateNotification, setShowCreateNotification] = useState(false)
  const [showEditNotification, setShowEditNotification] = useState(false)
  const [showNotificationDetail, setShowNotificationDetail] = useState(false)
  const [editingNotification, setEditingNotification] = useState<any>(null)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    content: "",
    type: "service",
    priority: "medium", 
    targetAudience: "all_residents",
    scheduledDate: ""
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter
    const matchesType = typeFilter === "all" || notification.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Handle create notification
  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault()
    const newNotification = {
      id: Date.now().toString(),
      ...notificationForm,
      status: notificationForm.scheduledDate ? "scheduled" : "active",
      createdAt: new Date().toISOString(),
      sentTo: notificationForm.targetAudience === "all_residents" ? 156 : 
              notificationForm.targetAudience === "active_members" ? 98 : 45,
      readBy: 0,
      createdBy: mockUser.name
    }
    setNotifications([newNotification, ...notifications])
    resetForm()
    setShowCreateNotification(false)
  }

  // Handle edit notification
  const handleEditNotification = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedNotifications = notifications.map(notif => 
      notif.id === editingNotification.id 
        ? { 
            ...notif, 
            ...notificationForm,
            status: notificationForm.scheduledDate ? "scheduled" : "active",
            sentTo: notificationForm.targetAudience === "all_residents" ? 156 : 
                    notificationForm.targetAudience === "active_members" ? 98 : 45
          }
        : notif
    )
    setNotifications(updatedNotifications)
    resetForm()
    setShowEditNotification(false)
    setEditingNotification(null)
  }

  // Handle delete notification
  const handleDeleteNotification = (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      setNotifications(notifications.filter(notif => notif.id !== id))
    }
  }

  // Reset form
  const resetForm = () => {
    setNotificationForm({
      title: "",
      content: "",
      type: "service",
      priority: "medium",
      targetAudience: "all_residents", 
      scheduledDate: ""
    })
  }

  // Open edit modal
  const openEditModal = (notification: any) => {
    setEditingNotification(notification)
    setNotificationForm({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      priority: notification.priority,
      targetAudience: notification.targetAudience,
      scheduledDate: notification.scheduledDate ? notification.scheduledDate.slice(0, 16) : ""
    })
    setShowEditNotification(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100"
      case "medium": return "text-yellow-600 bg-yellow-100"
      case "low": return "text-green-600 bg-green-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-emerald-600 bg-emerald-100"
      case "scheduled": return "text-blue-600 bg-blue-100"
      case "sent": return "text-purple-600 bg-purple-100"
      case "cancelled": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "service": return "text-blue-600 bg-blue-100"
      case "utility": return "text-orange-600 bg-orange-100" 
      case "announcement": return "text-purple-600 bg-purple-100"
      case "maintenance": return "text-yellow-600 bg-yellow-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Services Staff" />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Resident Notifications" />
        
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                  <div className="text-sm text-gray-600">Total Notifications</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {notifications.filter(n => n.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {notifications.filter(n => n.status === 'scheduled').length}
                  </div>
                  <div className="text-sm text-gray-600">Scheduled</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {notifications.reduce((total, n) => total + n.sentTo, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Recipients</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-purple-600" />
                  Tạo thông báo cho cư dân (tiện dịch vụ, điện nước)
                </h3>
                <button
                  onClick={() => setShowCreateNotification(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Notification
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="mt-4 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="sent">Sent</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="service">Service (Tiện dịch vụ)</option>
                  <option value="utility">Utility (Điện nước)</option>
                  <option value="announcement">Announcement</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              {/* Results Summary */}
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{notification.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          <span className="text-sm text-gray-600">• {notification.targetAudience.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{notification.content}</p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">Sent to:</span>
                        <p className="font-medium">{notification.sentTo} residents</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Read by:</span>
                        <p className="font-medium">{notification.readBy} residents</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Scheduled:</span>
                        <p className="font-medium">
                          {notification.scheduledDate 
                            ? new Date(notification.scheduledDate).toLocaleDateString()
                            : "Immediate"
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium">{new Date(notification.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedNotification(notification)
                          setShowNotificationDetail(true)
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(notification)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Create Notification Modal */}
          {showCreateNotification && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Create Resident Notification</h3>
                    <button
                      onClick={() => setShowCreateNotification(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleCreateNotification} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter notification title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                    <textarea
                      required
                      value={notificationForm.content}
                      onChange={(e) => setNotificationForm({...notificationForm, content: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={4}
                      placeholder="Enter notification content"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="service">Service (Tiện dịch vụ)</option>
                        <option value="utility">Utility (Điện nước)</option>
                        <option value="announcement">Announcement</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={notificationForm.priority}
                        onChange={(e) => setNotificationForm({...notificationForm, priority: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                      <select
                        value={notificationForm.targetAudience}
                        onChange={(e) => setNotificationForm({...notificationForm, targetAudience: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="all_residents">All Residents</option>
                        <option value="active_members">Active Members</option>
                        <option value="premium_members">Premium Members</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={notificationForm.scheduledDate}
                      onChange={(e) => setNotificationForm({...notificationForm, scheduledDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateNotification(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Notification Modal */}
          {showEditNotification && editingNotification && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Notification</h3>
                    <button
                      onClick={() => setShowEditNotification(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleEditNotification} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({...notificationForm, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter notification title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                    <textarea
                      required
                      value={notificationForm.content}
                      onChange={(e) => setNotificationForm({...notificationForm, content: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={4}
                      placeholder="Enter notification content"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm({...notificationForm, type: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="service">Service (Tiện dịch vụ)</option>
                        <option value="utility">Utility (Điện nước)</option>
                        <option value="announcement">Announcement</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={notificationForm.priority}
                        onChange={(e) => setNotificationForm({...notificationForm, priority: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                      <select
                        value={notificationForm.targetAudience}
                        onChange={(e) => setNotificationForm({...notificationForm, targetAudience: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="all_residents">All Residents</option>
                        <option value="active_members">Active Members</option>
                        <option value="premium_members">Premium Members</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={notificationForm.scheduledDate}
                      onChange={(e) => setNotificationForm({...notificationForm, scheduledDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditNotification(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Notification
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notification Detail Modal */}
          {showNotificationDetail && selectedNotification && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">Notification Details</h3>
                    <button
                      onClick={() => setShowNotificationDetail(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">{selectedNotification.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedNotification.type)}`}>
                          {selectedNotification.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                          {selectedNotification.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedNotification.status)}`}>
                          {selectedNotification.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Content:</h5>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedNotification.content}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Target Audience:</h5>
                        <p className="text-gray-700 capitalize">{selectedNotification.targetAudience.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Created by:</h5>
                        <p className="text-gray-700">{selectedNotification.createdBy}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Sent to:</h5>
                        <p className="text-gray-700">{selectedNotification.sentTo} residents</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Read by:</h5>
                        <p className="text-gray-700">{selectedNotification.readBy} residents</p>
                      </div>
                    </div>
                    
                    {selectedNotification.scheduledDate && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Scheduled Date:</h5>
                        <p className="text-gray-700">{new Date(selectedNotification.scheduledDate).toLocaleString()}</p>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Created Date:</h5>
                      <p className="text-gray-700">{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  )
}