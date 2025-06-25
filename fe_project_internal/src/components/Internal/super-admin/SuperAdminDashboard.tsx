"use client";

import { useState, useEffect } from "react";
import api from "../../../../utils/axiosConfig";
import {
  Globe,
  Users,
  Settings,
  BarChart3,
  UserPlus,
  MapPin,
} from "lucide-react";
import Sidebar from "../shared/sidebar";
import TopNav from "../shared/topNav";
import DashboardCard from "../shared/dashboardCard";
import DataTable from "../shared/dataTable";
import CreateAccountForm from "../shared/createAccountForm";
import RoleLayout from "../shared/roleLayout";
import type {
  NavigationItem,
  User,
  TableColumn,
  CreateAccountData,
  Location,
} from "../types";

const navigation: NavigationItem[] = [
  {
    name: "System Overview",
    href: "/internal/superadmin",
    icon: Globe,
    current: true,
  },
  { name: "Manage Admins", href: "/internal/superadmin/admins", icon: Users },
  {
    name: "System Config",
    href: "/internal/superadmin/config",
    icon: Settings,
  },
  {
    name: "Global Reports",
    href: "/internal/superadmin/reports",
    icon: BarChart3,
  },
];

const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@nextu.com",
  role: "SuperAdmin",
  avatar: "/placeholder.svg?height=32&width=32",
};

const adminColumns: TableColumn[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "location", label: "Location", sortable: true },
  { key: "region", label: "Region", sortable: true },
  { key: "status", label: "Status" },
];

const adminData = [
  {
    name: "Jane Smith",
    email: "jane@nextu.com",
    location: "Hà Nội",
    region: "Bắc",
    status: "Active",
  },
  {
    name: "Mike Johnson",
    email: "mike@nextu.com",
    location: "Đà Nẵng",
    region: "Trung",
    status: "Active",
  },
  {
    name: "Sarah Wilson",
    email: "sarah@nextu.com",
    location: "Hải Phòng",
    region: "Bắc",
    status: "Pending",
  },
];

export default function SuperAdminDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);

useEffect(() => {
  const fetchLocations = async () => {
    try {
      const res = await api.get("/api/user/Locations") // res là object, data là array
      console.log("location:", res)
      setAvailableLocations(res.data)
    } catch (error) {
      console.error("Failed to fetch locations", error)
    }
  }

  fetchLocations()
}, [])
  const handleCreateAdmin = async (data: CreateAccountData) => {
    try {
      await api.post("/api/auth/super-admin/register-admin", {
        userName: data.name,
        email: data.email,
        password: data.password,
        locationId: data.location,
        skipEmailVerification: true,
      });
      alert("Admin account created successfully!");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Failed to create admin.");
    }
  };

  const renderAdminActions = (row: any) => (
    <div className="flex space-x-2">
      <button className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200">
        Edit
      </button>
      <button className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full hover:bg-red-200">
        Suspend
      </button>
    </div>
  );
console.log("📌 showCreateForm:", showCreateForm)
console.log("📌 availableLocations:", availableLocations)
console.log("📌 isArray:", Array.isArray(availableLocations))
console.log("📌 length:", availableLocations?.length)
  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="SuperAdmin" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="System Overview" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Users"
              value="12,543"
              change="+12%"
              changeType="increase"
              icon={Users}
            />
            <DashboardCard
              title="Active Locations"
              value="8"
              change="+2"
              changeType="increase"
              icon={MapPin}
            />
            <DashboardCard
              title="Admin Accounts"
              value="12"
              change="+1"
              changeType="increase"
              icon={UserPlus}
            />
            <DashboardCard
              title="System Health"
              value="99.9%"
              change="0%"
              changeType="neutral"
              icon={BarChart3}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <div className="font-medium text-blue-900">
                    Create Admin Account
                  </div>
                  <div className="text-sm text-blue-700">
                    Add new regional administrator
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                  <div className="font-medium text-green-900">
                    Add New Location
                  </div>
                  <div className="text-sm text-green-700">
                    Expand to new city/region
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                  <div className="font-medium text-purple-900">
                    System Backup
                  </div>
                  <div className="text-sm text-purple-700">
                    Create full system backup
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      New admin created
                    </div>
                    <div className="text-xs text-gray-500">
                      Sarah Wilson - Austin
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      System update deployed
                    </div>
                    <div className="text-xs text-gray-500">
                      Version 2.1.4 - 1 hour ago
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Regional Administrators
              </h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </button>
            </div>
            <DataTable
              columns={adminColumns}
              data={adminData}
              actions={renderAdminActions}
            />
          </div>
        </main>
      </div>

      {/* Modal: Create Admin Form */}
    {showCreateForm && (
  <CreateAccountForm
    userType="admin"
    availableRoles={["Admin"]}
    availableLocations={availableLocations ?? []}
    onSubmit={handleCreateAdmin}
    onCancel={() => setShowCreateForm(false)}
  />
)}
    </RoleLayout>
  );
}
