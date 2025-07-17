"use client"

import { Home, GraduationCap, Lightbulb, MessageSquare, Plus, Star, DoorOpen } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import DataTable from "../shared/dataTable"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User, TableColumn } from "../types"
import { useState, useEffect } from "react"
import axios from "../../../../utils/axiosConfig"

const navigation: NavigationItem[] = [
  { name: "NextLiving", href: "/internal/staff-services", icon: Home, current: true },
  { name: "NextAcademy", href: "/internal/staff-services/academy", icon: GraduationCap },
  { name: "Propose Activities", href: "/internal/staff-services/activities", icon: Lightbulb },
  { name: "Member Feedback", href: "/internal/staff-services/feedback", icon: MessageSquare },
  { name: "Room Management", href: "/staff-services/room", icon: DoorOpen },
]

const mockUser: User = {
  id: "5",
  name: "Carlos Martinez",
  email: "carlos@nextu.com",
  role: "Staff_Services",
  location: "San Francisco, CA",
  avatar: "/placeholder.svg?height=32&width=32",
}



// Cập nhật lại columns bảng
const serviceColumns: TableColumn[] = [
  { key: "service", label: "Packages", sortable: true },
  { key: "category", label: "Type" },
  { key: "status", label: "Status" },
  { key: "price", label: "Price" },
  { key: "planDurationDescription", label: "Plan Duration" },
]



const feedbackData = [
  { service: "House Cleaning", feedback: "Excellent service, very thorough!", rating: 5, user: "Alex R." },
  { service: "Coding Bootcamp", feedback: "Great instructor, learned a lot", rating: 5, user: "Maria G." },
  { service: "Maintenance", feedback: "Quick response time", rating: 4, user: "David K." },
  { service: "Meal Planning", feedback: "Helpful but could use more variety", rating: 4, user: "Sarah J." },
]

export default function StaffServicesDashboard() {
  // TẤT CẢ các hook phải ở đầu thân hàm component
  const [showAddModal, setShowAddModal] = useState(false)
  const [basicPlanTypes, setBasicPlanTypes] = useState<any[]>([])
  const [accommodationOptions, setAccommodationOptions] = useState<any[]>([])
  const [durations, setDurations] = useState<any[]>([])
  const [selectedDurations, setSelectedDurations] = useState<{[key:string]: string}>({})
  const [selectedDurationIds, setSelectedDurationIds] = useState<string[]>([])
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    basicPlanTypeId: "",
    locationId: "",
    roomTypeId: "",
    price: "",
    basicPlanCategoryId: 1,
    planLevelId: 1,
    targetAudienceId: 1,
  })
  const [selectedPlanType, setSelectedPlanType] = useState<any>(null)
  const [finalPrice, setFinalPrice] = useState<number>(0)
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [basicPlans, setBasicPlans] = useState<any[]>([])
  // Phân trang và popup detail
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Lấy locationId từ localStorage (key: nextu_internal_user)
  useEffect(() => {
    if (showAddModal) {
      let locationId = ""
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("nextu_internal_user")
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr)
            locationId = userObj.location || ""
          } catch {}
        }
      }
      setForm(f => ({ ...f, locationId }))
    }
  }, [showAddModal])

  // Lấy BasicPlanTypes
  useEffect(() => {
    axios.get("/api/membership/BasicPlanTypes").then(res => {
      setBasicPlanTypes(res.data)
    })
  }, [])

  // Lấy durations từ API /api/PackageDuration
  useEffect(() => {
    axios.get("/api/membership/PackageDuration").then(res => {
      setDurations(res.data)
    })
  }, [])

  // Lấy danh sách basic package theo location khi load trang
  useEffect(() => {
    let locationId = ""
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("nextu_internal_user")
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr)
          locationId = userObj.location || ""
        } catch {}
      }
    }
    if (locationId) {
      axios.get(`/api/membership/BasicPlans?locationId=${locationId}`)
        .then(res => {
          setBasicPlans(res.data)
        })
    }
  }, [])

  // Khi chọn BasicPlanType là Living thì gọi AccommodationOptions
  useEffect(() => {
    if (selectedPlanType && selectedPlanType.code === "ACCOMMODATION") {
      axios.get("/api/membership/AccommodationOptions").then(res => {
        setAccommodationOptions(res.data)
      })
    } else {
      setAccommodationOptions([])
      setSelectedRoom(null)
    }
  }, [selectedPlanType])

  // Khi chọn roomTypeId thì set selectedRoom
  useEffect(() => {
    if (form.roomTypeId && accommodationOptions.length > 0) {
      const room = accommodationOptions.find((r: any) => r.id === form.roomTypeId)
      setSelectedRoom(room)
    } else {
      setSelectedRoom(null)
    }
  }, [form.roomTypeId, accommodationOptions])

  // Tính giá cuối cùng khi chọn đủ room + duration
  useEffect(() => {
    if (selectedPlanType && selectedPlanType.code === "ACCOMMODATION" && selectedRoom && selectedDurationIds.length > 0) {
      // Lấy duration đầu tiên (chỉ cho phép chọn 1 duration)
      const durationId = selectedDurationIds[0]
      const duration = durations.find((d: any) => String(d.id) === String(durationId))
      if (duration && selectedRoom.pricePerNight) {
        // Sửa lại: nhân đúng số tháng
        const months = duration.unit.toLowerCase() === "month" ? duration.value : duration.unit.toLowerCase() === "year" ? duration.value * 12 : 1
        const price = selectedRoom.pricePerNight * 30 * months
        setFinalPrice(price)
      } else {
        setFinalPrice(0)
      }
    } else {
      setFinalPrice(0)
    }
  }, [selectedPlanType, selectedRoom, selectedDurationIds, durations])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === "basicPlanTypeId") {
      const plan = basicPlanTypes.find((b: any) => b.id === value)
      setSelectedPlanType(plan)
    }
  }

  // Handler cho dropdown multi-select duration
  const handleDurationDropdownChange = (e: any) => {
    const options = Array.from(e.target.selectedOptions)
    const ids = options.map((opt: any) => opt.value)
    setSelectedDurationIds(ids)
    // Xóa discountRate của duration không còn được chọn
    setSelectedDurations(prev => {
      const filtered: {[key:string]: string} = {}
      ids.forEach(id => { filtered[id] = prev[id] || "" })
      return filtered
    })
  }
  const handleDiscountRateChange = (e: any, durationId: string) => {
    setSelectedDurations(prev => ({ ...prev, [durationId]: e.target.value }))
  }

  // Sửa lại handleSubmit để gửi đúng các trường
  const handleSubmit = async (e: any) => {
    e.preventDefault()
    // Gom packageDurations
    const packageDurations = selectedDurationIds.length > 0 ? [{
      durationId: selectedDurationIds[0],
      discountRate: 0
    }] : []
    // Kiểm tra locationId là GUID hợp lệ
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    if (!form.locationId || !guidRegex.test(form.locationId)) {
      alert("locationId không hợp lệ hoặc không phải GUID!")
      return
    }
    // Xác định verifyBuy/requireBooking theo loại gói
    let verifyBuy = true
    let requireBooking = true
    if (selectedPlanType) {
      if (selectedPlanType.code === "ACCOMMODATION") {
        verifyBuy = true
        requireBooking = true
      } else if (selectedPlanType.code === "LIFEACTIVITIES") {
        verifyBuy = true
        requireBooking = false
      }
    }
    // Nếu là ACCOMMODATION thì thêm accomodations
    let extra = {}
    if (selectedPlanType && selectedPlanType.code === "ACCOMMODATION" && form.roomTypeId) {
      extra = { accomodations: [{ accomodationId: form.roomTypeId }] }
    }
    try {
      await axios.post("/api/membership/BasicPlans", {
        ...form,
        verifyBuy,
        requireBooking,
        packageDurations,
        price: finalPrice,
        basicPlanCategoryId: 1,
        planLevelId: 1,
        targetAudienceId: 1,
        ...extra
      })
      alert("Tạo Basic Package thành công!")
    } catch (err: any) {
      alert("Tạo Basic Package thất bại!" + (err?.response?.data?.message ? (": " + err.response.data.message) : ""))
    }
    setShowAddModal(false)
  }

  // Map lại dữ liệu cho DataTable
  const mappedPlans = basicPlans.map(plan => ({
    service: plan.name,
    category: plan.basicPlanType,
    status: plan.status || "Active",
    price: plan.price?.toLocaleString() + "₫" || "-",
    planDurationDescription: plan.planDurations && plan.planDurations.length > 0
      ? plan.planDurations.map((d: any) => `${d.planDurationValue} ${d.planDurationUnit}`).join(", ")
      : "-",
    raw: plan, // giữ lại object gốc để xem detail
  }))

  // Phân trang
  const totalPages = Math.ceil(mappedPlans.length / pageSize)
  const pagedPlans = mappedPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Render actions: Detail
  const renderServiceActions = (row: any) => (
    <div className="flex space-x-2">
      <button
        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200"
        onClick={() => { setSelectedPlan(row.raw); setShowDetailModal(true) }}
      >
        Detail
      </button>
    </div>
  )

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Services Staff" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Service Management" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Service Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Home className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-500">NextLiving Services</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">8</div>
                  <div className="text-sm text-gray-500">NextAcademy Courses</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Lightbulb className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-sm text-gray-500">Pending Proposals</div>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">4.7</div>
                  <div className="text-sm text-gray-500">Avg Service Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Basic packages</h3>
                  <button
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Basic Package
                  </button>
                </div>
                <DataTable columns={serviceColumns} data={pagedPlans} actions={renderServiceActions} />
                {/* Thêm phân trang dưới bảng */}
                <div className="flex justify-end mt-2">
                  <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`relative inline-flex items-center px-3 py-1 border-t border-b border-gray-300 text-sm font-medium ${currentPage === idx + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Combo packages</h3>
                <div className="text-gray-500">(Chức năng này sẽ lấy API combo packages, hiện đang là mock)</div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Feedback</h3>
                <div className="space-y-3">
                  {feedbackData.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4">
                      <div className="text-sm font-medium text-gray-900">{item.service}</div>
                      <div className="text-xs text-gray-600">"{item.feedback}"</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        {item.rating}/5 - {item.user}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">NextLiving Services</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">House Cleaning</div>
                    <div className="text-sm text-blue-700">245 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">Maintenance</div>
                    <div className="text-sm text-blue-700">189 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">Meal Planning</div>
                    <div className="text-sm text-blue-700">203 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">NextAcademy Courses</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">Coding Bootcamp</div>
                    <div className="text-sm text-green-700">156 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">Language Exchange</div>
                    <div className="text-sm text-green-700">98 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Maintenance</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">Financial Literacy</div>
                    <div className="text-sm text-green-700">134 active users</div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
              </div>
            </div>
          </div>
          {/* Modal Add Basic Package */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowAddModal(false)}>&times;</button>
                <h2 className="text-xl font-bold mb-4">Add Basic Package</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="flex flex-row flex-wrap gap-4 items-end">
                    {/* BasicPlanType dropdown */}
                    <div className="flex flex-col w-56">
                      <label className="block text-sm font-medium mb-1">Basic Plan Type</label>
                      <select name="basicPlanTypeId" value={form.basicPlanTypeId} onChange={handleChange} className="border rounded px-3 py-2">
                        <option value="">Select Type</option>
                        {basicPlanTypes.map((b: any) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Nếu là Living thì chọn roomTypeName và hiển thị pricePerNight */}
                    {selectedPlanType && selectedPlanType.code === "ACCOMMODATION" && (
                      <div className="flex flex-col w-56">
                        <label className="block text-sm font-medium mb-1">Room Type</label>
                        <select name="roomTypeId" value={form.roomTypeId} onChange={handleChange} className="border rounded px-3 py-2">
                          <option value="">Select Room</option>
                          {accommodationOptions.map((r: any) => (
                            <option key={r.id} value={r.id}>{r.roomTypeName} ({r.pricePerNight.toLocaleString()}₫/đêm)</option>
                          ))}
                        </select>
                        {selectedRoom && (
                          <span className="text-xs text-gray-500 mt-1">Giá phòng: {selectedRoom.pricePerNight.toLocaleString()}₫/đêm</span>
                        )}
                      </div>
                    )}
                    {/* Code */}
                    <div className="flex flex-col w-40">
                      <label className="block text-sm font-medium mb-1">Code</label>
                      <input name="code" value={form.code} onChange={handleChange} className="border rounded px-3 py-2" />
                    </div>
                    {/* Name */}
                    <div className="flex flex-col w-40">
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input name="name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2" />
                    </div>
                    {/* Description */}
                    <div className="flex flex-col w-56">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <input name="description" value={form.description} onChange={handleChange} className="border rounded px-3 py-2" />
                    </div>
                    {/* Duration (chỉ cho chọn 1) */}
                    <div className="flex flex-col w-40">
                      <label className="block text-sm font-medium mb-1">Duration</label>
                      <select
                        className="border rounded px-3 py-2"
                        value={selectedDurationIds[0] || ""}
                        onChange={e => setSelectedDurationIds([e.target.value])}
                      >
                        <option value="">Chọn thời hạn</option>
                        {durations.map((d: any) => (
                          <option key={d.id} value={d.id}>{`${d.value} ${d.unit}`}</option>
                        ))}
                      </select>
                    </div>
                    {/* Hiển thị giá cuối cùng */}
                    <div className="flex flex-col w-56">
                      <label className="block text-sm font-medium mb-1">Giá cuối cùng</label>
                      <div className="text-lg font-bold text-blue-600">{finalPrice > 0 ? finalPrice.toLocaleString() + "₫" : "-"}</div>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4">Add Basic Package</button>
                </form>
              </div>
            </div>
          )}
          {/* Thêm popup detail */}
          {showDetailModal && selectedPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative animate-fade-in">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowDetailModal(false)}>&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Basic Package Detail</h2>
                <div className="space-y-2 text-gray-700">
                  <div><b>Service:</b> {selectedPlan.service}</div>
                  <div><b>Category:</b> {selectedPlan.category}</div>
                  <div><b>Status:</b> {selectedPlan.status}</div>
                  <div><b>Price:</b> {selectedPlan.price}</div>
                  <div><b>Plan Duration:</b> {selectedPlan.planDurationDescription}</div>
                  <div><b>Description:</b> {selectedPlan.raw?.description || "-"}</div>
                  <div><b>Location:</b> {selectedPlan.raw?.locationName || "-"}</div>
                  <div><b>Code:</b> {selectedPlan.raw?.code || "-"}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  )
}
