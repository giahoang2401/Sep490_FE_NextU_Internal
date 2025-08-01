"use client"

import React, { useState } from "react"
import { 
  MessageSquare, 
  Search, 
  Star, 
  Clock, 
  Eye,
  Reply,
  Home,
  Lightbulb,
  Wrench,
  Bell
} from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User as UserType } from "../types"

const navigation: NavigationItem[] = [
  { name: "NextLiving", href: "/staff-services", icon: Home },
  { name: "Manage Feedback", href: "/staff-services/feedback", icon: MessageSquare, current: true },
  { name: "Operation Request", href: "/staff-services/operations", icon: Wrench },
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

// Mock Feedback Data
const mockFeedbacks = [
  {
    id: "1",
    user: "Nguyễn Minh Hoàng",
    email: "hoang@nextu.com",
    subject: "Vấn đề về dịch vụ dọn phòng",
    content: "Dịch vụ dọn phòng tuần này chưa được thực hiện. Tôi đã đăng ký từ thứ 2 nhưng đến giờ vẫn chưa có ai liên hệ.",
    category: "Cleaning Service",
    priority: "high",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    rating: null,
    response: null,
    attachments: ["complaint_photo.jpg"]
  },
  {
    id: "2", 
    user: "Trần Thị Mai",
    email: "mai@nextu.com",
    subject: "Cảm ơn dịch vụ bảo trì",
    content: "Cảm ơn team bảo trì đã sửa chữa máy lạnh rất nhanh chóng. Dịch vụ rất chuyên nghiệp!",
    category: "Maintenance",
    priority: "low",
    status: "responded",
    createdAt: "2024-01-14T15:45:00Z",
    rating: 5,
    response: "Cảm ơn bạn đã phản hồi tích cực! Chúng tôi luôn cố gắng mang đến dịch vụ tốt nhất.",
    attachments: []
  },
  {
    id: "3",
    user: "Lê Văn Đức", 
    email: "duc@nextu.com",
    subject: "Đề xuất cải thiện wifi",
    content: "Tốc độ wifi ở tầng 3 khá chậm, đặc biệt là buổi tối. Có thể cải thiện được không?",
    category: "Technical",
    priority: "medium", 
    status: "in_progress",
    createdAt: "2024-01-13T09:20:00Z",
    rating: null,
    response: "Chúng tôi đang kiểm tra và sẽ nâng cấp hệ thống trong tuần tới.",
    attachments: ["wifi_speed_test.png"]
  },
  {
    id: "4",
    user: "Phạm Thu Hà",
    email: "ha@nextu.com", 
    subject: "Phản hồi về dịch vụ giặt ủi",
    content: "Dịch vụ giặt ủi rất tốt, quần áo được giặt sạch và thơm. Nhân viên rất friendly.",
    category: "Laundry Service",
    priority: "low",
    status: "responded",
    createdAt: "2024-01-12T14:20:00Z",
    rating: 4,
    response: "Cảm ơn bạn đã sử dụng dịch vụ và để lại phản hồi tích cực!",
    attachments: []
  },
  {
    id: "5",
    user: "Võ Minh Tâm",
    email: "tam@nextu.com",
    subject: "Khiếu nại về tiếng ồn",
    content: "Phòng bên cạnh thường xuyên gây tiếng ồn vào ban đêm, ảnh hưởng đến giấc ngủ. Mong được hỗ trợ giải quyết.",
    category: "Noise Complaint",
    priority: "high",
    status: "pending",
    createdAt: "2024-01-11T22:30:00Z",
    rating: null,
    response: null,
    attachments: []
  }
]

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState(mockFeedbacks)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [showFeedbackDetail, setShowFeedbackDetail] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [feedbackFilter, setFeedbackFilter] = useState("all")
  const [feedbackSearch, setFeedbackSearch] = useState("")

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesFilter = feedbackFilter === "all" || feedback.status === feedbackFilter
    const matchesSearch = feedback.subject.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                         feedback.user.toLowerCase().includes(feedbackSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Handle feedback response
  const handleRespondToFeedback = () => {
    if (!responseText.trim()) return
    
    const updatedFeedbacks = feedbacks.map(f => 
      f.id === selectedFeedback.id 
        ? { ...f, response: responseText, status: "responded" }
        : f
    )
    setFeedbacks(updatedFeedbacks)
    setResponseText("")
    setShowFeedbackDetail(false)
    setSelectedFeedback(null)
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
      case "responded": return "text-green-600 bg-green-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Services Staff" />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Feedback Management" />
        
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{feedbacks.length}</div>
                  <div className="text-sm text-gray-600">Total Feedbacks</div>
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
                    {feedbacks.filter(f => f.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Response</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Reply className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {feedbacks.filter(f => f.status === 'responded').length}
                  </div>
                  <div className="text-sm text-gray-600">Responded</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">4.2</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Manage Feedback & Answer Feedback
                </h3>
              </div>
              
              {/* Search and Filter */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search feedbacks..."
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={feedbackFilter}
                  onChange={(e) => setFeedbackFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="responded">Responded</option>
                </select>
              </div>
              
              {/* Results Summary */}
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {filteredFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{feedback.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">By: {feedback.user} • {feedback.category}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                          {feedback.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                          {feedback.status}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{feedback.content}</p>
                    
                    {feedback.rating && (
                      <div className="flex items-center mb-3">
                        <span className="text-sm text-gray-600 mr-2">Rating:</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">({feedback.rating}/5)</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback)
                          setShowFeedbackDetail(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Detail Modal */}
          {showFeedbackDetail && selectedFeedback && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">Feedback Details</h3>
                    <button
                      onClick={() => setShowFeedbackDetail(false)}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">{selectedFeedback.subject}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>From: {selectedFeedback.user}</span>
                        <span>{selectedFeedback.email}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedFeedback.priority)}`}>
                          {selectedFeedback.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Content:</h5>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedFeedback.content}</p>
                    </div>
                    
                    {selectedFeedback.rating && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Rating:</h5>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${i < selectedFeedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="ml-2 text-gray-600">({selectedFeedback.rating}/5)</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedFeedback.response && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Your Response:</h5>
                        <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">{selectedFeedback.response}</p>
                      </div>
                    )}
                    
                    {selectedFeedback.status === "pending" && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Respond to Feedback:</h5>
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type your response here..."
                          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                        />
                        <div className="flex justify-end gap-3 mt-4">
                          <button
                            onClick={() => setShowFeedbackDetail(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleRespondToFeedback}
                            disabled={!responseText.trim()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            Send Response
                          </button>
                        </div>
                      </div>
                    )}
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