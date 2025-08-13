"use client";

import { useState, useEffect } from "react";
import api from "../../../utils/axiosConfig";
import {
  Users,
  Eye,
  Lock,
  Unlock,
  Mail,
  MapPin,
  User,
  Shield,
} from "lucide-react";
import Sidebar from "../shared/sidebar";
import TopNav from "../shared/topNav";
import RoleLayout from "../shared/roleLayout";
import { getSuperAdminNavigation } from "./superAdminNavigation";
import type { Admin } from "../types";

const navigation = getSuperAdminNavigation("/super-admin/manage-admins");

const mockUser = {
  id: "1",
  name: "Super Admin",
  email: "superadmin@nextu.com",
  role: "SuperAdmin",
  avatar: "/placeholder.svg?height=32&width=32",
};

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/auth/management/admins");
      setAdmins(response.data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowDetailModal(true);
  };

  const handleLockUnlock = async (admin: Admin, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click when clicking lock button
    try {
      const newLockStatus = !admin.isLocked;
      await api.put(`/api/auth/management/admins/${admin.accountId}/lock`, {
        isLocked: newLockStatus,
      });
      
      // Update local state
      setAdmins(prev => prev.map(a => 
        a.accountId === admin.accountId 
          ? { ...a, isLocked: newLockStatus }
          : a
      ));
      
      // Update selected admin if modal is open
      if (selectedAdmin?.accountId === admin.accountId) {
        setSelectedAdmin(prev => prev ? { ...prev, isLocked: newLockStatus } : null);
      }
    } catch (error) {
      console.error("Failed to update lock status:", error);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         admin.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = filterLocation === "all" || admin.locationId === filterLocation;
    
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = Array.from(new Set(admins.map(admin => admin.locationId)))
    .map(locationId => {
      const admin = admins.find(a => a.locationId === locationId);
      return {
        id: locationId,
        name: admin?.locationName || "Unknown Location"
      };
    });

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0001-01-01T00:00:00") return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusColor = (admin: Admin) => {
    if (admin.isLocked) return "bg-red-100 text-red-800";
    if (admin.emailVerified) return "bg-green-100 text-green-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (admin: Admin) => {
    if (admin.isLocked) return "Locked";
    if (admin.emailVerified) return "Active";
    return "Pending";
  };

  if (loading) {
    return (
      <RoleLayout>
        <Sidebar navigation={navigation} title="Next U" userRole="SuperAdmin" />
        <div className="lg:pl-64 flex flex-col flex-1">
          <TopNav user={mockUser} title="Manage Admins" />
          <main className="flex-1 p-4 lg:p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="SuperAdmin" />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Manage Admins" />
        
        <main className="flex-1 p-4 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-600">Manage regional administrators and their access</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by username, email, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Admins</p>
                  <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Unlock className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {admins.filter(a => !a.isLocked).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Lock className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Locked</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {admins.filter(a => a.isLocked).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <Mail className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {admins.filter(a => !a.emailVerified && !a.isLocked).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Regional Administrators ({filteredAdmins.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Click on any row to view details
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr 
                      key={admin.accountId} 
                      className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                      onClick={() => handleRowClick(admin)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.locationName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin)}`}>
                          {getStatusText(admin)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(admin.profileCreatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleLockUnlock(admin, e)}
                            className={`p-2 rounded-md transition-colors ${
                              admin.isLocked 
                                ? "text-green-600 hover:text-green-900 hover:bg-green-50" 
                                : "text-red-600 hover:text-red-900 hover:bg-red-50"
                            }`}
                            title={admin.isLocked ? "Unlock Account" : "Lock Account"}
                          >
                            {admin.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Admin Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAdmin.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAdmin.email || "N/A"}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAdmin.locationName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{selectedAdmin.roleName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAdmin)}`}>
                      {getStatusText(selectedAdmin)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAdmin.emailVerified ? "Yes" : "No"}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAdmin.phone || "N/A"}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAdmin.gender || "N/A"}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAdmin.dob || "N/A"}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAdmin.address || "N/A"}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Created</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAdmin.profileCreatedAt)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAdmin.profileUpdatedAt ? formatDate(selectedAdmin.profileUpdatedAt) : "Never"}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Login Attempts</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedAdmin.loginAttempt}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Refresh Token Expiry</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedAdmin.refreshTokenExpiry ? formatDate(selectedAdmin.refreshTokenExpiry) : "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleLockUnlock(selectedAdmin, {} as React.MouseEvent)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedAdmin.isLocked
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {selectedAdmin.isLocked ? "Unlock Account" : "Lock Account"}
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleLayout>
  );
}
