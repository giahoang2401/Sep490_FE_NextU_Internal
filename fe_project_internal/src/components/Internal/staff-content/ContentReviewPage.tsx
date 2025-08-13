"use client"

import { CheckCircle, Send, PenTool, FolderOpen, ArrowLeft, Clock, AlertCircle } from "lucide-react"
import RoleBasedLayout from "../layouts/RoleBasedLayout"
import type { User } from "../types"
import Link from "next/link"

const mockUser: User = {
  id: "6",
  name: "Rachel Green",
  email: "rachel@nextu.com",
  role: "Staff_Content",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

// Mock data for review process
const reviewQueue = [
  { 
    id: 1, 
    title: "NextLiving Safety Guidelines", 
    author: "John Doe", 
    ecosystem: "Living", 
    submittedDate: "2024-01-20", 
    priority: "High", 
    status: "Pending Review",
    content: "Comprehensive safety guidelines for NextLiving residents including emergency procedures, building rules, and safety protocols.",
    feedback: []
  },
  { 
    id: 2, 
    title: "Community Event Best Practices", 
    author: "Jane Smith", 
    ecosystem: "Social", 
    submittedDate: "2024-01-18", 
    priority: "Medium", 
    status: "In Review",
    content: "Best practices for organizing community events, including planning, promotion, and execution strategies.",
    feedback: [
      { reviewer: "Content Manager", comment: "Please add more specific examples for virtual events", date: "2024-01-19" }
    ]
  },
  { 
    id: 3, 
    title: "Career Transition Guide", 
    author: "Mike Johnson", 
    ecosystem: "Career", 
    submittedDate: "2024-01-15", 
    priority: "Low", 
    status: "Approved",
    content: "Complete guide for career transitions including resume building, interview preparation, and networking strategies.",
    feedback: [
      { reviewer: "Content Manager", comment: "Great content! Ready for publication.", date: "2024-01-17" }
    ]
  },
  { 
    id: 4, 
    title: "NextAcademy Course Structure", 
    author: "Sarah Wilson", 
    ecosystem: "Education", 
    submittedDate: "2024-01-22", 
    priority: "High", 
    status: "Needs Revision",
    content: "Detailed structure for NextAcademy courses including curriculum design and assessment methods.",
    feedback: [
      { reviewer: "Academic Director", comment: "Please revise the assessment criteria section", date: "2024-01-23" },
      { reviewer: "Content Manager", comment: "Add more interactive elements", date: "2024-01-23" }
    ]
  },
]

export default function ContentReviewPage() {
  return (
    <RoleBasedLayout role="staff_content" user={mockUser} title="Content Review Management">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
            
            </div>
            <p className="text-gray-600">Gửi nội dung lên duyệt và theo dõi tiến trình phê duyệt</p>
          </div>

          {/* Submit New Content Section */}
          <div className="bg-white shadow-lg rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Send className="h-6 w-6 text-blue-600 mr-3" />
                Submit New Content for Review
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      placeholder="Enter content title..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ecosystem</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select ecosystem...</option>
                        <option>Living</option>
                        <option>Social</option>
                        <option>Career</option>
                        <option>Education</option>
                        <option>Wellness</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Select priority...</option>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      rows={6}
                      placeholder="Enter your content here..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author Notes</label>
                    <textarea
                      rows={4}
                      placeholder="Add any notes for reviewers..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      placeholder="Add tags separated by commas..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Save as Draft
                    </button>
                    <button className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      Submit for Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Queue */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Clock className="h-6 w-6 text-yellow-600 mr-3" />
                Review Queue
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {reviewQueue.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
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
                          item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                    </div>

                    {item.feedback.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reviewer Feedback
                        </h4>
                        <div className="space-y-2">
                          {item.feedback.map((feedback, index) => (
                            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{feedback.reviewer}</p>
                                  <p className="text-sm text-gray-600 mt-1">{feedback.comment}</p>
                                </div>
                                <span className="text-xs text-gray-500">{feedback.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        View Details
                      </button>
                      {item.status === 'Needs Revision' && (
                        <button className="px-3 py-1 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700">
                          Edit & Resubmit
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </RoleBasedLayout>
  )
} 