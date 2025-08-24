"use client"

import { Users, Search, Eye, Calendar, Package, CreditCard, MapPin, User, Globe, FileText } from "lucide-react"
import TopNav from "../shared/topNav"
import { useState, useEffect } from "react"
import axios from "../../../utils/axiosConfig"

interface MembershipRequest {
  requestId: string
  fullName: string
  originalPrice: number
  requestedPackageName: string
  packageType: "basic" | "combo"
  finalPrice: number
  addOnsFee: number | null
  expireAt: string
  startDate: string
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentTime: string
  staffNote: string | null
  approvedAt: string | null
  packageId: string
  messageToStaff: string
  createdAt: string
  locationName: string
  interests: string
  personalityTraits: string
  introduction: string
  cvUrl: string
  discountRate: number | null
  discountAmount: number | null
  extendedProfile: {
    gender: string
    dob: string
    avatarUrl: string
    socialLinks: string
    address: string
    roleType: string
  }
  requireBooking: boolean
  roomInstanceId: string | null
}

export default function UserStatusDashboard() {
  const [membershipRequests, setMembershipRequests] = useState<MembershipRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<MembershipRequest[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(5)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [packageTypeFilter, setPackageTypeFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedUserRequests, setSelectedUserRequests] = useState<MembershipRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembershipRequests = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/user/memberships/all-requests-membership")
        // Chỉ lấy các request có status Completed
        const completedOnlyRequests = response.data.filter((req: MembershipRequest) => req.status === 'Completed')
        setMembershipRequests(completedOnlyRequests)
        setFilteredRequests(completedOnlyRequests)
      } catch (error) {
        console.error("Error fetching membership requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembershipRequests()
  }, [])

  useEffect(() => {
    let filtered = membershipRequests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedPackageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.locationName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    if (packageTypeFilter !== "all") {
      filtered = filtered.filter(request => request.packageType === packageTypeFilter)
    }

    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter(request => request.paymentStatus === paymentStatusFilter)
    }

    setFilteredRequests(filtered)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, packageTypeFilter, paymentStatusFilter, membershipRequests])

  // Get unique users with their latest request info for display
  const getUniqueUsersForDisplay = () => {
    const userMap = new Map<string, any>()
    
    filteredRequests.forEach(request => {
      if (!userMap.has(request.fullName)) {
        // Get all completed requests for this user (since all data is now completed)
        const userRequests = membershipRequests.filter(r => r.fullName === request.fullName)
        
        userMap.set(request.fullName, {
          fullName: request.fullName,
          avatarUrl: request.extendedProfile.avatarUrl,
          gender: request.extendedProfile.gender,
          dob: request.extendedProfile.dob,
          address: request.extendedProfile.address,
          socialLinks: request.extendedProfile.socialLinks,
          interests: request.interests,
          personalityTraits: request.personalityTraits,
          introduction: request.introduction,
          cvUrl: request.cvUrl,
          locationName: request.locationName,
          // Add summary info - all based on completed requests
          totalRequests: userRequests.length,
          completedRequests: userRequests.length, // Same as total since all are completed
          totalSpent: userRequests.reduce((sum, r) => sum + r.finalPrice, 0),
          lastPurchase: userRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt,
          packageTypes: Array.from(new Set(userRequests.map(r => r.packageType)))
        })
      }
    })
    
    return Array.from(userMap.values())
  }

  const uniqueUsers = getUniqueUsersForDisplay()
  const totalPages = Math.ceil(uniqueUsers.length / pageSize)
  const pagedUsers = uniqueUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getUniqueUsers = () => {
    const userMap = new Map<string, any>()
    
    membershipRequests.forEach(request => {
      if (!userMap.has(request.fullName)) {
        userMap.set(request.fullName, {
          fullName: request.fullName,
          avatarUrl: request.extendedProfile.avatarUrl,
          gender: request.extendedProfile.gender,
          dob: request.extendedProfile.dob,
          address: request.extendedProfile.address,
          socialLinks: request.extendedProfile.socialLinks,
          interests: request.interests,
          personalityTraits: request.personalityTraits,
          introduction: request.introduction,
          cvUrl: request.cvUrl,
          locationName: request.locationName
        })
      }
    })
    
    return Array.from(userMap.values())
  }

  // Get unique users for display (showing only users with requests in current filtered results)
  const getDisplayUsers = () => {
    const userMap = new Map<string, any>()
    
    filteredRequests.forEach(request => {
      if (!userMap.has(request.fullName)) {
        userMap.set(request.fullName, {
          fullName: request.fullName,
          avatarUrl: request.extendedProfile.avatarUrl,
          gender: request.extendedProfile.gender,
          dob: request.extendedProfile.dob,
          address: request.extendedProfile.address,
          socialLinks: request.extendedProfile.socialLinks,
          interests: request.interests,
          personalityTraits: request.personalityTraits,
          introduction: request.introduction,
          cvUrl: request.cvUrl,
          locationName: request.locationName
        })
      }
    })
    
    return Array.from(userMap.values())
  }

  const handleUserDetail = (user: any) => {
    const userRequests = membershipRequests
      .filter(request => request.fullName === user.fullName)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    
    setSelectedUser(user)
    setSelectedUserRequests(userRequests)
    setShowDetailModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫'
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPackageTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'combo': return 'bg-purple-100 text-purple-800'
      case 'basic': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <TopNav user={{ id: "", name: "", email: "", role: "", location: "", avatar: "" }} title="User Status Management" />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                 {/* Statistics Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <div className="bg-white shadow rounded-lg p-6">
             <div className="flex items-center">
               <Users className="h-8 w-8 text-blue-500" />
               <div className="ml-4">
                 <div className="text-2xl font-bold text-gray-900">{getDisplayUsers().length}</div>
                 <div className="text-sm text-gray-500">Filtered Users</div>
                 <div className="text-xs text-gray-400">Total: {getUniqueUsers().length}</div>
               </div>
             </div>
           </div>
           
           <div className="bg-white shadow rounded-lg p-6">
             <div className="flex items-center">
               <User className="h-8 w-8 text-green-500" />
               <div className="ml-4">
                 <div className="text-2xl font-bold text-gray-900">{getDisplayUsers().length}</div>
                 <div className="text-sm text-gray-500">Total Users</div>
                 <div className="text-xs text-gray-400">Active members</div>
               </div>
             </div>
           </div>
           
           <div className="bg-white shadow rounded-lg p-6">
             <div className="flex items-center">
               <Users className="h-8 w-8 text-purple-500" />
               <div className="ml-4">
                 <div className="text-2xl font-bold text-gray-900">
                   {getDisplayUsers().length}
                 </div>
                 <div className="text-sm text-gray-500">Total Members</div>
                 <div className="text-xs text-gray-400">Package holders</div>
               </div>
             </div>
           </div>
           
           <div className="bg-white shadow rounded-lg p-6">
             <div className="flex items-center">
               <Calendar className="h-8 w-8 text-yellow-500" />
               <div className="ml-4">
                 <div className="text-2xl font-bold text-gray-900">
                   {membershipRequests.length}
                 </div>
                 <div className="text-sm text-gray-500">Total Completed</div>
               </div>
             </div>
           </div>
         </div>

        {/* User Management Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Membership Status</h3>
                <p className="text-sm text-gray-600 mt-1">Manage and view user package purchases</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by user name, package name, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Package Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Package Type</label>
                  <select
                    value={packageTypeFilter}
                    onChange={(e) => setPackageTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="basic">Basic</option>
                    <option value="combo">Combo</option>
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  {(searchTerm || statusFilter !== "all" || packageTypeFilter !== "all" || paymentStatusFilter !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("")
                        setStatusFilter("all")
                        setPackageTypeFilter("all")
                        setPaymentStatusFilter("all")
                      }}
                      className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

                             {/* Results Info */}
               <div className="text-xs text-gray-500">
                 {uniqueUsers.length} completed users
               </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading user data...</p>
              </div>
                         ) : pagedUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagedUsers.map((user) => (
                      <tr key={user.fullName} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatarUrl || '/default-avatar.png'}
                                alt={user.fullName}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = '/default-avatar.png'
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.locationName}</div>
                              <div className="text-xs text-gray-400">{user.gender} • {formatDate(user.dob)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.gender}</div>
                            <div className="text-sm text-gray-500">{formatDate(user.dob)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.extendedProfile?.roleType || 'User'}</div>
                          <div className="text-xs text-gray-500">Role Type</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.address || 'N/A'}</div>
                          <div className="text-xs text-gray-500">User Address</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.totalRequests}</div>
                          <div className="text-xs text-gray-500">Total requests</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserDetail(user)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, uniqueUsers.length)} of {uniqueUsers.length} results
              </div>
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  const pageNum = currentPage <= 3 ? idx + 1 : 
                                 currentPage >= totalPages - 2 ? totalPages - 4 + idx :
                                 currentPage - 2 + idx;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum 
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={selectedUser.avatarUrl || '/default-avatar.png'}
                      alt={selectedUser.fullName}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/default-avatar.png'
                      }}
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedUser.fullName}</h2>
                      <p className="text-sm text-gray-600">{selectedUser.locationName}</p>
                    </div>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-600 transition-colors" 
                    onClick={() => setShowDetailModal(false)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - User Profile */}
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-500" />
                        User Profile
                      </h3>
                      
                                             <div className="space-y-4">
                         {/* Basic Info */}
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                             <p className="text-sm text-gray-900">{selectedUser.gender}</p>
                           </div>
                           <div>
                             <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
                             <p className="text-sm text-gray-900">{formatDate(selectedUser.dob)}</p>
                           </div>
                         </div>

                                                   {/* Summary Stats */}
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-green-700">{selectedUser.completedRequests}</div>
                                <div className="text-xs text-green-600">Total Completed</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-purple-700">{formatPrice(selectedUser.totalSpent)}</div>
                                <div className="text-xs text-purple-600">Total Spent</div>
                              </div>
                            </div>
                          </div>

                        {/* Address */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            Address
                          </label>
                          <p className="text-sm text-gray-900">{selectedUser.address}</p>
                        </div>

                        {/* Social Links */}
                        {selectedUser.socialLinks && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              Social Links
                            </label>
                            <a 
                              href={selectedUser.socialLinks} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 break-all"
                            >
                              {selectedUser.socialLinks}
                            </a>
                          </div>
                        )}

                        {/* CV */}
                        {selectedUser.cvUrl && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              CV/Resume
                            </label>
                            <a 
                              href={selectedUser.cvUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 break-all"
                            >
                              View CV
                            </a>
                          </div>
                        )}

                        {/* Interests */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Interests</label>
                          <div className="flex flex-wrap gap-1">
                            {selectedUser.interests.split(', ').map((interest: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Personality Traits */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Personality Traits</label>
                          <div className="flex flex-wrap gap-1">
                            {selectedUser.personalityTraits.split(', ').map((trait: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Introduction */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Introduction</label>
                          <p className="text-sm text-gray-900 leading-relaxed">{selectedUser.introduction}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Request History */}
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-green-500" />
                        Request History
                      </h3>
                      
                      <div className="space-y-3">
                        {selectedUserRequests.map((request) => (
                          <div key={request.requestId} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{request.requestedPackageName}</div>
                                <div className="text-sm text-gray-500">{formatDate(request.createdAt)}</div>
                              </div>
                              <div className="flex space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPackageTypeBadgeColor(request.packageType)}`}>
                                  {request.packageType === 'combo' ? 'Combo' : 'Basic'}
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Price:</span>
                                <span className="ml-1 font-medium">{formatPrice(request.finalPrice)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Payment:</span>
                                <span className={`ml-1 px-2 py-1 text-xs rounded-full ${getPaymentStatusBadgeColor(request.paymentStatus)}`}>
                                  {request.paymentStatus}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Method:</span>
                                <span className="ml-1">{request.paymentMethod}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Location:</span>
                                <span className="ml-1">{request.locationName}</span>
                              </div>
                            </div>

                            {request.discountRate && (
                              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                <div className="text-xs text-green-700">
                                  <span className="font-medium">Discount:</span> {(request.discountRate * 100).toFixed(0)}% OFF 
                                  ({formatPrice(request.discountAmount || 0)})
                                </div>
                              </div>
                            )}

                            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span>Start:</span> {formatDate(request.startDate)}
                                </div>
                                <div>
                                  <span>Expire:</span> {formatDate(request.expireAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                               <div className="text-xs text-gray-500">
                 Completed Requests: {selectedUserRequests.length} • Total Spent: {formatPrice(selectedUser.totalSpent)} • Last updated: {new Date().toLocaleDateString('vi-VN')}
               </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
