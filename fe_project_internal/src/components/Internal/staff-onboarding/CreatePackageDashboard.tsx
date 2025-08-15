"use client"

import { UserPlus, CreditCard, Users, Package, Calendar, Plus, Star, Home, GraduationCap, Lightbulb, MessageSquare } from "lucide-react"
import Sidebar from "../shared/sidebar"
import TopNav from "../shared/topNav"
import DataTable from "../shared/dataTable"
import RoleLayout from "../shared/roleLayout"
import type { NavigationItem, User, TableColumn } from "../types"
import { useState, useEffect } from "react"
import axios from "../../../utils/axiosConfig"

const navigation: NavigationItem[] = [
  { name: "Applications", href: "/staff-onboarding", icon: UserPlus },
  { name: "Payment Guide", href: "/staff-onboarding/payments", icon: CreditCard },
  { name: "User Status", href: "/staff-onboarding/status", icon: Users },
  { name: "Create Packages", href: "/staff-onboarding/packages", icon: Package, current: true },
  { name: "Schedule Events", href: "/staff-onboarding/events", icon: Calendar },
]

const mockUser: User = {
  id: "4",
  name: "Emily Chen",
  email: "emily@nextu.com",
  role: "Staff_Onboarding",
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

export default function CreatePackageDashboard() {
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
    propertyId: "",
    roomTypeId: "",
    price: "",
    basicPlanCategoryId: "",
    planLevelId: "",
    targetAudienceId: "",
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
  
  // State cho filter và search
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  
  // State cho combo filter và search
  const [comboSearchTerm, setComboSearchTerm] = useState("")
  const [comboStatusFilter, setComboStatusFilter] = useState("all")

  // 1. State cho combo packages
  const [comboPlans, setComboPlans] = useState<any[]>([])
  const [showAddComboModal, setShowAddComboModal] = useState(false)
  const [showComboDetailModal, setShowComboDetailModal] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState<any>(null)
  const [comboCurrentPage, setComboCurrentPage] = useState(1)
  const comboPageSize = 5
  const [formCombo, setFormCombo] = useState({
    code: '',
    name: '',
    discountRate: 0,
    planLevelId: '',
    basicPlanCategoryId: '',
    targetAudienceId: '',
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

  // Thêm state cho các API mới
  const [planLevels, setPlanLevels] = useState<any[]>([])
  const [planTargetAudiences, setPlanTargetAudiences] = useState<any[]>([])
  const [planCategories, setPlanCategories] = useState<any[]>([])

  // Lấy propertyId từ localStorage (key: nextu_internal_user)
  useEffect(() => {
    if (showAddModal) {
      let propertyId = ""
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("nextu_internal_user")
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr)
            propertyId = userObj.location || ""
          } catch {}
        }
      }
      setForm(f => ({ ...f, propertyId }))
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

  // Lấy PlanLevels từ API /api/PlanLevel
  useEffect(() => {
    axios.get("/api/PlanLevel").then(res => {
      setPlanLevels(res.data)
    })
  }, [])

  // Lấy PlanTargetAudiences từ API /api/PlanTargetAudience
  useEffect(() => {
    axios.get("/api/PlanTargetAudience").then(res => {
      setPlanTargetAudiences(res.data)
    })
  }, [])

  // Lấy PlanCategories từ API /api/PlanCategory
  useEffect(() => {
    axios.get("/api/PlanCategory").then(res => {
      setPlanCategories(res.data)
    })
  }, [])

  // Lấy danh sách basic package theo property khi load trang
  const fetchBasicPlans = () => {
    let propertyId = ""
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("nextu_internal_user")
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr)
          propertyId = userObj.location || ""
        } catch {}
      }
    }
    if (propertyId) {
      axios.get(`/api/membership/BasicPlans?propertyId=${propertyId}`)
        .then(res => {
          setBasicPlans(res.data)
        })
    }
  }

  useEffect(() => {
    fetchBasicPlans()
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

  // 2. Lấy comboPlans
  const fetchComboPlans = () => {
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
      axios.get(`/api/membership/ComboPlans?propertyId=${locationId}`)
        .then(res => setComboPlans(res.data))
    }
  }

  useEffect(() => {
    fetchComboPlans()
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

  // Filter và search logic
  const filteredPlans = mappedPlans.filter(plan => {
    const matchesSearch = searchTerm === "" || 
      plan.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.raw.code?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter
    const matchesType = typeFilter === "all" || plan.category === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter])

  // Phân trang
  const totalPages = Math.ceil(filteredPlans.length / pageSize)
  const pagedPlans = filteredPlans.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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

  // Filter và search logic cho combo
  const filteredComboPlans = mappedComboPlans.filter(plan => {
    const matchesSearch = comboSearchTerm === "" || 
      plan.service.toLowerCase().includes(comboSearchTerm.toLowerCase()) ||
      plan.raw.code?.toLowerCase().includes(comboSearchTerm.toLowerCase())
    
    const matchesStatus = comboStatusFilter === "all" || plan.status === comboStatusFilter
    
    return matchesSearch && matchesStatus
  })

  // Reset combo page khi filter thay đổi
  useEffect(() => {
    setComboCurrentPage(1)
  }, [comboSearchTerm, comboStatusFilter])

  const comboTotalPages = Math.ceil(filteredComboPlans.length / comboPageSize)
  const pagedComboPlans = filteredComboPlans.slice((comboCurrentPage - 1) * comboPageSize, comboCurrentPage * comboPageSize)

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
    // Kiểm tra propertyId là GUID hợp lệ
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    if (!form.propertyId || !guidRegex.test(form.propertyId)) {
      alert("propertyId không hợp lệ hoặc không phải GUID!")
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
        basicPlanCategoryId: Number(form.basicPlanCategoryId),
        ...extra
      })
      alert("Tạo Basic Package thành công!")
      // Refresh danh sách basic plans sau khi tạo thành công
      fetchBasicPlans()
      // Reset form và modal
      setForm({
        code: "",
        name: "",
        description: "",
        basicPlanTypeId: "",
        propertyId: "",
        roomTypeId: "",
        price: "",
        basicPlanCategoryId: "",
        planLevelId: "",
        targetAudienceId: "",
      })
      setSelectedPlanType(null)
      setSelectedRoom(null)
      setSelectedDurationIds([])
      setSelectedDurations({})
      setSelectedEntitlementId("")
      setFinalPrice(0)
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
    // Validate - Cần validate tất cả các field bắt buộc
    if (!formCombo.code || !formCombo.name || !formCombo.planLevelId || !formCombo.basicPlanCategoryId || !formCombo.targetAudienceId) {
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
    // packageLevelName is no longer needed since API uses planLevelId as number
    // Tính totalPrice và packageDurations
    const totalPrice = comboPriceInfo.total
    const packageDurations = comboDurationId ? [{
      durationId: comboDurationId,
      discountRate: (Number(formCombo.discountRate) || 0) / 100 // Convert percentage to decimal (15 -> 0.15)
    }] : []
    // Gửi API - Sửa lại theo format chuẩn
    const payload = {
      code: formCombo.code,
      name: formCombo.name,
      totalPrice,
      discountRate: Number(formCombo.discountRate) / 100, // Convert percentage to decimal (15 -> 0.15)
      isSuggested: true,
      verifyBuy: false,
      propertyId: locationId, // From localStorage
      basicPlanCategoryId: Number(formCombo.basicPlanCategoryId), // From user selection
      planLevelId: Number(formCombo.planLevelId), // From user selection
      targetAudienceId: Number(formCombo.targetAudienceId), // From user selection
      basicPlanIds: [selectedComboBasic.accommodation, ...selectedComboBasic.lifeActivities],
      packageDurations: packageDurations.map(pd => ({
        durationId: Number(pd.durationId),
        discountRate: Number(pd.discountRate) // Already converted to decimal above (15% -> 0.15)
      }))
    };
    
    console.log('=== COMBO PAYLOAD BEING SENT ===', payload);
    console.log('=== EXPECTED FORMAT ===', {
      "code": "CB_Vi698",
      "name": "Nguyễn Hoàng Gia",
      "totalPrice": 31696500,
      "discountRate": 0.15,
      "isSuggested": true,
      "verifyBuy": false,
      "propertyId": "30000000-0000-0000-0000-000000000001",
      "basicPlanCategoryId": 1,
      "planLevelId": 1,
      "targetAudienceId": 1,
      "basicPlanIds": ["3b3ffde1-387d-447d-397a-08dddb541fe2","50033192-2e9f-4fbe-d1d1-08dddb6bd27f","5d060abe-ec39-422a-d1d0-08dddb6bd27f"],
      "packageDurations": [{"durationId": 2, "discountRate": 0.15}]
    });
    
    try {
      await axios.post('/api/membership/ComboPlans', payload);
      alert('Tạo Combo Package thành công!')
      // Refresh danh sách combo plans sau khi tạo thành công
      fetchComboPlans()
      // Reset form và modal
      setShowAddComboModal(false)
      setFormCombo({ code: '', name: '', discountRate: 0, planLevelId: '', basicPlanCategoryId: '', targetAudienceId: '' })
      setSelectedComboBasic({ accommodation: null, lifeActivities: [] })
      setComboDurationId('')
      setComboError('')
    } catch (err: any) {
      setComboError('Tạo Combo Package thất bại! ' + (err?.response?.data?.message || ''))
    }
  }

  // Thêm hàm lấy duration object từ id
  const getDurationObj = (id: string) => durations.find((d: any) => String(d.id) === String(id))

  // Tính tổng giá combo (không có discount)
  const calculateComboTotal = () => {
    if (!comboDurationId) return { total: 0, details: [] }
    const comboDuration = getDurationObj(comboDurationId)
    if (!comboDuration) return { total: 0, details: [] }
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
    return { total, details }
  }
  const comboPriceInfo = calculateComboTotal()

  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="Staff Onboarding" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Package Creation Management" />

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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Basic packages - 3/4 width */}
            <div className="lg:col-span-3">
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
                
                {/* Search and Filter Section */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search packages, types, or codes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    
                    {/* Type Filter */}
                    <div className="w-full md:w-48">
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Types</option>
                        <option value="Living">Living</option>
                        <option value="Life activities">Life activities</option>
                      </select>
                    </div>
                    
                    {/* Clear Filters */}
                    {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setTypeFilter("all")
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  
                  {/* Results count */}
                  <div className="mt-3 text-sm text-gray-600">
                    Showing {pagedPlans.length} of {filteredPlans.length} packages
                    {searchTerm && ` for "${searchTerm}"`}
                  </div>
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

            {/* Recent Feedback Box - Side column */}
            <div className="lg:col-span-1">
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

          {/* Combo Packages - Same width as Basic packages */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        <div className="lg:col-span-3">
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
                
                {/* Search and Filter Section for Combo */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search combo packages or codes..."
                          value={comboSearchTerm}
                          onChange={(e) => setComboSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Filter */}
                    <div className="w-full md:w-48">
                      <select
                        value={comboStatusFilter}
                        onChange={(e) => setComboStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    
                    {/* Clear Filters */}
                    {(comboSearchTerm || comboStatusFilter !== "all") && (
                      <button
                        onClick={() => {
                          setComboSearchTerm("")
                          setComboStatusFilter("all")
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  
                  {/* Results count */}
                  <div className="mt-3 text-sm text-gray-600">
                    Showing {pagedComboPlans.length} of {filteredComboPlans.length} combo packages
                    {comboSearchTerm && ` for "${comboSearchTerm}"`}
                  </div>
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
            </div>
            {/* Empty space to maintain alignment */}
            <div className="lg:col-span-1"></div>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-5xl relative max-h-[95vh] overflow-y-auto">
                <button 
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
                
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Add Basic Package</h2>
                  <p className="text-sm text-gray-600">Create a new basic package for your services</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Step 1: Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Type *</label>
                        <select 
                          name="basicPlanTypeId" 
                          value={form.basicPlanTypeId} 
                          onChange={handleChange} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Package Type</option>
                          {basicPlanTypes.map((b: any) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Code *</label>
                        <input 
                          name="code" 
                          value={form.code} 
                          onChange={handleChange} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter package code"
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                        <input 
                          name="name" 
                          value={form.name} 
                          onChange={handleChange} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter package name"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea 
                        name="description" 
                        value={form.description} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter package description"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Step 2: Configuration */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
                      Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Room Type for Accommodation */}
                      {selectedPlanType && selectedPlanType.code === "ACCOMMODATION" && (
                        <div className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type *</label>
                          <select 
                            name="roomTypeId" 
                            value={form.roomTypeId} 
                            onChange={handleChange} 
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                          >
                            <option value="">Select Room Type</option>
                            {accommodationOptions.map((r: any) => (
                              <option key={r.id} value={r.id}>
                                {r.roomTypeName} ({r.pricePerNight.toLocaleString()}₫/night)
                              </option>
                            ))}
                          </select>
                          {selectedRoom && (
                            <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="text-xs text-blue-800">
                                <span className="font-medium">Room Price:</span> {selectedRoom.pricePerNight.toLocaleString()}₫/night
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Entitlement for Life Activities */}
                      {selectedPlanType && selectedPlanType.code === 'LIFEACTIVITIES' && (
                        <div className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Entitlement *</label>
                          <select 
                            value={selectedEntitlementId} 
                            onChange={e => setSelectedEntitlementId(e.target.value)} 
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                          >
                            <option value="">Select Entitlement</option>
                            {entitlements.map((e: any) => (
                              <option key={e.id} value={e.id}>
                                {e.nextUServiceName} - {e.price?.toLocaleString()}₫
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Plan Level */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Level *</label>
                        <select 
                          name="planLevelId" 
                          value={form.planLevelId} 
                          onChange={handleChange} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Plan Level</option>
                          {planLevels.map((level: any) => (
                            <option key={level.id} value={level.id}>{level.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Target Audience */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience *</label>
                        <select 
                          name="targetAudienceId" 
                          value={form.targetAudienceId} 
                          onChange={handleChange} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Target Audience</option>
                          {planTargetAudiences.map((audience: any) => (
                            <option key={audience.id} value={audience.id}>{audience.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Plan Category */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Category *</label>
                        <select 
                          name="basicPlanCategoryId" 
                          value={form.basicPlanCategoryId} 
                          onChange={handleChange} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Plan Category</option>
                          {planCategories.map((category: any) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          value={selectedDurationIds[0] || ""}
                          onChange={e => setSelectedDurationIds([e.target.value])}
                          required
                        >
                          <option value="">Select Duration</option>
                          {durations.map((d: any) => (
                            <option key={d.id} value={d.id}>{`${d.value} ${d.unit}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Pricing Summary */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">3</span>
                      Pricing Summary
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-sm text-gray-600 mb-1">Final Price</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {finalPrice > 0 ? finalPrice.toLocaleString() + "₫" : "0₫"}
                        </div>
                        {finalPrice > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {selectedPlanType?.code === "ACCOMMODATION" && selectedRoom && (
                              <span>Based on {selectedRoom.roomTypeName} × {selectedDurationIds[0] ? durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.value + ' ' + durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.unit : 'duration'}</span>
                            )}
                            {selectedPlanType?.code === 'LIFEACTIVITIES' && selectedEntitlementId && (
                              <span>Based on selected entitlement × {selectedDurationIds[0] ? durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.value + ' ' + durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.unit : 'duration'}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-sm text-gray-600 mb-1">Package Details</div>
                        <div className="space-y-0.5 text-xs">
                          <div><span className="font-medium">Type:</span> {selectedPlanType?.name || 'Not selected'}</div>
                          <div><span className="font-medium">Level:</span> {form.planLevelId ? planLevels.find((l: any) => l.id === form.planLevelId)?.name : 'Not selected'}</div>
                          <div><span className="font-medium">Target:</span> {form.targetAudienceId ? planTargetAudiences.find((a: any) => a.id === form.targetAudienceId)?.name : 'Not selected'}</div>
                          <div><span className="font-medium">Category:</span> {form.basicPlanCategoryId ? planCategories.find((c: any) => c.id === Number(form.basicPlanCategoryId))?.name : 'Not selected'}</div>
                          <div><span className="font-medium">Duration:</span> {selectedDurationIds[0] ? durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.value + ' ' + durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.unit : 'Not selected'}</div>
                          {selectedPlanType?.code === "ACCOMMODATION" && selectedRoom && (
                            <div><span className="font-medium">Room:</span> {selectedRoom.roomTypeName}</div>
                          )}
                          {selectedPlanType?.code === 'LIFEACTIVITIES' && selectedEntitlementId && (
                            <div><span className="font-medium">Service:</span> {entitlements.find((e: any) => e.id === selectedEntitlementId)?.nextUServiceName}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)}
                      className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center text-sm"
                      disabled={!form.basicPlanTypeId || !form.code || !form.name || !form.planLevelId || !form.targetAudienceId || !form.basicPlanCategoryId || selectedDurationIds.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Basic Package
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Thêm popup detail */}
          {showDetailModal && selectedPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <button 
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
                  onClick={() => setShowDetailModal(false)}
                >
                  ×
                </button>
                
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Basic Package Detail</h2>
                  <p className="text-sm text-gray-600">Package information and specifications</p>
                </div>

                {(() => {
                  const plan = selectedPlan
                  const hasData = plan.name || plan.basicPlanType || plan.status || plan.price || (plan.planDurations && plan.planDurations.length > 0) || plan.description || plan.locationName || plan.code || (plan.entitlements && plan.entitlements.length > 0)
                  if (!hasData) return (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-lg mb-2">📋</div>
                      <div className="text-gray-500 italic">No data available for this package.</div>
                    </div>
                  )
                  
                  return (
                    <div className="space-y-5">
                      {/* Pricing Card - Normal display */}
                      {(plan.price !== undefined && plan.price !== null && plan.price !== '') && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                            <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">💰</span>
                            Pricing Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-600">Price:</span>
                              <span className="text-sm text-gray-800 font-semibold text-right">
                                {Number(plan.price).toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                            {plan.planDurations && plan.planDurations.length > 0 && (
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-600">Duration:</span>
                                <span className="text-sm text-gray-800 text-right">
                                  {plan.planDurations.map((d: any) => `${d.planDurationValue} ${d.planDurationUnit}`).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Basic Info Card */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                          <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">📦</span>
                          Package Details
                        </h3>
                        <div className="space-y-3">
                          {plan.name && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-600">Name:</span>
                              <span className="text-sm text-gray-800 font-semibold text-right max-w-[60%] break-words">{plan.name}</span>
                            </div>
                          )}
                          {plan.code && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-600">Code:</span>
                              <span className="text-sm text-gray-800 font-mono text-right max-w-[60%] break-all">{plan.code}</span>
                            </div>
                          )}
                          {plan.basicPlanType && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-600">Type:</span>
                              <span className="text-sm text-gray-800 text-right max-w-[60%] break-words">{plan.basicPlanType}</span>
                            </div>
                          )}
                          {plan.status && (
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-600">Status:</span>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                plan.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {plan.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location Card */}
                      {plan.locationName && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">📍</span>
                            Location
                          </h3>
                          <div className="text-sm text-gray-800 font-medium">{plan.locationName}</div>
                        </div>
                      )}

                      {/* Description Card */}
                      {plan.description && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">📝</span>
                            Description
                          </h3>
                          <div className="text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto bg-gray-50 rounded p-3">
                            {plan.description}
                          </div>
                        </div>
                      )}

                      {/* Entitlements Card */}
                      {plan.entitlements && plan.entitlements.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">🎯</span>
                            Entitlements
                          </h3>
                          <div className="space-y-2">
                            {plan.entitlements.map((e: any, idx: number) => (
                              <div key={idx} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                                {e.nextUServiceName || e.entitlementId || e.entitlementRuleId || 'Unknown entitlement'}
                              </div>
                            ))}
                          </div>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-5xl relative max-h-[95vh] overflow-y-auto">
                <button 
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" 
                  onClick={() => setShowAddComboModal(false)}
                >
                  ×
                </button>
                
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Add Combo Package</h2>
                  <p className="text-sm text-gray-600">Create a new combo package by combining accommodation and life activities</p>
                </div>

                <form className="space-y-4" onSubmit={handleAddComboSubmit}>
                  {/* Step 1: Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">1</span>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Code *</label>
                        <input 
                          name="code" 
                          value={formCombo.code} 
                          onChange={e => setFormCombo(f => ({ ...f, code: e.target.value }))} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter combo code"
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                        <input 
                          name="name" 
                          value={formCombo.name} 
                          onChange={e => setFormCombo(f => ({ ...f, name: e.target.value }))} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter combo name"
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Level *</label>
                        <select 
                          name="planLevelId" 
                          value={formCombo.planLevelId} 
                          onChange={e => setFormCombo(f => ({ ...f, planLevelId: e.target.value }))} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Plan Level</option>
                          {planLevels.map((l: any) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                      {/* Plan Category */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Category *</label>
                        <select 
                          name="basicPlanCategoryId" 
                          value={formCombo.basicPlanCategoryId} 
                          onChange={e => setFormCombo(f => ({ ...f, basicPlanCategoryId: e.target.value }))} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Plan Category</option>
                          {planCategories.map((category: any) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Target Audience */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience *</label>
                        <select 
                          name="targetAudienceId" 
                          value={formCombo.targetAudienceId} 
                          onChange={e => setFormCombo(f => ({ ...f, targetAudienceId: e.target.value }))} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Target Audience</option>
                          {planTargetAudiences.map((audience: any) => (
                            <option key={audience.id} value={audience.id}>{audience.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Package Configuration */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">2</span>
                      Package Configuration
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Duration Selection */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Combo Duration *</label>
                        <select 
                          value={comboDurationId} 
                          onChange={e => setComboDurationId(e.target.value)} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Duration</option>
                          {durations.map((d: any) => (
                            <option key={d.id} value={d.id}>{`${d.value} ${d.unit}`}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Discount Rate */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Rate (%)</label>
                        <input 
                          name="discountRate" 
                          type="number" 
                          min="0"
                          max="100"
                          value={formCombo.discountRate} 
                          onChange={e => setFormCombo(f => ({ ...f, discountRate: Number(e.target.value) }))} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Package Selection */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">3</span>
                      Package Selection
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Accommodation Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">Accommodation Package *</label>
                          <span className="text-xs text-gray-500">Select 1 package</span>
                        </div>
                        <button 
                          type="button" 
                          className={`w-full px-4 py-3 border-2 border-dashed rounded-lg text-left transition-colors ${
                            selectedComboBasic.accommodation 
                              ? 'border-blue-300 bg-blue-50' 
                              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                          onClick={() => setShowSelectAccommodation(true)}
                        >
                          {selectedComboBasic.accommodation ? (
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-900">
                                {basicPlans.find((b: any) => b.id === selectedComboBasic.accommodation)?.name}
                              </span>
                              <button 
                                type="button" 
                                className="text-red-500 hover:text-red-700 text-lg font-bold"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedComboBasic(prev => ({ ...prev, accommodation: null }))
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <span className="mr-2">🏠</span>
                              <span>Select Accommodation Package</span>
                            </div>
                          )}
                        </button>
                      </div>
                      
                      {/* Life Activities Selection */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">Life Activities Packages *</label>
                          <span className="text-xs text-gray-500">Select 2-3 packages</span>
                        </div>
                        <button 
                          type="button" 
                          className={`w-full px-4 py-3 border-2 border-dashed rounded-lg text-left transition-colors ${
                            selectedComboBasic.lifeActivities.length > 0 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                          }`}
                          onClick={() => setShowSelectLife(true)}
                        >
                          {selectedComboBasic.lifeActivities.length > 0 ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-green-900">
                                  {selectedComboBasic.lifeActivities.length} package(s) selected
                                </span>
                                <button 
                                  type="button" 
                                  className="text-red-500 hover:text-red-700 text-lg font-bold"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedComboBasic(prev => ({ ...prev, lifeActivities: [] }))
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {selectedComboBasic.lifeActivities.map(id => (
                                  <span key={id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                    {basicPlans.find((b: any) => b.id === id)?.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <span className="mr-2">🎯</span>
                              <span>Select Life Activities Packages</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Pricing Summary */}
                  {comboDurationId && comboPriceInfo.details.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs mr-2">4</span>
                        Pricing Summary
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Total Price Display */}
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="text-sm text-gray-600 mb-1">Total Package Price</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {comboPriceInfo.total.toLocaleString()}₫
                          </div>
                          {formCombo.discountRate > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="text-blue-600">Discount: {formCombo.discountRate}%</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Package Details */}
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="text-sm text-gray-600 mb-2">Selected Packages</div>
                          <div className="space-y-1 text-xs">
                            <div><span className="font-medium">Accommodation:</span> {selectedComboBasic.accommodation ? basicPlans.find((b: any) => b.id === selectedComboBasic.accommodation)?.name : 'Not selected'}</div>
                            <div><span className="font-medium">Life Activities:</span> {selectedComboBasic.lifeActivities.length} package(s)</div>
                            <div><span className="font-medium">Duration:</span> {comboDurationId ? durations.find((d: any) => String(d.id) === String(comboDurationId))?.value + ' ' + durations.find((d: any) => String(d.id) === String(comboDurationId))?.unit : 'Not selected'}</div>
                            <div><span className="font-medium">Level:</span> {formCombo.planLevelId ? planLevels.find((l: any) => l.id === formCombo.planLevelId)?.name : 'Not selected'}</div>
                            <div><span className="font-medium">Category:</span> {formCombo.basicPlanCategoryId ? planCategories.find((c: any) => c.id === Number(formCombo.basicPlanCategoryId))?.name : 'Not selected'}</div>
                            <div><span className="font-medium">Target:</span> {formCombo.targetAudienceId ? planTargetAudiences.find((a: any) => a.id === formCombo.targetAudienceId)?.name : 'Not selected'}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detailed Price Breakdown */}
                      <div className="mt-4 bg-white rounded-lg border border-blue-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700">Price Breakdown</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Base Price</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Duration</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Multiplier</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {comboPriceInfo.details.map((d, idx) => d && (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-900">{d.name}</td>
                                  <td className="px-3 py-2 text-right text-gray-600">{d.price?.toLocaleString()}₫</td>
                                  <td className="px-3 py-2 text-right text-gray-600">{d.duration}</td>
                                  <td className="px-3 py-2 text-right text-gray-600">×{d.months}</td>
                                  <td className="px-3 py-2 text-right font-semibold text-gray-900">{d.total?.toLocaleString()}₫</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                              <tr className="font-bold bg-blue-50">
                                <td className="px-3 py-2 text-right" colSpan={4}>Total Package Price</td>
                                <td className="px-3 py-2 text-right text-blue-700 text-lg">{comboPriceInfo.total.toLocaleString()}₫</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {comboError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <span className="text-sm text-red-700">{comboError}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => setShowAddComboModal(false)}
                      className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center text-sm"
                      disabled={!formCombo.code || !formCombo.name || !formCombo.planLevelId || !formCombo.basicPlanCategoryId || !formCombo.targetAudienceId || !comboDurationId || !selectedComboBasic.accommodation || selectedComboBasic.lifeActivities.length < 2}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Combo Package
                    </button>
                  </div>
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
                  <div><b>Level:</b> {planLevels.find(l => l.id === selectedCombo.planLevelId)?.name || '-'}</div>
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
