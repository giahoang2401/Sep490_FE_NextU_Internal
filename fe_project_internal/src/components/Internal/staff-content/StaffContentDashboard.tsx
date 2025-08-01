"use client"

import { FileText, Send, FolderOpen, Edit, Eye, Save, Plus, Calendar, Users, BookOpen, PenTool, CheckCircle, Clock, MapPin, DollarSign, Settings } from "lucide-react"
import RoleBasedLayout from "../layouts/RoleBasedLayout"
import type { User } from "../types"

const mockUser: User = {
  id: "6",
  name: "Rachel Green",
  email: "rachel@nextu.com",
  role: "Staff_Content",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

// Mock data for content management
const contentData = [
  { id: 1, title: "NextLiving Cleaning Guide", category: "NextLiving", ecosystem: "Living", lastEdited: "2 hours ago", status: "Draft", author: "Rachel Green" },
  { id: 2, title: "Community Networking Tips", category: "Community", ecosystem: "Social", lastEdited: "1 day ago", status: "Under Review", author: "Rachel Green" },
  { id: 3, title: "NextWork Career Development", category: "NextWork", ecosystem: "Career", lastEdited: "3 days ago", status: "Published", author: "Rachel Green" },
  { id: 4, title: "NextAcademy Course Intro", category: "NextAcademy", ecosystem: "Education", lastEdited: "1 week ago", status: "Submitted", author: "Rachel Green" },
  { id: 5, title: "Wellness & Health Tips", category: "Health", ecosystem: "Wellness", lastEdited: "2 days ago", status: "Draft", author: "Rachel Green" },
]

// Mock data for events/workshops
const eventsData = [
  { 
    id: 1, 
    title: "Yoga & Wellness Retreat", 
    type: "Sức khỏe & Thể chất", 
    date: "2024-02-15", 
    time: "09:00", 
    duration: "2 hours", 
    location: "NextNest Wellness Center", 
    capacity: 30, 
    registered: 18, 
    price: 150000, 
    status: "Published" 
  },
  { 
    id: 2, 
    title: "Creative Art Workshop", 
    type: "Sáng tạo & Nghệ thuật", 
    date: "2024-02-20", 
    time: "14:00", 
    duration: "3 hours", 
    location: "NextNest Art Studio", 
    capacity: 20, 
    registered: 12, 
    price: 200000, 
    status: "Draft" 
  },
  { 
    id: 3, 
    title: "Vietnamese Cooking Class", 
    type: "Văn hoá & Xã hội", 
    date: "2024-02-25", 
    time: "16:00", 
    duration: "4 hours", 
    location: "NextNest Kitchen", 
    capacity: 15, 
    registered: 8, 
    price: 300000, 
    status: "Under Review" 
  },
]

// Mock data for review queue
const reviewData = [
  { id: 1, title: "NextLiving Safety Guidelines", author: "John Doe", ecosystem: "Living", submittedDate: "2024-01-20", priority: "High", status: "Pending Review" },
  { id: 2, title: "Community Event Best Practices", author: "Jane Smith", ecosystem: "Social", submittedDate: "2024-01-18", priority: "Medium", status: "In Review" },
  { id: 3, title: "Career Transition Guide", author: "Mike Johnson", ecosystem: "Career", submittedDate: "2024-01-15", priority: "Low", status: "Approved" },
]

export default function StaffContentDashboard() {
  return (
    <RoleBasedLayout role="staff_content" user={mockUser} title="Content Management Dashboard">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{contentData.length}</div>
                  <div className="text-sm text-gray-500">Total Content</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{reviewData.length}</div>
                  <div className="text-sm text-gray-500">Pending Review</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{eventsData.length}</div>
                  <div className="text-sm text-gray-500">Events/Workshops</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{eventsData.reduce((sum, event) => sum + event.registered, 0)}</div>
                  <div className="text-sm text-gray-500">Total Participants</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-8">
            {/* Content Management Section */}
            <div className="bg-white shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Content Management</h3>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Content
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">Tạo và quản lý nội dung content liên quan đến ecosystem</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Ecosystem Categories */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Ecosystem Categories</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {['Living', 'Social', 'Career', 'Education', 'Wellness'].map((ecosystem) => (
                        <div key={ecosystem} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{ecosystem}</span>
                            <span className="text-xs text-gray-500">
                              {contentData.filter(item => item.ecosystem === ecosystem).length} items
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Content */}
                  <div className="lg:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-4">Recent Content</h4>
                    <div className="space-y-3">
                      {contentData.slice(0, 4).map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.title}</h5>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <FolderOpen className="h-4 w-4 mr-1" />
                                  {item.ecosystem}
                                </span>
                                <span>Last edited: {item.lastEdited}</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                              item.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                              item.status === 'Published' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Review Section */}
            <div className="bg-white shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-yellow-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Content Review</h3>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">Gửi nội dung lên duyệt và theo dõi tiến trình phê duyệt</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {reviewData.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.title}</h5>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <PenTool className="h-4 w-4 mr-1" />
                              {item.author}
                            </span>
                            <span className="flex items-center">
                              <FolderOpen className="h-4 w-4 mr-1" />
                              {item.ecosystem}
                            </span>
                            <span>Submitted: {item.submittedDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.priority === 'High' ? 'bg-red-100 text-red-800' :
                            item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'Pending Review' ? 'bg-gray-100 text-gray-800' :
                            item.status === 'In Review' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Event/Workshop Management Section */}
            <div className="bg-white shadow-lg rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Event/Workshop Management</h3>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event/Workshop
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">Tạo event/workshop theo quy trình đầy đủ từ thông tin cơ bản đến xuất bản</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Event Categories */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Event Categories</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { name: 'Sức khỏe & Thể chất', description: 'Yoga, Thiền, Spa', icon: '🧘', color: 'bg-blue-50 border-blue-200' },
                        { name: 'Sáng tạo & Nghệ thuật', description: 'Vẽ, Nhiếp ảnh, Âm nhạc', icon: '🎨', color: 'bg-purple-50 border-purple-200' },
                        { name: 'Văn hoá & Xã hội', description: 'Nấu ăn, Học ngôn ngữ, Tour', icon: '🍳', color: 'bg-orange-50 border-orange-200' },
                        { name: 'Giải trí & Thư giãn', description: 'Chiếu phim, Hoạt động mạo hiểm', icon: '🎬', color: 'bg-green-50 border-green-200' }
                      ].map((category, index) => (
                        <div key={index} className={`border rounded-lg p-4 ${category.color} hover:shadow-md transition-shadow cursor-pointer`}>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <h5 className="font-medium text-gray-900">{category.name}</h5>
                              <p className="text-sm text-gray-600">{category.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Current Events */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Current Events/Workshops</h4>
                    <div className="space-y-4">
                      {eventsData.map((event) => (
                        <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{event.title}</h5>
                              <p className="text-sm text-gray-600 mt-1">{event.type}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {event.date} at {event.time}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {event.location}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {event.registered}/{event.capacity} registered
                                </span>
                                <span className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {event.price.toLocaleString('vi-VN')} VND
                                </span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.status === 'Published' ? 'bg-green-100 text-green-800' :
                              event.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </RoleBasedLayout>
  )
}
