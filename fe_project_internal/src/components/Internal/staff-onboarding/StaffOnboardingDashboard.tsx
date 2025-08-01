"use client"

import { useEffect, useState } from "react"
import api from "../../../utils/axiosConfig"; 
import { UserPlus, CreditCard, Users, Package, Calendar, Mail, CheckCircle } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import DashboardCard from "../shared/dashboardCard"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User } from "../types"
import { format } from "date-fns"

const navigation: NavigationItem[] = [
  { name: "Applications", href: "/staff-onboarding", icon: UserPlus, current: true },
  { name: "Payment Guide", href: "/staff-onboarding/payments", icon: CreditCard },
  { name: "User Status", href: "/staff-onboarding/status", icon: Users },
  { name: "Create Packages", href: "/staff-onboarding/packages", icon: Package },
  { name: "Schedule Events", href: "/staff-onboarding/events", icon: Calendar },
]

const mockUser: User = {
  id: "4",
  name: "Emily Chen",
  email: "emily@nextu.com",
  role: "staff_onboarding",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}

export default function StaffOnboardingDashboard() {
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState<any | null>(null)
  const [detail, setDetail] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [note, setNote] = useState("")
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    fetchPending()
  }, [])

  async function fetchPending() {
    setLoading(true)
    setError("")
    try {
      const res = await api.get("/api/user/memberships/pending-requests")
      setPending(res.data)
    } catch (e: any) {
      setError(e.message || "Failed to load pending requests")
    } finally {
      setLoading(false)
    }
  }

  async function fetchDetail(id: string) {
    setDetail(null)
    setError("")
    try {
      const res = await api.get(`/api/user/memberships/request-detail/${id}`)
      setDetail(res.data)
    } catch (e: any) {
      setError(e.message || "Failed to load request detail")
    }
  }

  async function handleApprove(requestId: string) {
    setActionLoading(true)
    setError("")
    try {
      await api.post("/api/user/memberships/approveRequest", { requestId, staffNote: note })
      setNote("")
      setSelected(null)
      fetchPending()
    } catch (e: any) {
      setError(e.message || "Approve failed")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject(requestId: string) {
    setActionLoading(true)
    setError("")
    try {
      await api.post("/api/user/memberships/rejectRequest", { requestId, reason: rejectReason })
      setRejectReason("")
      setSelected(null)
      fetchPending()
    } catch (e: any) {
      setError(e.message || "Reject failed")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Staff Onboarding" />
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Onboarding Management" />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard title="Pending Applications" value={pending.length.toString()} change="" changeType="neutral" icon={UserPlus} />
            {/* ...other cards nếu cần... */}
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Applications</h3>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : pending.length === 0 ? (
              <div>No pending requests.</div>
            ) : (
              <div className="space-y-4">
                {pending.map((req) => (
                  <div key={req.requestId} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-base">{req.fullName}</div>
                      <div className="text-sm text-gray-500">Gói: <span className="font-semibold">{req.requestedPackageName}</span></div>
                      <div className="text-xs text-gray-400">Ngày gửi: {req.createdAt ? format(new Date(req.createdAt), "dd/MM/yyyy HH:mm") : "-"}</div>
                    </div>
                    <button className="text-blue-600 underline text-xs font-medium" onClick={() => { setSelected(req); fetchDetail(req.requestId) }}>View Detail</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Detail modal/section */}
          {selected && detail && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative animate-fadeIn">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => { setSelected(null); setDetail(null) }}>×</button>
                <div className="flex items-center mb-6">
                  <img src={detail.extendedProfile?.avatarUrl || "/placeholder.svg?height=64&width=64"} alt="avatar" className="w-16 h-16 rounded-full border mr-4" />
                  <div>
                    <div className="text-xl font-bold text-gray-900">{detail.fullName}</div>
                    <div className="text-sm text-gray-500">Gói đăng ký: <span className="font-semibold">{detail.requestedPackageName}</span></div>
                    <div className="text-xs text-gray-400">Ngày gửi: {detail.createdAt ? format(new Date(detail.createdAt), "dd/MM/yyyy HH:mm") : "-"}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="mb-1"><span className="font-medium">Giới tính:</span> {detail.extendedProfile?.gender || "-"}</div>
                    <div className="mb-1"><span className="font-medium">Ngày sinh:</span> {detail.extendedProfile?.dob ? format(new Date(detail.extendedProfile.dob), "dd/MM/yyyy") : "-"}</div>
                    <div className="mb-1"><span className="font-medium">Địa chỉ:</span> {detail.extendedProfile?.address || "-"}</div>
                  </div>
                  <div>
                    <div className="mb-1"><span className="font-medium">Sở thích:</span> {detail.interests || "-"}</div>
                    <div className="mb-1"><span className="font-medium">Tính cách:</span> {detail.personalityTraits || "-"}</div>
                    <div className="mb-1"><span className="font-medium">Giới thiệu:</span> {detail.introduction || "-"}</div>
                    <div className="mb-1"><span className="font-medium">Facebook:</span> {detail.cvUrl ? <a href={detail.cvUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Link</a> : "-"}</div>
                    <div className="mb-1"><span className="font-medium">Social:</span> {detail.extendedProfile?.socialLinks ? <a href={detail.extendedProfile.socialLinks} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Link</a> : "-"}</div>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Staff Note (for approve):</label>
                  <input value={note} onChange={e => setNote(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Optional note..." />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Reject Reason:</label>
                  <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Reason for rejection..." />
                </div>
                <div className="flex space-x-2 mt-4">
                  <button disabled={actionLoading} onClick={() => handleApprove(selected.requestId)} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Approve</button>
                  <button disabled={actionLoading} onClick={() => handleReject(selected.requestId)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">Reject</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  )
}
