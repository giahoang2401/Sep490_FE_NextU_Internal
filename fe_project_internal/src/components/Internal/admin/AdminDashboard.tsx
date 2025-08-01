"use client"

import { useState, useEffect } from "react"
import { MapPin, Users, UserPlus, BarChart3, Briefcase, DoorOpen } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import DashboardCard from "../shared/dashboardCard"
import DataTable from "../shared/dataTable"
import CreateAccountForm from "../shared/createAccountForm"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User, TableColumn, CreateAccountData } from "../types"
import api from "../../../utils/axiosConfig";  

const navigation: NavigationItem[] = [
  { name: "Regional Dashboard", href: "/admin", icon: MapPin, current: true },
  { name: "Manage Users", href: "/admin/users", icon: Users },
  { name: "Manage Staff", href: "/admin/staff", icon: UserPlus },
  { name: "Room Management", href: "/admin/rooms", icon: DoorOpen },
  { name: "Regional Reports", href: "/admin/reports", icon: BarChart3 },
]

const mockUser: User = {
  id: "2",
  name: "Jane Smith",
  email: "jane@nextu.com",
  role: "Admin",
  location: "San Francisco, CA",
  region: "West Coast",
  avatar: "/placeholder.svg?height=32&width=32",
}

const staffColumns: TableColumn[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "status", label: "Status" },
]

const staffData = [
  { name: "Mike Johnson", email: "mike@nextu.com", role: "Manager", status: "Active" },
  { name: "Emily Chen", email: "emily@nextu.com", role: "Staff_Membership", status: "Active" },
  { name: "Carlos Martinez", email: "carlos@nextu.com", role: "Staff_Services", status: "Active" },
  { name: "Rachel Green", email: "rachel@nextu.com", role: "Staff_Content", status: "Pending" },
]

const availableStaffRoles = ["Manager", "Staff_Onboarding", "Staff_Services", "Staff_Content"]

const availablePartnerRoles = ["Partner_Coaching", "Partner_Services", "Partner_Content"]

export default function AdminDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormType, setCreateFormType] = useState<"staff" | "partner">("staff")
  const [adminLocationId, setAdminLocationId] = useState<string>("")
  const [adminName, setAdminName] = useState<string>("")

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("nextu_internal_user")
      if (userStr) {
        const user = JSON.parse(userStr)
        setAdminLocationId(user.location)
        setAdminName(user.name)
      }
    }
  }, [])

  const handleCreateAccount = async (data: CreateAccountData) => {
    // Lấy locationId từ admin (từ localStorage)
    const locationId = adminLocationId;
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
        note: data.profileInfo?.note,
        department: data.profileInfo?.department,
        level: data.profileInfo?.level,
      }
    };
    // Xác định endpoint dựa vào role
    let endpoint = "";
    switch (data.role) {
      case "Manager":
        endpoint = "/api/auth/admin/register/manager";
        break;
      case "Staff_Onboarding":
        endpoint = "/api/auth/admin/register/staff-onboarding";
        break;
      case "Staff_Services":
        endpoint = "/api/auth/admin/register/staff-service";
        break;
      case "Staff_Content":
        endpoint = "/api/auth/admin/register/staff-content";
        break;
      default:
        alert("Invalid staff role selected");
        return;
    }
    try {
      await api.post(endpoint, payload);
      setShowCreateForm(false);
      // TODO: reload staff list nếu cần
    } catch (error) {
      alert("Tạo tài khoản thất bại");
      console.error(error);
    }
  }

  const renderStaffActions = (row: any) => (
    <div className="flex space-x-2">
      <button className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200">Edit</button>
      <button className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full hover:bg-yellow-200">
        Suspend
      </button>
    </div>
  )

  const openCreateForm = (type: "staff" | "partner") => {
    setCreateFormType(type)
    setShowCreateForm(true)
  }

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Regional Admin" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Regional Dashboard - West Coast" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Regional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard title="Regional Users" value="2,847" change="+8%" changeType="increase" icon={Users} />
            <DashboardCard title="Staff Members" value="24" change="+2" changeType="increase" icon={UserPlus} />
            <DashboardCard title="Partners" value="18" change="+3" changeType="increase" icon={Briefcase} />
            <DashboardCard title="Occupancy Rate" value="94%" change="+3%" changeType="increase" icon={BarChart3} />
          </div>

          {/* Account Creation Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Management</h3>
              <div className="space-y-3">
                <button
                  onClick={() => openCreateForm("staff")}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <div className="font-medium text-blue-900">Add Staff Member</div>
                  <div className="text-sm text-blue-700">Create Manager, Membership, Services, or Content staff</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                  <div className="font-medium text-green-900">Bulk Import Staff</div>
                  <div className="text-sm text-green-700">Upload CSV file with staff data</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                  <div className="font-medium text-purple-900">Staff Training</div>
                  <div className="text-sm text-purple-700">Schedule onboarding sessions</div>
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Partner Management</h3>
              <div className="space-y-3">
                <button
                  onClick={() => openCreateForm("partner")}
                  className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                >
                  <div className="font-medium text-orange-900">Add Partner</div>
                  <div className="text-sm text-orange-700">Create coaching or service partner account</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors">
                  <div className="font-medium text-teal-900">Partner Agreements</div>
                  <div className="text-sm text-teal-700">Manage contracts and terms</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                  <div className="font-medium text-indigo-900">Performance Review</div>
                  <div className="text-sm text-indigo-700">Evaluate partner metrics</div>
                </button>
              </div>
            </div>
          </div>

          {/* Regional Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">San Francisco</span>
                  <span className="font-medium">95% occupied</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Los Angeles</span>
                  <span className="font-medium">88% occupied</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">San Diego</span>
                  <span className="font-medium">92% occupied</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Distribution</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Managers</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Membership Staff</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Services Staff</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Content Staff</span>
                  <span className="font-medium">6</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">New staff onboarded</div>
                  <div className="text-gray-500">Rachel Green - Content</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Partner contract signed</div>
                  <div className="text-gray-500">Wellness Coach - Maria</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">Location milestone</div>
                  <div className="text-gray-500">SF reached 95% capacity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Regional Staff</h3>
              <button
                onClick={() => openCreateForm("staff")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Staff
              </button>
            </div>
            <DataTable columns={staffColumns} data={staffData} actions={renderStaffActions} />
          </div>
        </main>
      </div>

      {/* Create Account Form Modal */}
      {showCreateForm && (
        <CreateAccountForm
          userType={createFormType}
          availableRoles={createFormType === "staff" ? availableStaffRoles : availablePartnerRoles}
          availableLocations={[{ id: adminLocationId, name: "", description: "" }]}
          onSubmit={handleCreateAccount}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </RoleLayout>
  )
}
