"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, X, Search, Filter, MoreVertical, Mail, Phone, Shield, Calendar, Edit, Trash2, Eye } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import DataTable from "../shared/dataTable"
import CreateAccountForm from "../shared/createAccountForm"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User, TableColumn, CreateAccountData } from "../types"
import api from "../../../utils/axiosConfig"
import { getNavigationForRole } from "../navigation"



const availableStaffRoles = ["Manager", "Staff_Onboarding", "Staff_Services", "Staff_Content"]

const availablePartnerRoles = ["Partner_Coaching", "Partner_Services", "Partner_Content"]

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}



const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

export default function AdminDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormType, setCreateFormType] = useState<"staff" | "partner">("staff")
  const [adminLocationId, setAdminLocationId] = useState<string>("")
  const [adminName, setAdminName] = useState<string>("")
  const [adminEmail, setAdminEmail] = useState<string>("")
  const [adminRole, setAdminRole] = useState<string>("")
  const [adminPropertyName, setAdminPropertyName] = useState<string>("")
  const [staffData, setStaffData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Notification states
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    show: boolean
  }>({
    type: 'info',
    message: '',
    show: false
  })
  
  // Loading state
  const [isCreating, setIsCreating] = useState(false)

  // Get navigation for admin role
  const navigation = getNavigationForRole("admin", "/admin")

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("nextu_internal_user")
      if (userStr) {
        const user = JSON.parse(userStr)
        setAdminLocationId(user.location || "")
        setAdminName(user.name || "")
        setAdminEmail(user.email || "")
        setAdminRole(user.role || "")
        setAdminPropertyName(user.property_name || "")
      }
    }
    
    // Fetch staff data
    fetchStaffData()
  }, [])

  const fetchStaffData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/auth/management/subordinates")
      
      if (response.status === 200) {
        // Transform the API data to match our table structure
        const transformedData = response.data.map((staff: any) => ({
          ...staff,
          status: staff.isLocked ? "Locked" : "Active"
        }))
        setStaffData(transformedData)
      }
    } catch (error) {
      console.error("Failed to fetch staff data:", error)
      showNotification('error', 'Failed to fetch staff data')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true })
    setTimeout(() => {
      setNotification({ type: 'info', message: '', show: false })
    }, 5000)
  }

  const validateFormData = (data: CreateAccountData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Required field validation
    if (!validateRequired(data.name)) {
      errors.push("Full name is required")
    }
    
    if (!validateRequired(data.email)) {
      errors.push("Email is required")
    } else if (!validateEmail(data.email)) {
      errors.push("Please enter a valid email address")
    }
    
    if (!validateRequired(data.role)) {
      errors.push("Role is required")
    }
    
    if (!validateRequired(data.location)) {
      errors.push("Location is required")
    }

    // Profile info validation
    if (data.profileInfo) {
      if (!validateRequired(data.profileInfo.phone)) {
        errors.push("Phone number is required")
      }
      
      if (!validateRequired(data.profileInfo.gender)) {
        errors.push("Gender is required")
      }
      
      if (!validateRequired(data.profileInfo.dob)) {
        errors.push("Date of birth is required")
      }
      
      if (!validateRequired(data.profileInfo.department)) {
        errors.push("Department is required")
      }
      
      if (!validateRequired(data.profileInfo.level)) {
        errors.push("Level is required")
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const handleCreateAccount = async (data: CreateAccountData) => {
    // Validate form data
    const validation = validateFormData(data)
    if (!validation.isValid) {
      showNotification('error', `Validation failed: ${validation.errors.join(', ')}`)
      return
    }

    setIsCreating(true)
    
    try {
      // Lấy locationId từ admin (từ localStorage)
      const locationId = adminLocationId
      
      if (!locationId) {
        throw new Error("Admin location not found")
      }

      const payload = {
        userName: data.name,
        email: data.email,
        // Không truyền password cho nhân viên
        locationId: locationId,
        skipPasswordCreation: true,
        profileInfo: {
          phone: data.profileInfo?.phone,
          gender: data.profileInfo?.gender,
          dob: data.profileInfo?.dob,
          locationId: locationId,
          note: data.profileInfo?.note || "",
          department: data.profileInfo?.department,
          level: data.profileInfo?.level,
        }
      }

      // Xác định endpoint dựa vào role
      let endpoint = ""
      let roleDisplayName = ""
      
      switch (data.role) {
        case "Manager":
          endpoint = "/api/auth/admin/register/manager"
          roleDisplayName = "Manager"
          break
        case "Staff_Onboarding":
          endpoint = "/api/auth/admin/register/staff-onboarding"
          roleDisplayName = "Staff Onboarding"
          break
        case "Staff_Services":
          endpoint = "/api/auth/admin/register/staff-service"
          roleDisplayName = "Staff Services"
          break
        case "Staff_Content":
          endpoint = "/api/auth/admin/register/staff-content"
          roleDisplayName = "Staff Content"
          break
        default:
          throw new Error("Invalid staff role selected")
      }

      const response = await api.post(endpoint, payload)
      
      if (response.status === 200 || response.status === 201) {
        showNotification('success', `Successfully created ${roleDisplayName} account for ${data.name}`)
        setShowCreateForm(false)
        // Refresh staff list after creating new account
        fetchStaffData()
      } else {
        throw new Error("Failed to create account")
      }
      
    } catch (error: any) {
      console.error("Account creation error:", error)
      
      let errorMessage = "Failed to create account"
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error_description) {
        errorMessage = error.response.data.error_description
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showNotification('error', errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  const renderStaffActions = (row: any) => (
    <div className="flex items-center space-x-2">
      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
        <Eye className="h-4 w-4" />
      </button>
      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
        <Edit className="h-4 w-4" />
      </button>
      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )

  const openCreateForm = (type: "staff" | "partner") => {
    setCreateFormType(type)
    setShowCreateForm(true)
  }

  // Filter staff data based on search term
  const filteredStaffData = staffData.filter(staff =>
    staff.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.roleName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  return (
    <RoleLayout>
          <Sidebar navigation={navigation} title="Next U" userRole="Admin" />


      <div className="lg:pl-64 flex flex-col flex-1 bg-gray-50">
        <TopNav 
          user={{
            id: "1",
            name: adminName || "Admin",
            email: adminEmail || "admin@nextu.com",
            role: adminRole || "Admin",
            location: adminPropertyName || "Location not set",
            region: "West Coast",
            avatar: "/placeholder.svg?height=32&width=32",
          }} 
          title="Staff Management" 
        />

        {/* Notification Banner */}
        {notification.show && (
          <div className={`fixed top-20 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
            notification.type === 'success' ? 'border-l-4 border-green-400' :
            notification.type === 'error' ? 'border-l-4 border-red-400' :
            'border-l-4 border-blue-400'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && <Users className="h-6 w-6 text-green-400" />}
                  {notification.type === 'error' && <Users className="h-6 w-6 text-red-400" />}
                  {notification.type === 'info' && <Users className="h-6 w-6 text-blue-400" />}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' :
                    notification.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setNotification({ ...notification, show: false })}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 lg:p-8">
         

          {/* Staff List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Staff List ({filteredStaffData.length} staff members)
                  </h3>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => openCreateForm("staff")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading staff data...</p>
                <p className="text-sm text-gray-500">Please wait while we fetch the latest information</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStaffData.map((staff, index) => (
                      <tr key={staff.accountId} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {getInitials(staff.username)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{staff.username}</div>
                              <div className="text-sm text-gray-500">{staff.accountId?.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{staff.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {staff.roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            staff.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              staff.status === 'Active' ? 'bg-green-400' : 'bg-red-400'
                            }`}></span>
                            {staff.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {staff.locationName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {renderStaffActions(staff)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Account Form Modal */}
      {showCreateForm && (
        <CreateAccountForm
          userType={createFormType}
          availableRoles={createFormType === "staff" ? availableStaffRoles : availablePartnerRoles}
          availableLocations={[{ 
            id: adminLocationId, 
            name: adminLocationId, 
            description: "Admin's assigned location",
            locationId: adminLocationId,
            locationName: adminPropertyName || "Admin Location",
            cityId: "00000000-0000-0000-0000-000000000000",
            cityName: "Unknown City"
          }]}
          onSubmit={handleCreateAccount}
          onCancel={() => setShowCreateForm(false)}
          isLoading={isCreating}
        />
      )}
    </RoleLayout>
  )
}
