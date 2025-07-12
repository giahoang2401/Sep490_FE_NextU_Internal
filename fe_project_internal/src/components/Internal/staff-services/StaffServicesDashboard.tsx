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

const serviceColumns: TableColumn[] = [
  { key: "service", label: "Service", sortable: true },
  { key: "category", label: "Category" },
  { key: "status", label: "Status" },
  { key: "users", label: "Active Users", sortable: true },
  { key: "rating", label: "Rating", sortable: true },
]

const serviceData = [
  { service: "House Cleaning", category: "NextLiving", status: "Active", users: 245, rating: "4.8" },
  { service: "Maintenance Requests", category: "NextLiving", status: "Active", users: 189, rating: "4.6" },
  { service: "Coding Bootcamp", category: "NextAcademy", status: "Active", users: 156, rating: "4.9" },
  { service: "Language Exchange", category: "NextAcademy", status: "Maintenance", users: 98, rating: "4.7" },
  { service: "Meal Planning", category: "NextLiving", status: "Active", users: 203, rating: "4.5" },
]

const feedbackData = [
  { service: "House Cleaning", feedback: "Excellent service, very thorough!", rating: 5, user: "Alex R." },
  { service: "Coding Bootcamp", feedback: "Great instructor, learned a lot", rating: 5, user: "Maria G." },
  { service: "Maintenance", feedback: "Quick response time", rating: 4, user: "David K." },
  { service: "Meal Planning", feedback: "Helpful but could use more variety", rating: 4, user: "Sarah J." },
]

export default function StaffServicesDashboard() {
  // State cho modal và form
  const [showAddModal, setShowAddModal] = useState(false)
  const [basicPlanTypes, setBasicPlanTypes] = useState<any[]>([])
  const [accommodationOptions, setAccommodationOptions] = useState<any[]>([])
  const [durations, setDurations] = useState<any[]>([])
  const [selectedDurations, setSelectedDurations] = useState<{[key:string]: string}>({}) // {durationId: discountRate}
  const [selectedDurationIds, setSelectedDurationIds] = useState<string[]>([])
  const [form, setForm] = useState({
    locationId: "",
    basicPlanTypeId: "",
    roomTypeId: "",
    code: "",
    name: "",
    description: "",
    price: "",
  })
  const [selectedPlanType, setSelectedPlanType] = useState<any>(null)

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

  // Lấy AccommodationOptions nếu chọn Cors
  useEffect(() => {
    if (selectedPlanType && selectedPlanType.name === "Cors") {
      axios.get("/api/membership/AccommodationOptions").then(res => {
        setAccommodationOptions(res.data)
      })
    }
  }, [selectedPlanType])

  // Lấy durations
  useEffect(() => {
    axios.get("/api/membership/PackageDuration").then(res => {
      setDurations(res.data)
    })
  }, [])

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

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    // Gom packageDurations
    const packageDurations = selectedDurationIds.map(durationId => ({
      durationId,
      discountRate: Number(selectedDurations[durationId] || 0)
    }))
    // Kiểm tra locationId là GUID hợp lệ
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    if (!form.locationId || !guidRegex.test(form.locationId)) {
      alert("locationId không hợp lệ hoặc không phải GUID!")
      return
    }
    try {
      await axios.post("/api/membership/BasicPlans", { request: { ...form, packageDurations } })
      alert("Tạo Basic Package thành công!")
    } catch (err: any) {
      alert("Tạo Basic Package thất bại!" + (err?.response?.data?.message ? (": " + err.response.data.message) : ""))
    }
    setShowAddModal(false)
  }

  const renderServiceActions = (row: any) => (
    <div className="flex space-x-2">
      <button className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200">Manage</button>
      <button className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full hover:bg-gray-200">Settings</button>
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
                  <h3 className="text-lg font-medium text-gray-900">Active Services</h3>
                  <button
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Basic Package
                  </button>
                </div>
                <DataTable columns={serviceColumns} data={serviceData} actions={renderServiceActions} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Propose New Activity</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Location dropdown - Ẩn khỏi UI, chỉ giữ giá trị trong state */}
                  {/* <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <select name="locationId" value={form.locationId} onChange={handleChange} className="w-full border rounded px-3 py-2">
                      <option value="">Select Location</option>
                      {form.locationId && <option value={form.locationId}>{form.locationId}</option>}
                    </select>
                  </div> */}
                  {/* BasicPlanType dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Basic Plan Type</label>
                    <select name="basicPlanTypeId" value={form.basicPlanTypeId} onChange={handleChange} className="w-full border rounded px-3 py-2">
                      <option value="">Select Type</option>
                      {basicPlanTypes.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* AccommodationOptions dropdown nếu chọn Cors */}
                  {selectedPlanType && selectedPlanType.name === "Cors" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Room Type</label>
                      <select name="roomTypeId" value={form.roomTypeId} onChange={handleChange} className="w-full border rounded px-3 py-2">
                        <option value="">Select Room</option>
                        {accommodationOptions.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.roomTypeName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Các trường nhập tay */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Code</label>
                    <input name="code" value={form.code} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  {/* Durations */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Durations</label>
                    <select
                      multiple
                      className="w-full border rounded px-3 py-2"
                      value={selectedDurationIds}
                      onChange={handleDurationDropdownChange}
                    >
                      {durations.map((d: any) => (
                        <option key={d.id} value={d.id}>{`${d.value} ${d.unit}`}</option>
                      ))}
                    </select>
                    <div className="space-y-2 mt-2">
                      {selectedDurationIds.map(durationId => {
                        const d = durations.find((x: any) => String(x.id) === String(durationId))
                        return (
                          <div key={durationId} className="flex items-center space-x-2">
                            <span className="text-sm">{d ? `${d.value} ${d.unit}` : durationId}</span>
                            <input
                              type="number"
                              placeholder="Discount Rate (%)"
                              value={selectedDurations[durationId] || ""}
                              onChange={e => handleDiscountRateChange(e, durationId)}
                              className="ml-2 border rounded px-2 py-1 w-32"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Basic Package</button>
                </form>
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
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowAddModal(false)}>&times;</button>
                <h2 className="text-xl font-bold mb-4">Add Basic Package</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Location dropdown */}
                  {/* <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <select name="locationId" value={form.locationId} onChange={handleChange} className="w-full border rounded px-3 py-2">
                      <option value="">Select Location</option>
                      {form.locationId && <option value={form.locationId}>{form.locationId}</option>}
                    </select>
                  </div> */}
                  {/* BasicPlanType dropdown */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Basic Plan Type</label>
                    <select name="basicPlanTypeId" value={form.basicPlanTypeId} onChange={handleChange} className="w-full border rounded px-3 py-2">
                      <option value="">Select Type</option>
                      {basicPlanTypes.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* AccommodationOptions dropdown nếu chọn Cors */}
                  {selectedPlanType && selectedPlanType.name === "Cors" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Room Type</label>
                      <select name="roomTypeId" value={form.roomTypeId} onChange={handleChange} className="w-full border rounded px-3 py-2">
                        <option value="">Select Room</option>
                        {accommodationOptions.map((r: any) => (
                          <option key={r.id} value={r.id}>{r.roomTypeName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {/* Các trường nhập tay */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Code</label>
                    <input name="code" value={form.code} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                  </div>
                  {/* Durations */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Durations</label>
                    <select
                      multiple
                      className="w-full border rounded px-3 py-2"
                      value={selectedDurationIds}
                      onChange={handleDurationDropdownChange}
                    >
                      {durations.map((d: any) => (
                        <option key={d.id} value={d.id}>{`${d.value} ${d.unit}`}</option>
                      ))}
                    </select>
                    <div className="space-y-2 mt-2">
                      {selectedDurationIds.map(durationId => {
                        const d = durations.find((x: any) => String(x.id) === String(durationId))
                        return (
                          <div key={durationId} className="flex items-center space-x-2">
                            <span className="text-sm">{d ? `${d.value} ${d.unit}` : durationId}</span>
                            <input
                              type="number"
                              placeholder="Discount Rate (%)"
                              value={selectedDurations[durationId] || ""}
                              onChange={e => handleDiscountRateChange(e, durationId)}
                              className="ml-2 border rounded px-2 py-1 w-32"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Basic Package</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  )
}
