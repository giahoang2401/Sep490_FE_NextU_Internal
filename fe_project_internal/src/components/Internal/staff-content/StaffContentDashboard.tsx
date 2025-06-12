"use client"

import { FileText, Send, FolderOpen, Edit, Eye, Save, Plus } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User } from "../types"

const navigation: NavigationItem[] = [
  { name: "Create Content", href: "/internal/staff-content", icon: Edit, current: true },
  { name: "Submit for Review", href: "/internal/staff-content/submit", icon: Send },
  { name: "Drafts", href: "/internal/staff-content/drafts", icon: FolderOpen },
]

const mockUser: User = {
  id: "6",
  name: "Rachel Green",
  email: "rachel@nextu.com",
  role: "Staff_Content",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

const draftContent = [
  { title: "NextLiving Cleaning Guide", category: "NextLiving", lastEdited: "2 hours ago", status: "Draft" },
  { title: "Community Event Planning", category: "Community", lastEdited: "1 day ago", status: "Draft" },
  { title: "House Rules Update", category: "Guidelines", lastEdited: "3 days ago", status: "Draft" },
  { title: "NextAcademy Course Intro", category: "NextAcademy", lastEdited: "1 week ago", status: "Submitted" },
]

export default function StaffContentDashboard() {
  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Content Staff" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Content Creation Studio" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Content Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-500">Drafts</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">3</div>
                  <div className="text-sm text-gray-500">Submitted</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-500">Published</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">23</div>
                  <div className="text-sm text-gray-500">Total Content</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Content Editor</h3>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-2" />
                      Submit for Review
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        placeholder="Enter content title..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Select category...</option>
                          <option>NextLiving Guide</option>
                          <option>NextAcademy Course</option>
                          <option>Community Tips</option>
                          <option>House Rules</option>
                          <option>Guidelines</option>
                          <option>FAQ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                        <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Select audience...</option>
                          <option>All Members</option>
                          <option>New Members</option>
                          <option>Premium Members</option>
                          <option>Students</option>
                          <option>Professionals</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        rows={12}
                        placeholder="Start writing your content here..."
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                        <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload files or drag and drop</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Content Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Drafted</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">8 items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Submitted</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">3 items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Under Review</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">2 items</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Published</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">12 items</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Drafts</h3>
                <div className="space-y-3">
                  {draftContent.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                      <div className="font-medium text-sm text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                      <div className="text-xs text-gray-400 mt-1">Last edited {item.lastEdited}</div>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                          item.status === "Draft" ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Content Templates</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                    NextLiving Guide Template
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                    Course Material Template
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                    Community Post Template
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                    FAQ Template
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                    Guidelines Template
                  </button>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Content Guidelines</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Keep content clear and concise</p>
                  <p>• Use Next U brand voice and tone</p>
                  <p>• Include relevant examples</p>
                  <p>• Add proper tags for searchability</p>
                  <p>• Review for grammar and spelling</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RoleLayout>
  )
}
