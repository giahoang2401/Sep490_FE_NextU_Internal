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

  // 1. State cho combo packages
  const [comboPlans, setComboPlans] = useState<any[]>([])
  const [packageLevels, setPackageLevels] = useState<any[]>([])
  const [showAddComboModal, setShowAddComboModal] = useState(false)
  const [showComboDetailModal, setShowComboDetailModal] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState<any>(null)
  const [comboCurrentPage, setComboCurrentPage] = useState(1)
  const comboPageSize = 5
  const [formCombo, setFormCombo] = useState({
    code: '',
    name: '',
    discountRate: 0,
    packageLevelId: '',
  })
  const [selectedComboBasic, setSelectedComboBasic] = useState<{accommodation: string|null, lifeActivities: string[]}>({accommodation: null, lifeActivities: []})
  const [comboError, setComboError] = useState('')

  // 1. State cho popup chọn basic
  const [showSelectAccommodation, setShowSelectAccommodation] = useState(false)
  const [showSelectLife, setShowSelectLife] = useState(false)
  const [searchAccommodation, setSearchAccommodation] = useState('')
  const [searchLife, setSearchLife] = useState('')
  const [comboDurationId, setComboDurationId] = useState('')

  // Thêm state cho entitlement
  const [entitlements, setEntitlements] = useState<any[]>([])
  const [selectedEntitlementId, setSelectedEntitlementId] = useState('')

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

  // Khi chọn type là LIFEACTIVITIES thì fetch entitlement
  useEffect(() => {
    if (selectedPlanType && selectedPlanType.code === 'LIFEACTIVITIES') {
      axios.get('/api/membership/EntitlementRule').then(res => setEntitlements(res.data))
    } else {
      setEntitlements([])
      setSelectedEntitlementId('')
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

  // Khi chọn entitlement cho Life Activities, tự động lấy giá và nhân với duration
  useEffect(() => {
    if (selectedPlanType && selectedPlanType.code === 'LIFEACTIVITIES' && selectedEntitlementId) {
      const ent = entitlements.find((e: any) => e.id === selectedEntitlementId)
      let months = 1
      if (selectedDurationIds.length > 0 && durations.length > 0) {
        const duration = durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))
        if (duration) {
          months = duration.unit.toLowerCase() === 'month' ? duration.value : duration.unit.toLowerCase() === 'year' ? duration.value * 12 : 1
        }
      }
      if (ent && ent.price) {
        setFinalPrice(ent.price * months)
      } else {
        setFinalPrice(0)
      }
    }
  }, [selectedPlanType, selectedEntitlementId, entitlements, selectedDurationIds, durations])

  // 2. Lấy comboPlans, packageLevels
  useEffect(() => {
    // Lấy combo plans
    let locationId = ''
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('nextu_internal_user')
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr)
          locationId = userObj.location || ''
        } catch {}
      }
    }
    if (locationId) {
      axios.get(`/api/membership/ComboPlans?locationId=${locationId}`)
        .then(res => setComboPlans(res.data))
    }
    // Lấy package levels
    axios.get('/api/membership/PackageLevel').then(res => setPackageLevels(res.data))
  }, [])

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

  // Map combo plans cho bảng
  const mappedComboPlans = comboPlans.map(plan => ({
    service: plan.name,
    category: 'Combo',
    status: plan.status || 'Active',
    price: plan.totalPrice?.toLocaleString() + '₫' || '-',
    planDurationDescription: plan.packageDurations && plan.packageDurations.length > 0
      ? plan.packageDurations.map((d: any) => `${d.durationValue || d.durationId} ${d.durationUnit || ''}`).join(', ')
      : '-',
    raw: plan,
  }))
  const comboTotalPages = Math.ceil(mappedComboPlans.length / comboPageSize)
  const pagedComboPlans = mappedComboPlans.slice((comboCurrentPage - 1) * comboPageSize, comboCurrentPage * comboPageSize)

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

  // Render actions: Combo Detail
  const renderComboActions = (row: any) => (
    <div className="flex space-x-2">
      <button
        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200"
        onClick={() => { setSelectedCombo(row.raw); setShowComboDetailModal(true) }}
      >
        Detail
      </button>
    </div>
  )

  // 3. Modal Add Basic Package
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
    // Nếu là LIFEACTIVITIES thì gửi entitlements: [{ entitlementRuleId, quantity: 0 }]
    if (selectedPlanType && selectedPlanType.code === 'LIFEACTIVITIES' && selectedEntitlementId) {
      extra = { ...extra, entitlements: [{ entitlementRuleId: selectedEntitlementId, quantity: 1 }] }
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

  // 4. Modal Add Combo Package
  const handleComboBasicSelect = (type: 'accommodation'|'life', id: string) => {
    if (type === 'accommodation') {
      setSelectedComboBasic(prev => ({ ...prev, accommodation: id }))
    } else {
      setSelectedComboBasic(prev => {
        let arr = prev.lifeActivities.includes(id)
          ? prev.lifeActivities.filter(x => x !== id)
          : [...prev.lifeActivities, id]
        if (arr.length > 3) arr = arr.slice(0, 3)
        return { ...prev, lifeActivities: arr }
      })
    }
  }
  const handleAddComboSubmit = async (e: any) => {
    e.preventDefault()
    setComboError('')
    // Validate
    if (!formCombo.code || !formCombo.name || !formCombo.packageLevelId) {
      setComboError('Vui lòng nhập đủ thông tin!')
      return
    }
    if (!selectedComboBasic.accommodation) {
      setComboError('Chọn 1 gói ACCOMMODATION!')
      return
    }
    if (selectedComboBasic.lifeActivities.length < 2) {
      setComboError('Chọn ít nhất 2 gói LIFEACTIVITIES!')
      return
    }
    // Lấy locationId và locationName
    let locationId = ''
    let locationName = ''
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('nextu_internal_user')
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr)
          locationId = userObj.location || ''
          locationName = userObj.locationName || ''
        } catch {}
      }
    }
    // Nếu locationName chưa có, lấy từ basicPlans (ưu tiên gói accommodation)
    if (!locationName) {
      const accPlan = basicPlans.find((b: any) => b.id === selectedComboBasic.accommodation)
      if (accPlan && accPlan.locationName) locationName = accPlan.locationName
    }
    // Lấy packageLevelName
    let packageLevelName = ''
    const pkgLevel = packageLevels.find((l: any) => l.id === formCombo.packageLevelId)
    if (pkgLevel) packageLevelName = pkgLevel.name
    // Tính totalPrice và packageDurations
    const totalPrice = comboPriceInfo.totalAfterDiscount
    const packageDurations = comboDurationId ? [{
      durationId: comboDurationId,
      discountRate: Number(formCombo.discountRate) || 0
    }] : []
    // Gửi API
    try {
      await axios.post('/api/membership/ComboPlans', {
        code: formCombo.code,
        name: formCombo.name,
        discountRate: Number(formCombo.discountRate),
        isSuggested: true,
        verifyBuy: false,
        locationId,
        locationName,
        packageLevelId: formCombo.packageLevelId,
        packageLevelName,
        basicPlanIds: [selectedComboBasic.accommodation, ...selectedComboBasic.lifeActivities],
        totalPrice,
        packageDurations
      })
      alert('Tạo Combo Package thành công!')
      setShowAddComboModal(false)
      setFormCombo({ code: '', name: '', discountRate: 0, packageLevelId: '' })
      setSelectedComboBasic({ accommodation: null, lifeActivities: [] })
      // Reload combo plans để lấy đủ totalPrice, locationName, packageLevelName
      axios.get(`/api/membership/ComboPlans?locationId=${locationId}`).then(res => setComboPlans(res.data))
    } catch (err: any) {
      setComboError('Tạo Combo Package thất bại! ' + (err?.response?.data?.message || ''))
    }
  }

  // Thêm hàm lấy duration object từ id
  const getDurationObj = (id: string) => durations.find((d: any) => String(d.id) === String(id))

  // Tính tổng giá combo (có discount)
  const calculateComboTotal = () => {
    if (!comboDurationId) return { total: 0, details: [], totalAfterDiscount: 0, discountAmount: 0 }
    const comboDuration = getDurationObj(comboDurationId)
    if (!comboDuration) return { total: 0, details: [], totalAfterDiscount: 0, discountAmount: 0 }
    const selectedIds = [selectedComboBasic.accommodation, ...selectedComboBasic.lifeActivities].filter(Boolean)
    let total = 0
    const details = selectedIds.map(id => {
      const plan = basicPlans.find((b: any) => b.id === id)
      if (!plan) return null
      // Lấy duration đầu tiên của basic (giả sử chỉ có 1)
      const basicDuration = plan.planDurations && plan.planDurations[0]
      let price = plan.price || 0
      let months = 1
      if (basicDuration && comboDuration.unit && basicDuration.planDurationUnit) {
        // Chuyển đổi duration về tháng
        const comboMonths = comboDuration.unit.toLowerCase() === 'month' ? comboDuration.value : comboDuration.unit.toLowerCase() === 'year' ? comboDuration.value * 12 : 1
        const basicMonths = basicDuration.planDurationUnit.toLowerCase() === 'month' ? basicDuration.planDurationValue : basicDuration.planDurationUnit.toLowerCase() === 'year' ? basicDuration.planDurationValue * 12 : 1
        months = Math.round(comboMonths / basicMonths)
        price = price * months
      }
      total += price
      return { name: plan.name, price: plan.price, months, total: price, duration: basicDuration ? `${basicDuration.planDurationValue} ${basicDuration.planDurationUnit}` : '-' }
    }).filter(Boolean)
    // Discount
    const discountRate = Number(formCombo.discountRate) || 0
    const discountAmount = Math.round(total * discountRate / 100)
    const totalAfterDiscount = total - discountAmount
    return { total, details, totalAfterDiscount, discountAmount }
  }
  const comboPriceInfo = calculateComboTotal()

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
              {/* Combo Packages Box */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Combo Packages</h3>
                  <button
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowAddComboModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Combo Package
                  </button>
                  </div>
                <DataTable columns={serviceColumns} data={pagedComboPlans} actions={renderComboActions} />
                {/* Phân trang dưới bảng */}
                <div className="flex justify-end mt-2">
                  <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      disabled={comboCurrentPage === 1}
                      onClick={() => setComboCurrentPage(p => Math.max(1, p - 1))}
                      className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {[...Array(comboTotalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setComboCurrentPage(idx + 1)}
                        className={`relative inline-flex items-center px-3 py-1 border-t border-b border-gray-300 text-sm font-medium ${comboCurrentPage === idx + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      disabled={comboCurrentPage === comboTotalPages}
                      onClick={() => setComboCurrentPage(p => Math.min(comboTotalPages, p + 1))}
                      className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                  </div>
              </div>

              {/* Recent Feedback Box giữ nguyên */}
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
                    {selectedPlanType && selectedPlanType.code === 'LIFEACTIVITIES' && (
                      <div className="flex flex-col w-56">
                        <label className="block text-sm font-medium mb-1">Entitlement</label>
                        <select value={selectedEntitlementId} onChange={e => setSelectedEntitlementId(e.target.value)} className="border rounded px-3 py-2">
                          <option value="">Chọn entitlement</option>
                          {entitlements.map((e: any) => (
                            <option key={e.id} value={e.id}>{e.nextUServiceName} (Giá: {e.price?.toLocaleString()}₫, {e.note})</option>
                          ))}
                        </select>
                      </div>
                    )}
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
                {(() => {
                  const plan = selectedPlan
                  const hasData = plan.name || plan.basicPlanType || plan.status || plan.price || (plan.planDurations && plan.planDurations.length > 0) || plan.description || plan.locationName || plan.code || (plan.entitlements && plan.entitlements.length > 0)
                  if (!hasData) return <div className="text-gray-400 italic">No data available.</div>
                  return (
                    <div className="space-y-2 text-gray-700">
                      {plan.name && <div><b>Name:</b> {plan.name}</div>}
                      {plan.basicPlanType && <div><b>Type:</b> {plan.basicPlanType}</div>}
                      {plan.status && <div><b>Status:</b> {plan.status}</div>}
                      {plan.price !== undefined && plan.price !== null && plan.price !== '' && <div><b>Price:</b> {Number(plan.price).toLocaleString('vi-VN')}₫</div>}
                      {plan.planDurations && plan.planDurations.length > 0 && <div><b>Duration:</b> {plan.planDurations.map((d: any) => `${d.planDurationValue} ${d.planDurationUnit}`).join(', ')}</div>}
                      {plan.description && <div><b>Description:</b> {plan.description}</div>}
                      {plan.locationName && <div><b>Location:</b> {plan.locationName}</div>}
                      {plan.code && <div><b>Code:</b> {plan.code}</div>}
                      {plan.entitlements && plan.entitlements.length > 0 && (
                        <div>
                          <b>Entitlements:</b>
                          <ul className="list-disc ml-6">
                            {plan.entitlements.map((e: any, idx: number) => (
                              <li key={idx}>
                                {e.nextUServiceName || e.entitlementId || e.entitlementRuleId || ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* Modal Add Combo Package */}
          {showAddComboModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative animate-fade-in">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowAddComboModal(false)}>&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Add Combo Package</h2>
                <form className="space-y-4" onSubmit={handleAddComboSubmit}>
                  <div className="flex flex-row flex-wrap gap-4 items-end">
                    <div className="flex flex-col w-40">
                      <label className="block text-sm font-medium mb-1">Code</label>
                      <input name="code" value={formCombo.code} onChange={e => setFormCombo(f => ({ ...f, code: e.target.value }))} className="border rounded px-3 py-2" />
                    </div>
                    <div className="flex flex-col w-40">
                    <label className="block text-sm font-medium mb-1">Name</label>
                      <input name="name" value={formCombo.name} onChange={e => setFormCombo(f => ({ ...f, name: e.target.value }))} className="border rounded px-3 py-2" />
                    </div>
                    <div className="flex flex-col w-40">
                      <label className="block text-sm font-medium mb-1">Discount Rate (%)</label>
                      <input name="discountRate" type="number" value={formCombo.discountRate} onChange={e => setFormCombo(f => ({ ...f, discountRate: Number(e.target.value) }))} className="border rounded px-3 py-2" />
                  </div>
                    <div className="flex flex-col w-56">
                      <label className="block text-sm font-medium mb-1">Package Level</label>
                      <select name="packageLevelId" value={formCombo.packageLevelId} onChange={e => setFormCombo(f => ({ ...f, packageLevelId: e.target.value }))} className="border rounded px-3 py-2">
                        <option value="">Select Level</option>
                        {packageLevels.map((l: any) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                  </div>
                  <div className="flex flex-col w-56">
                    <label className="block text-sm font-medium mb-1">Combo Duration</label>
                    <select value={comboDurationId} onChange={e => setComboDurationId(e.target.value)} className="border rounded px-3 py-2">
                      <option value="">Chọn thời hạn</option>
                      {durations.map((d: any) => (
                        <option key={d.id} value={d.id}>{`${d.value} ${d.unit}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Nút chọn Accommodation và Life Activities */}
                <div className="flex flex-row gap-8 mt-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Accommodation (chọn 1)</label>
                    <button type="button" className="px-3 py-2 bg-blue-100 rounded hover:bg-blue-200 text-blue-800" onClick={() => setShowSelectAccommodation(true)}>
                      {selectedComboBasic.accommodation ? basicPlans.find((b: any) => b.id === selectedComboBasic.accommodation)?.name : 'Chọn Accommodation'}
                    </button>
                    {/* Tag đã chọn */}
                    {selectedComboBasic.accommodation && (
                      <div className="flex items-center mt-2">
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold shadow border border-blue-300 flex items-center gap-2">
                          {basicPlans.find((b: any) => b.id === selectedComboBasic.accommodation)?.name}
                          <button type="button" className="ml-1 text-blue-500 hover:text-red-500 text-lg font-bold focus:outline-none" onClick={() => setSelectedComboBasic(prev => ({ ...prev, accommodation: null }))} title="Bỏ chọn">
                            ×
                          </button>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Life Activities (chọn 2-3)</label>
                    <button type="button" className="px-3 py-2 bg-green-100 rounded hover:bg-green-200 text-green-800" onClick={() => setShowSelectLife(true)}>
                      {selectedComboBasic.lifeActivities.length > 0 ? `${selectedComboBasic.lifeActivities.length} đã chọn` : 'Chọn Life Activities'}
                    </button>
                    {/* Tag đã chọn */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedComboBasic.lifeActivities.map(id => (
                        <span key={id} className="px-4 py-2 bg-green-50 text-green-800 rounded-full text-sm font-semibold shadow border border-green-300 flex items-center gap-2 hover:bg-green-100 transition">
                          {basicPlans.find((b: any) => b.id === id)?.name}
                          <button type="button" className="ml-1 text-green-500 hover:text-red-500 text-lg font-bold focus:outline-none" onClick={() => setSelectedComboBasic(prev => ({ ...prev, lifeActivities: prev.lifeActivities.filter(x => x !== id) }))} title="Bỏ chọn">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Bảng chi tiết giá các basic đã chọn */}
                {comboDurationId && (comboPriceInfo.details.length > 0) && (
                  <div className="mt-6">
                    <table className="min-w-full text-sm border rounded-lg overflow-hidden shadow-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="px-3 py-2 border">Tên gói</th>
                          <th className="px-3 py-2 border">Giá gốc</th>
                          <th className="px-3 py-2 border">Duration Basic</th>
                          <th className="px-3 py-2 border">Số lần nhân</th>
                          <th className="px-3 py-2 border">Tổng giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comboPriceInfo.details.map((d, idx) => d && (
                          <tr key={idx} className="hover:bg-blue-50">
                            <td className="px-3 py-2 border font-medium text-blue-900">{d.name}</td>
                            <td className="px-3 py-2 border">{d.price?.toLocaleString()}₫</td>
                            <td className="px-3 py-2 border">{d.duration}</td>
                            <td className="px-3 py-2 border text-center">{d.months}</td>
                            <td className="px-3 py-2 border font-bold text-right">{d.total?.toLocaleString()}₫</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-3 py-2 border text-right" colSpan={4}>Tổng cộng</td>
                          <td className="px-3 py-2 border text-blue-700 text-right">{comboPriceInfo.total.toLocaleString()}₫</td>
                        </tr>
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-3 py-2 border text-right" colSpan={4}>Giảm giá ({formCombo.discountRate || 0}%)</td>
                          <td className="px-3 py-2 border text-red-600 text-right">-{comboPriceInfo.discountAmount.toLocaleString()}₫</td>
                        </tr>
                        <tr className="bg-blue-100 font-bold">
                          <td className="px-3 py-2 border text-right" colSpan={4}>Thành tiền</td>
                          <td className="px-3 py-2 border text-green-700 text-right text-lg">{comboPriceInfo.totalAfterDiscount.toLocaleString()}₫</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
                {comboError && <div className="text-red-500 text-sm mt-2">{comboError}</div>}
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-4">Add Combo Package</button>
              </form>
            </div>
          </div>
)}

{/* Popup chọn Accommodation */}
{showSelectAccommodation && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative animate-fade-in">
      <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowSelectAccommodation(false)}>&times;</button>
      <h3 className="text-lg font-bold mb-4">Chọn Accommodation</h3>
      <input type="text" placeholder="Tìm kiếm..." className="border rounded px-3 py-2 mb-4 w-full" value={searchAccommodation} onChange={e => setSearchAccommodation(e.target.value)} />
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
        {basicPlans.filter((b: any) => b.basicPlanTypeCode === 'ACCOMMODATION' && b.name.toLowerCase().includes(searchAccommodation.toLowerCase())).map((b: any) => (
          <button key={b.id} type="button" className={`flex flex-col items-start border rounded p-2 hover:bg-blue-50 ${selectedComboBasic.accommodation === b.id ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => { setSelectedComboBasic(prev => ({ ...prev, accommodation: b.id })); setShowSelectAccommodation(false) }}>
            <span className="font-medium text-blue-900">{b.name}</span>
            <span className="text-xs text-gray-500">Giá: {b.price?.toLocaleString()}₫</span>
            <span className="text-xs text-gray-500">Duration: {b.planDurations && b.planDurations[0] ? `${b.planDurations[0].planDurationValue} ${b.planDurations[0].planDurationUnit}` : '-'}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
)}
{/* Popup chọn Life Activities */}
{showSelectLife && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative animate-fade-in">
      <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowSelectLife(false)}>&times;</button>
      <h3 className="text-lg font-bold mb-4">Chọn Life Activities (2-3)</h3>
      <input type="text" placeholder="Tìm kiếm..." className="border rounded px-3 py-2 mb-4 w-full" value={searchLife} onChange={e => setSearchLife(e.target.value)} />
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
        {basicPlans.filter((b: any) => b.basicPlanTypeCode === 'LIFEACTIVITIES' && b.name.toLowerCase().includes(searchLife.toLowerCase())).map((b: any) => {
          const checked = selectedComboBasic.lifeActivities.includes(b.id)
          return (
            <button key={b.id} type="button" className={`flex flex-col items-start border rounded p-2 hover:bg-green-50 ${checked ? 'border-green-500 bg-green-50' : ''}`} onClick={() => {
              let arr = checked ? selectedComboBasic.lifeActivities.filter(x => x !== b.id) : [...selectedComboBasic.lifeActivities, b.id]
              if (arr.length > 3) arr = arr.slice(0, 3)
              setSelectedComboBasic(prev => ({ ...prev, lifeActivities: arr }))
            }}>
              <span className="font-medium text-green-900">{b.name}</span>
              <span className="text-xs text-gray-500">Giá: {b.price?.toLocaleString()}₫</span>
              <span className="text-xs text-gray-500">Duration: {b.planDurations && b.planDurations[0] ? `${b.planDurations[0].planDurationValue} ${b.planDurations[0].planDurationUnit}` : '-'}</span>
              {checked && <span className="text-xs text-green-700">Đã chọn</span>}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium" onClick={() => setShowSelectLife(false)}>Xong</button>
      </div>
    </div>
  </div>
)}
          {/* Thêm popup detail combo */}
          {showComboDetailModal && selectedCombo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative animate-fade-in">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowComboDetailModal(false)}>&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Combo Package Detail</h2>
                <div className="space-y-2 text-gray-700">
                  <div><b>Combo:</b> {selectedCombo.name}</div>
                  <div><b>Code:</b> {selectedCombo.code}</div>
                  <div><b>Discount Rate:</b> {selectedCombo.discountRate}</div>
                  <div><b>Level:</b> {packageLevels.find(l => l.id === selectedCombo.packageLevelId)?.name || '-'}</div>
                  <div><b>Basic Packages:</b> {(selectedCombo.basicPlanIds || []).map((id: string) => basicPlans.find((b: any) => b.id === id)?.name).join(', ')}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  )
}
