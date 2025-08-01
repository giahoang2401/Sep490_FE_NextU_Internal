"use client"

import React, { useState } from "react"
import { 
  Wrench, 
  Plus, 
  Search, 
  Calendar,
  User,
  Clock,
  Filter,
  Edit,
  Trash2,
  Home,
  Lightbulb,
  MessageSquare,
  Bell
} from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User as UserType } from "../types"

const navigation: NavigationItem[] = [
  { name: "NextLiving", href: "/staff-services", icon: Home },
  { name: "Manage Feedback", href: "/staff-services/feedback", icon: MessageSquare },
  { name: "Operation Request", href: "/staff-services/operations", icon: Wrench, current: true },
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

// Mock Operation Request Data
const mockOperationRequests = [
  {
    id: "1",
    title: "Bảo trì hệ thống điều hòa tầng 2",
    description: "Kiểm tra và bảo trì định kỳ hệ thống điều hòa tại tầng 2, phòng 201-210",
    category: "Maintenance",
    priority: "high",
    status: "pending",
    assignedTo: "Nguyễn Văn Tùng",
    requestedBy: "Carlos Martinez",
    estimatedTime: "4 hours",
    scheduledDate: "2024-01-20T08:00:00Z",
    createdAt: "2024-01-15T14:30:00Z",
    notes: "Cần chuẩn bị thiết bị thay thế"
  },
  {
    id: "2",
    title: "Dọn dẹp khu vực chung tầng 1",
    description: "Vệ sinh tổng thể khu vực sảnh, phòng họp và khu vực giải trí tầng 1",
    category: "Cleaning",
    priority: "medium",
    status: "in_progress", 
    assignedTo: "Trần Thị Hoa",
    requestedBy: "Carlos Martinez",
    estimatedTime: "2 hours",
    scheduledDate: "2024-01-16T07:00:00Z",
    createdAt: "2024-01-15T11:15:00Z",
    notes: "Ưu tiên khu vực sảnh chính"
  },
  {
    id: "3",
    title: "Sửa chữa hệ thống wifi tầng 3",
    description: "Khắc phục sự cố mạng wifi chậm tại khu vực tầng 3, kiểm tra router và cáp mạng",
    category: "Technical",
    priority: "high",
    status: "completed",
    assignedTo: "Lê Minh Quang",
    requestedBy: "Carlos Martinez", 
    estimatedTime: "3 hours",
    scheduledDate: "2024-01-14T13:00:00Z",
    createdAt: "2024-01-14T09:30:00Z",
    notes: "Đã hoàn thành nâng cấp router"
  },
  {
    id: "4",
    title: "Kiểm tra an ninh camera tầng hầm",
    description: "Kiểm tra và bảo trì hệ thống camera an ninh tại khu vực tầng hầm và bãi xe",
    category: "Security",
    priority: "medium",
    status: "pending",
    assignedTo: "Phạm Văn An",
    requestedBy: "Carlos Martinez",
    estimatedTime: "2 hours", 
    scheduledDate: "2024-01-18T14:00:00Z",
    createdAt: "2024-01-15T16:45:00Z",
    notes: "Cần kiểm tra camera số 7 và 12"
  }
]

export default function OperationRequest() {
  const [operationRequests, setOperationRequests] = useState(mockOperationRequests)
  const [showCreateRequest, setShowCreateRequest] = useState(false)
  const [showEditRequest, setShowEditRequest] = useState(false)
  const [editingRequest, setEditingRequest] = useState<any>(null)
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    assignedTo: "",
    estimatedTime: "",
    scheduledDate: "",
    notes: ""
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Filter requests
  const filteredRequests = operationRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesCategory = categoryFilter === "all" || request.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Handle create operation request
  const handleCreateOperationRequest = (e: React.FormEvent) => {
    e.preventDefault()
    const newRequest = {
      id: Date.now().toString(),
      ...requestForm,
      status: "pending",
      requestedBy: mockUser.name,
      createdAt: new Date().toISOString()
    }
    setOperationRequests([newRequest, ...operationRequests])
    resetForm()
    setShowCreateRequest(false)
  }

  // Handle edit operation request
  const handleEditOperationRequest = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedRequests = operationRequests.map(req => 
      req.id === editingRequest.id 
        ? { ...req, ...requestForm }
        : req
    )
    setOperationRequests(updatedRequests)
    resetForm()
    setShowEditRequest(false)
    setEditingRequest(null)
  }

  // Handle delete request
  const handleDeleteRequest = (id: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      setOperationRequests(operationRequests.filter(req => req.id !== id))
    }
  }

  // Reset form
  const resetForm = () => {
    setRequestForm({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      assignedTo: "",
      estimatedTime: "",
      scheduledDate: "",
      notes: ""
    })
  }

  // Open edit modal
  const openEditModal = (request: any) => {
    setEditingRequest(request)
    setRequestForm({
      title: request.title,
      description: request.description,
      category: request.category,
      priority: request.priority,
      assignedTo: request.assignedTo,
      estimatedTime: request.estimatedTime,
      scheduledDate: request.scheduledDate ? request.scheduledDate.slice(0, 16) : "",
      notes: request.notes
    })
    setShowEditRequest(true)
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
      case "pending": return "text-orange-600 bg-orange-100"
      case "in_progress": return "text-blue-600 bg-blue-100"
      case "completed": return "text-green-600 bg-green-100"
      case "cancelled": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Services Staff" />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Operation Request Management" />
        
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wrench className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{operationRequests.length}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {operationRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {operationRequests.filter(r => r.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-gray-600">In Progress</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {operationRequests.filter(r => r.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Operation Requests Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-green-600" />
                  Create Operation Request
                </h3>
                <button
                  onClick={() => setShowCreateRequest(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Request
                </button>
              </div>
              
              {/* Search and Filters */}
              <div className="mt-4 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Technical">Technical</option>
                  <option value="Security">Security</option>
                </select>
              </div>
              
              {/* Results Summary */}
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredRequests.length} of {operationRequests.length} requests
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">Category: {request.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{request.description}</p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">Assigned to:</span>
                        <p className="font-medium">{request.assignedTo}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Estimated time:</span>
                        <p className="font-medium">{request.estimatedTime}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Scheduled:</span>
                        <p className="font-medium">
                          {request.scheduledDate 
                            ? new Date(request.scheduledDate).toLocaleDateString()
                            : "Not scheduled"
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-500">Notes:</span>
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">{request.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(request)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
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

          {/* Create Request Modal */}
          {showCreateRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Create Operation Request</h3>
                    <button
                      onClick={() => setShowCreateRequest(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleCreateOperationRequest} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.title}
                      onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter request title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      required
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={3}
                      placeholder="Describe the operation request"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        required
                        value={requestForm.category}
                        onChange={(e) => setRequestForm({...requestForm, category: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Category</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Technical">Technical</option>
                        <option value="Security">Security</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={requestForm.priority}
                        onChange={(e) => setRequestForm({...requestForm, priority: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <input
                        type="text"
                        value={requestForm.assignedTo}
                        onChange={(e) => setRequestForm({...requestForm, assignedTo: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter assignee name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                      <input
                        type="text"
                        value={requestForm.estimatedTime}
                        onChange={(e) => setRequestForm({...requestForm, estimatedTime: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 2 hours"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                    <input
                      type="datetime-local"
                      value={requestForm.scheduledDate}
                      onChange={(e) => setRequestForm({...requestForm, scheduledDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={requestForm.notes}
                      onChange={(e) => setRequestForm({...requestForm, notes: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={2}
                      placeholder="Additional notes"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateRequest(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Request Modal */}
          {showEditRequest && editingRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Operation Request</h3>
                    <button
                      onClick={() => setShowEditRequest(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <form onSubmit={handleEditOperationRequest} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.title}
                      onChange={(e) => setRequestForm({...requestForm, title: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter request title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      required
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({...requestForm, description: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={3}
                      placeholder="Describe the operation request"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        required
                        value={requestForm.category}
                        onChange={(e) => setRequestForm({...requestForm, category: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select Category</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Technical">Technical</option>
                        <option value="Security">Security</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={requestForm.priority}
                        onChange={(e) => setRequestForm({...requestForm, priority: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <input
                        type="text"
                        value={requestForm.assignedTo}
                        onChange={(e) => setRequestForm({...requestForm, assignedTo: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter assignee name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                      <input
                        type="text"
                        value={requestForm.estimatedTime}
                        onChange={(e) => setRequestForm({...requestForm, estimatedTime: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 2 hours"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date</label>
                    <input
                      type="datetime-local"
                      value={requestForm.scheduledDate}
                      onChange={(e) => setRequestForm({...requestForm, scheduledDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={requestForm.notes}
                      onChange={(e) => setRequestForm({...requestForm, notes: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={2}
                      placeholder="Additional notes"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditRequest(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  )
}