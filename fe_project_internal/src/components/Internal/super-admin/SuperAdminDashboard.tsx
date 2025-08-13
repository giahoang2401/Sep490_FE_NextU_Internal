"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../utils/axiosConfig"; 
import {
  Users,
  UserPlus,
  MapPin,
  BarChart3,
  Lock,
  Unlock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import Sidebar from "../shared/sidebar";
import TopNav from "../shared/topNav";
import DashboardCard from "../shared/dashboardCard";
import CreateAdminForm from "../shared/createAdminForm";
import RoleLayout from "../shared/roleLayout";
import LocationStats from "./LocationStats";
import { getSuperAdminNavigation } from "./superAdminNavigation";
import type {
  User,
  CreateAccountData,
  Location,
  Admin,
} from "../types";

const navigation = getSuperAdminNavigation("/super-admin");

const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@nextu.com",
  role: "SuperAdmin",
  avatar: "/placeholder.svg?height=32&width=32",
};



export default function SuperAdminDashboard() {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [locationStats, setLocationStats] = useState({ cities: 0, locations: 0, properties: 0 });
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  const fetchLocationStats = async () => {
    try {
      const [citiesRes, locationsRes, propertiesRes] = await Promise.all([
        api.get("/api/basePosition/cities"),
        api.get("/api/basePosition/locations"),
        api.get("/api/basePosition/properties"),
      ]);
      
      setLocationStats({
        cities: citiesRes.data.data?.length || 0,
        locations: locationsRes.data.data?.length || 0,
        properties: propertiesRes.data.data?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch location stats:", error);
    }
  }

  const fetchAdmins = async () => {
    try {
      setAdminLoading(true);
      const response = await api.get("/api/auth/management/admins");
      setAdmins(response.data);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setAdminLoading(false);
    }
  };

  fetchLocations()
  fetchLocationStats()
  fetchAdmins()
}, [])
  const handleCreateAdmin = async (data: {
    userName: string;
    email: string;
    password: string;
    locationId: string;
    skipEmailVerification: boolean;
  }) => {
    try {
      await api.post("/api/auth/super-admin/register-admin", {
        userName: data.userName,
        email: data.email,
        password: data.password,
        locationId: data.locationId,
        skipEmailVerification: data.skipEmailVerification,
      });
      alert("Admin account created successfully!");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Failed to create admin.");
    }
  };



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
console.log("📌 showCreateForm:", showCreateForm)
console.log("📌 availableLocations:", availableLocations)
console.log("📌 isArray:", Array.isArray(availableLocations))
console.log("📌 length:", availableLocations?.length)
  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="SuperAdmin" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Dashboard" />

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
              value={locationStats.locations}
              change="+2"
              changeType="increase"
              icon={MapPin}
            />
            <DashboardCard
              title="Admin Accounts"
              value={admins.length}
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
                <button 
                  onClick={() => router.push('/super-admin/locations')}
                  className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                >
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

            <LocationStats />
          </div>

          {/* Admin Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Regional Administrators ({admins.length})
              </h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Admin
              </button>
            </div>
            
            {adminLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : admins.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No administrators found</p>
              </div>
            ) : (
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
                                         {admins.slice(0, 5).map((admin) => (
                       <tr 
                         key={admin.accountId} 
                         className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                         onClick={() => handleRowClick(admin)}
                       >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-600" />
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
                {admins.length > 5 && (
                  <div className="px-6 py-4 border-t border-gray-200 text-center">
                    <button 
                      onClick={() => router.push('/super-admin/manage-admins')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View All {admins.length} Administrators →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

             {/* Modal: Create Admin Form */}
       {showCreateForm && (
         <CreateAdminForm
           availableLocations={availableLocations ?? []}
           onSubmit={handleCreateAdmin}
           onCancel={() => setShowCreateForm(false)}
         />
       )}

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
                   <label className="block text-gray-700">Status</label>
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
