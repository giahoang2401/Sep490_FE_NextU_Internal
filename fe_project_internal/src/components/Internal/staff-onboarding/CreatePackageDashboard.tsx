"use client"

import { UserPlus, Users, Package, Plus, Star, Home, GraduationCap, Lightbulb } from "lucide-react"
import TopNav from "../shared/topNav"
import DataTable from "../shared/dataTable"
import MarkdownEditor from "../shared/MarkdownEditor"
import type { User, TableColumn } from "../types"
import { useState, useEffect } from "react"
import axios from "../../../utils/axiosConfig"

// Navigation will be provided by the parent component

// Mock user data removed - will be provided by authentication system



// Cập nhật lại columns bảng
const serviceColumns: TableColumn[] = [
  { key: "service", label: "Packages", sortable: true },
  { key: "category", label: "Type" },
  { key: "status", label: "Status" },
  { key: "price", label: "Price" },
  { key: "planDurationDescription", label: "Plan Duration" },
]



// Mock feedback data removed - will be fetched from API

export default function CreatePackageDashboard() {
  // TẤT CẢ các hook phải ở đầu thân hàm component
  const [showAddModal, setShowAddModal] = useState(false)
  const [nextUServices, setNextUServices] = useState<any[]>([])
  const [accommodationOptions, setAccommodationOptions] = useState<any[]>([])
  const [durations, setDurations] = useState<any[]>([])
  const [selectedDurations, setSelectedDurations] = useState<{[key:string]: string}>({})
  const [selectedDurationIds, setSelectedDurationIds] = useState<string[]>([])
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    nextUServiceId: "",
    propertyId: "",
    accommodationOptionId: "",
    price: "",
    basicPlanCategoryId: "",
    planLevelId: "",
    targetAudienceId: "",
  })
  const [selectedNextUService, setSelectedNextUService] = useState<any>(null)
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
    description: '',
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

  // Lấy NextUServices
  useEffect(() => {
    axios.get("/api/membership/NextUServices").then(res => {
      setNextUServices(res.data)
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

  // Khi chọn NextUService là Accommodation thì gọi AccommodationOptions
  useEffect(() => {
    if (selectedNextUService && selectedNextUService.serviceType === 0) {
      axios.get("/api/membership/AccommodationOptions").then(res => {
        setAccommodationOptions(res.data)
      })
    } else {
      setAccommodationOptions([])
      setSelectedRoom(null)
    }
  }, [selectedNextUService])

  // Khi chọn type là Lifestyle Services thì fetch entitlement
  useEffect(() => {
    if (selectedNextUService && selectedNextUService.serviceType === 1) {
      axios.get('/api/membership/EntitlementRule').then(res => setEntitlements(res.data))
    } else {
      setEntitlements([])
      setSelectedEntitlementId('')
    }
  }, [selectedNextUService])

  // Khi chọn accommodationOptionId thì set selectedRoom
  useEffect(() => {
    if (form.accommodationOptionId && accommodationOptions.length > 0) {
      const room = accommodationOptions.find((r: any) => r.id === form.accommodationOptionId)
      setSelectedRoom(room)
    } else {
      setSelectedRoom(null)
    }
  }, [form.accommodationOptionId, accommodationOptions])

  // Tính giá cuối cùng khi chọn đủ room + duration
  useEffect(() => {
    if (selectedNextUService && selectedNextUService.serviceType === 0 && selectedRoom && selectedDurationIds.length > 0) {
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
  }, [selectedNextUService, selectedRoom, selectedDurationIds, durations])

  // Khi chọn entitlement cho Lifestyle Services, tự động lấy giá và nhân với duration
  useEffect(() => {
    if (selectedNextUService && selectedNextUService.serviceType === 1 && selectedEntitlementId) {
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
  }, [selectedNextUService, selectedEntitlementId, entitlements, selectedDurationIds, durations])

  // Reset selected packages when combo duration changes
  useEffect(() => {
    if (comboDurationId) {
      // Reset selected packages when duration changes
      setSelectedComboBasic({ accommodation: null, lifeActivities: [] })
    }
  }, [comboDurationId])

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
    category: plan.nextUServiceName,
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
    const matchesType = typeFilter === "all" || 
      (typeFilter === "Accommodation" && plan.raw.serviceType === 0) ||
      (typeFilter === "Lifestyle Services" && plan.raw.serviceType === 1)
    
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



  // 3. Modal Add Basic Package
  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === "nextUServiceId") {
      const service = nextUServices.find((b: any) => b.id === value)
      setSelectedNextUService(service)
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
    if (selectedNextUService) {
      if (selectedNextUService.serviceType === 0) {
        verifyBuy = true
        requireBooking = true
      } else if (selectedNextUService.serviceType === 1) {
        verifyBuy = true
        requireBooking = false
      }
    }
    // Nếu là Accommodation (serviceType = 0) thì thêm accomodations
    let extra = {}
    if (selectedNextUService && selectedNextUService.serviceType === 0 && form.accommodationOptionId) {
      extra = { accomodations: [{ accomodationId: form.accommodationOptionId }] }
    }
    // Nếu là Lifestyle Services (serviceType = 1) thì gửi entitlements: [{ entitlementRuleId, quantity: 0 }]
    if (selectedNextUService && selectedNextUService.serviceType === 1 && selectedEntitlementId) {
      extra = { ...extra, entitlements: [{ entitlementRuleId: selectedEntitlementId, quantity: 1 }] }
    }
    try {
      await axios.post("/api/membership/BasicPlans", {
        code: form.code,
        name: form.name,
        description: form.description,
        price: finalPrice,
        verifyBuy,
        requireBooking,
        nextUServiceId: form.nextUServiceId,
        basicPlanCategoryId: Number(form.basicPlanCategoryId),
        planLevelId: Number(form.planLevelId),
        targetAudienceId: Number(form.targetAudienceId),
        propertyId: form.propertyId,
        packageDurations,
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
        nextUServiceId: "",
        propertyId: "",
        accommodationOptionId: "",
        price: "",
        basicPlanCategoryId: "",
        planLevelId: "",
        targetAudienceId: "",
      })
      setSelectedNextUService(null)
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
      setComboError('Chọn ít nhất 2 gói Lifestyle Services!')
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
      description: formCombo.description,
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
    
    try {
      await axios.post('/api/membership/ComboPlans', payload);
      alert('Tạo Combo Package thành công!')
      // Refresh danh sách combo plans sau khi tạo thành công
      fetchComboPlans()
      // Reset form và modal
      setShowAddComboModal(false)
      setFormCombo({ code: '', name: '', description: '', discountRate: 0, planLevelId: '', basicPlanCategoryId: '', targetAudienceId: '' })
      setSelectedComboBasic({ accommodation: null, lifeActivities: [] })
      setComboDurationId('')
      setComboError('')
    } catch (err: any) {
      setComboError('Tạo Combo Package thất bại! ' + (err?.response?.data?.message || ''))
    }
  }

  // Thêm hàm lấy duration object từ id
  const getDurationObj = (id: string) => durations.find((d: any) => String(d.id) === String(id))

  // Helper: render markdown preview
  const renderMarkdownPreview = (markdown: string) => {
    if (!markdown) return '';
    
    // Basic Markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-2" />')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-700">$1</blockquote>')
      // Lists
      .replace(/^[\*\-]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^[\d]+\.\s+(.*$)/gim, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br />');

    // Wrap lists properly
    html = html.replace(/(<li.*<\/li>)/g, '<ul class="list-disc ml-6 my-2">$1</ul>');
    
    return html;
  };

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
    <>
      <TopNav user={{ id: "", name: "", email: "", role: "", location: "", avatar: "" }} title="Package Creation Management" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                     {/* Service Stats */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
             <div className="bg-white shadow rounded-lg p-6">
               <div className="flex items-center">
                 <Home className="h-8 w-8 text-blue-500" />
                 <div className="ml-4">
                   <div className="text-2xl font-bold text-gray-900">-</div>
                   <div className="text-sm text-gray-500">NextLiving Services</div>
                 </div>
               </div>
             </div>
             <div className="bg-white shadow rounded-lg p-6">
               <div className="flex items-center">
                 <GraduationCap className="h-8 w-8 text-green-500" />
                 <div className="ml-4">
                   <div className="text-2xl font-bold text-gray-900">-</div>
                   <div className="text-sm text-gray-500">NextAcademy Courses</div>
                 </div>
               </div>
             </div>
             <div className="bg-white shadow rounded-lg p-6">
               <div className="flex items-center">
                 <Lightbulb className="h-8 w-8 text-yellow-500" />
                 <div className="ml-4">
                   <div className="text-2xl font-bold text-gray-900">-</div>
                   <div className="text-sm text-gray-500">Pending Proposals</div>
                 </div>
               </div>
             </div>
             <div className="bg-white shadow rounded-lg p-6">
               <div className="flex items-center">
                 <Star className="h-8 w-8 text-purple-500" />
                 <div className="ml-4">
                   <div className="text-2xl font-bold text-gray-900">-</div>
                   <div className="text-sm text-gray-500">Avg Service Rating</div>
                 </div>
               </div>
             </div>
           </div>

          {/* Service Management */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Basic packages - 3/4 width */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Basic Packages</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage your basic package offerings</p>
                    </div>
                  <button
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                      Add Package
                  </button>
                  </div>
                </div>
                
                {/* Advanced Filters */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                  <div className="space-y-4">
                    {/* Search Bar */}
                      <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                        <input
                          type="text"
                        placeholder="Search by package name, code, or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                        </div>
                    
                    {/* Filter Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {/* Type Filter */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="all">All Types</option>
                          <option value="Accommodation">Accommodation (Booking)</option>
                          <option value="Lifestyle Services">Lifestyle Services (Non-booking)</option>
                        </select>
                    </div>
                    
                      {/* Category Filter */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="all">All Categories</option>
                          <option value="Dài hạn">Long Term</option>
                          <option value="Ngắn hạn">Short Term</option>
                          <option value="Theo sự kiện">Event Based</option>
                      </select>
                    </div>
                    
                      {/* Level Filter */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                      <select
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="all">All Levels</option>
                          <option value="Tiêu chuẩn">Standard</option>
                          <option value="Cơ bản">Basic</option>
                          <option value="Cao cấp">Premium</option>
                        </select>
                      </div>
                      
                      {/* Price Range */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Price Range</label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                          <option value="all">All Prices</option>
                          <option value="0-10000000">Under 10M</option>
                          <option value="10000000-50000000">10M - 50M</option>
                          <option value="50000000-999999999">Above 50M</option>
                      </select>
                    </div>
                    
                    {/* Clear Filters */}
                      <div className="md:col-span-1 flex items-end">
                    {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setTypeFilter("all")
                        }}
                            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                            Clear All
                      </button>
                    )}
                  </div>
                  
                      {/* Results Info */}
                      <div className="md:col-span-1 flex items-end">
                        <div className="text-xs text-gray-500">
                          {filteredPlans.length} of {basicPlans.length} packages
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Custom Table */}
                <div className="overflow-hidden">
                  {pagedPlans.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pagedPlans.map((plan, index) => (
                            <tr 
                              key={index}
                              onClick={() => { setSelectedPlan(plan.raw); setShowDetailModal(true) }}
                              className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{plan.service}</div>
                                  <div className="text-sm text-gray-500 font-mono">{plan.raw.code}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  plan.raw.serviceType === 0 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {plan.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">{plan.raw.planCategoryName}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{plan.price}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{plan.planDurationDescription}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  plan.raw.planLevelName === 'Cao cấp' ? 'bg-purple-100 text-purple-800' :
                                  plan.raw.planLevelName === 'Tiêu chuẩn' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {plan.raw.planLevelName}
                                </span>
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
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredPlans.length)} of {filteredPlans.length} results
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
            </div>
          </div>

          {/* Combo Packages - Same width as Basic packages */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        <div className="lg:col-span-3">
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Combo Packages</h3>
                      <p className="text-sm text-gray-600 mt-1">Bundled packages with special pricing</p>
                    </div>
                  <button
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                    onClick={() => setShowAddComboModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                      Add Combo
                  </button>
                  </div>
                </div>
                
                {/* Advanced Filters */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                  <div className="space-y-4">
                    {/* Search Bar */}
                      <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                        <input
                          type="text"
                        placeholder="Search by combo name, code, or description..."
                          value={comboSearchTerm}
                          onChange={(e) => setComboSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        />
                        </div>
                    
                    {/* Filter Row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {/* Suggested Filter */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
                          <option value="all">All Types</option>
                          <option value="suggested">Suggested</option>
                          <option value="custom">Custom</option>
                        </select>
                    </div>
                    
                      {/* Category Filter */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={comboStatusFilter}
                        onChange={(e) => setComboStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        >
                          <option value="all">All Categories</option>
                          <option value="Dài hạn">Long Term</option>
                          <option value="Ngắn hạn">Short Term</option>
                          <option value="Theo sự kiện">Event Based</option>
                        </select>
                      </div>
                      
                      {/* Level Filter */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
                          <option value="all">All Levels</option>
                          <option value="Tiêu chuẩn">Standard</option>
                          <option value="Cơ bản">Basic</option>
                          <option value="Cao cấp">Premium</option>
                        </select>
                      </div>
                      
                      {/* Discount Range */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
                          <option value="all">All Discounts</option>
                          <option value="0-10">0% - 10%</option>
                          <option value="10-20">10% - 20%</option>
                          <option value="20-100">Above 20%</option>
                      </select>
                    </div>
                    
                    {/* Clear Filters */}
                      <div className="md:col-span-1 flex items-end">
                    {(comboSearchTerm || comboStatusFilter !== "all") && (
                      <button
                        onClick={() => {
                          setComboSearchTerm("")
                          setComboStatusFilter("all")
                        }}
                            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                            Clear All
                      </button>
                    )}
                  </div>
                  
                      {/* Results Info */}
                      <div className="md:col-span-1 flex items-end">
                        <div className="text-xs text-gray-500">
                          {filteredComboPlans.length} of {comboPlans.length} combos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Custom Table */}
                <div className="overflow-hidden">
                  {pagedComboPlans.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combo Package</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packages</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pagedComboPlans.map((combo, index) => (
                            <tr 
                              key={index}
                              onClick={() => { setSelectedCombo(combo.raw); setShowComboDetailModal(true) }}
                              className="hover:bg-purple-50 cursor-pointer transition-colors duration-150"
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{combo.service}</div>
                                  <div className="text-sm text-gray-500 font-mono">{combo.raw.code}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  combo.raw.isSuggested 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {combo.raw.isSuggested ? 'Suggested' : 'Custom'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">
                                  {combo.raw.packageDurations && combo.raw.packageDurations.length > 0 
                                    ? combo.raw.packageDurations.map((d: any, idx: number) => {
                                        const duration = durations.find((dur: any) => dur.id === d.durationId);
                                        return duration ? duration.description : `${d.durationId} Month`;
                                      }).join(', ')
                                    : 'N/A'
                                  }
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{combo.price}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {combo.raw.discountRate > 0 ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    -{(combo.raw.discountRate * 100).toFixed(0)}%
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">No discount</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-1">
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700">
                                    {combo.raw.basicPlanIds?.filter((id: string) => {
                                      const plan = basicPlans.find((b: any) => b.id === id);
                                      return plan?.serviceType === 0;
                                    }).length || 0} Acc
                                  </span>
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                                    {combo.raw.basicPlanIds?.filter((id: string) => {
                                      const plan = basicPlans.find((b: any) => b.id === id);
                                      return plan?.serviceType === 1;
                                    }).length || 0} Life
                                  </span>
                                </div>
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
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No combo packages found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                  )}
                </div>
                
                {/* Pagination */}
                {comboTotalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((comboCurrentPage - 1) * comboPageSize) + 1} to {Math.min(comboCurrentPage * comboPageSize, filteredComboPlans.length)} of {filteredComboPlans.length} results
                    </div>
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      disabled={comboCurrentPage === 1}
                      onClick={() => setComboCurrentPage(p => Math.max(1, p - 1))}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>
                      {[...Array(Math.min(5, comboTotalPages))].map((_, idx) => {
                        const pageNum = comboCurrentPage <= 3 ? idx + 1 : 
                                       comboCurrentPage >= comboTotalPages - 2 ? comboTotalPages - 4 + idx :
                                       comboCurrentPage - 2 + idx;
                        return (
                      <button
                            key={pageNum}
                            onClick={() => setComboCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              comboCurrentPage === pageNum 
                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                      </button>
                        );
                      })}
                    <button
                      disabled={comboCurrentPage === comboTotalPages}
                      onClick={() => setComboCurrentPage(p => Math.min(comboTotalPages, p + 1))}
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
            </div>
            {/* Empty space to maintain alignment */}
            <div className="lg:col-span-1"></div>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                        <select 
                          name="nextUServiceId" 
                          value={form.nextUServiceId} 
                          onChange={handleChange} 
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select Service Type</option>
                          {nextUServices.map((b: any) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.serviceType === 0 ? 'Booking' : 'Non-booking'}) - {b.ecosystemName}
                            </option>
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
                      <MarkdownEditor
                        value={form.description}
                        onChange={(value) => setForm(f => ({ ...f, description: value }))}
                        placeholder="Enter package description... Use Markdown for formatting!"
                        rows={3}
                        className="w-full"
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
                      {selectedNextUService && selectedNextUService.serviceType === 0 && (
                        <div className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Option *</label>
                          <select 
                            name="accommodationOptionId" 
                            value={form.accommodationOptionId} 
                            onChange={handleChange} 
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            required
                          >
                            <option value="">Select Accommodation Option</option>
                            {accommodationOptions.map((r: any) => (
                              <option key={r.id} value={r.id}>
                                {r.accmodationOptionName} ({r.pricePerNight.toLocaleString()}₫/night)
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

                      {/* Entitlement for Lifestyle Services */}
                      {selectedNextUService && selectedNextUService.serviceType === 1 && (
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
                                {e.entittlementRuleName} - {e.price?.toLocaleString()}₫
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
                        {/* Combo note for 6 or 12 months */}
                        {selectedDurationIds[0] && durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.value >= 6 && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-xs text-blue-700 font-medium">
                              📦 This duration is suitable for Combo packages
                            </div>
                          </div>
                        )}
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
                          {selectedNextUService?.serviceType === 0 && selectedRoom && (
                            <span>Based on {selectedRoom.accmodationOptionName} × {selectedDurationIds[0] ? durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.value + ' ' + durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.unit : 'duration'}</span>
                          )}
                          {selectedNextUService?.serviceType === 1 && selectedEntitlementId && (
                            <span>Based on selected entitlement × {selectedDurationIds[0] ? durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.value + ' ' + durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.unit : 'duration'}</span>
                          )}
                        </div>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-sm text-gray-600 mb-1">Package Details</div>
                        <div className="space-y-0.5 text-xs">
                          <div><span className="font-medium">Type:</span> {selectedNextUService?.name || 'Not selected'}</div>
                          <div><span className="font-medium">Level:</span> {form.planLevelId ? planLevels.find((l: any) => l.id === form.planLevelId)?.name : 'Not selected'}</div>
                          <div><span className="font-medium">Target:</span> {form.targetAudienceId ? planTargetAudiences.find((a: any) => a.id === form.targetAudienceId)?.name : 'Not selected'}</div>
                          <div><span className="font-medium">Category:</span> {form.basicPlanCategoryId ? planCategories.find((c: any) => c.id === Number(form.basicPlanCategoryId))?.name : 'Not selected'}</div>
                          <div><span className="font-medium">Duration:</span> {selectedDurationIds[0] ? durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.value + ' ' + durations.find((d: any) => String(d.id) === String(selectedDurationIds[0]))?.unit : 'Not selected'}</div>
                          {selectedNextUService?.serviceType === 0 && selectedRoom && (
                            <div><span className="font-medium">Accommodation:</span> {selectedRoom.accmodationOptionName}</div>
                          )}
                          {selectedNextUService?.serviceType === 1 && selectedEntitlementId && (
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
                      disabled={!form.nextUServiceId || !form.code || !form.name || !form.planLevelId || !form.targetAudienceId || !form.basicPlanCategoryId || selectedDurationIds.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Basic Package
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Basic Package Detail Modal */}
          {showDetailModal && selectedPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedPlan.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">{selectedPlan.nextUServiceName} Package • {selectedPlan.code}</p>
                    </div>
                <button 
                      className="text-gray-400 hover:text-gray-600 transition-colors" 
                  onClick={() => setShowDetailModal(false)}
                >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                </button>
                </div>
                    </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Package Overview */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Package Overview</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Package Code:</span>
                            <span className="text-sm font-mono text-gray-900">{selectedPlan.code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className="text-sm text-gray-900">{selectedPlan.nextUServiceName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Verify Purchase:</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedPlan.verifyBuy ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {selectedPlan.verifyBuy ? 'Required' : 'Not Required'}
                              </span>
                            </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing Information</h3>
                        <div className="space-y-2">
                                                     <div className="flex justify-between items-center">
                             <span className="text-sm text-gray-600">Estimated Website Price (Staff View):</span>
                             <span className="text-lg font-bold text-blue-700">
                               {selectedPlan.price ? Number(selectedPlan.price).toLocaleString('vi-VN') + '₫' : 'N/A'}
                                 </span>
                               </div>
                          {selectedPlan.planDurations && selectedPlan.planDurations.length > 0 && (
                            <div className="pt-2 border-t border-blue-200">
                              <span className="text-sm text-gray-600 block mb-2">Duration:</span>
                              {selectedPlan.planDurations.map((d: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-700">{d.planDurationDescription}</span>
                                  {d.discountRate > 0 && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                      {(d.discountRate * 100).toFixed(0)}% OFF
                                    </span>
                            )}
                          </div>
                              ))}
                        </div>
                      )}
                        </div>
                      </div>

                      {/* Classification */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Classification</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Category:</span>
                            <span className="text-sm text-gray-900">{selectedPlan.planCategoryName}</span>
                            </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Level:</span>
                            <span className="text-sm text-gray-900">{selectedPlan.planLevelName}</span>
                            </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Target Audience:</span>
                            <span className="text-sm text-gray-900">{selectedPlan.targetAudienceName}</span>
                            </div>
                            </div>
                        </div>
                      </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Property */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Property</h3>
                        <div className="text-sm text-gray-700">
                          {selectedPlan.propertyName}
                        </div>
                      </div>

                      {/* Accommodations */}
                      {selectedPlan.acomodations && selectedPlan.acomodations.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Accommodation Details</h3>
                          {selectedPlan.acomodations.map((acc: any, idx: number) => (
                            <div key={idx} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Accommodation Option:</span>
                                <span className="text-sm font-medium text-gray-900">{acc.accmodationOptionName || acc.roomType || 'N/A'}</span>
                          </div>
                              {acc.accomodationDescription && (
                                <div>
                                  <span className="text-sm text-gray-600">Description:</span>
                                  <p className="text-sm text-gray-700 mt-1">{acc.accomodationDescription}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Services */}
                      {selectedPlan.entitlements && selectedPlan.entitlements.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Included Services</h3>
                          <div className="space-y-2">
                            {selectedPlan.entitlements.map((ent: any, idx: number) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">{ent.nextUSerName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {selectedPlan.description && selectedPlan.description.trim() && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
                          <div className="prose prose-sm max-w-none">
                            <div 
                              dangerouslySetInnerHTML={{ 
                                __html: renderMarkdownPreview(selectedPlan.description) 
                              }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleDateString('vi-VN')}
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
                    
                    {/* Description - Full width row */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <MarkdownEditor
                        value={formCombo.description}
                        onChange={(value) => setFormCombo(f => ({ ...f, description: value }))}
                        placeholder="Enter package description... Use Markdown for formatting!"
                        rows={3}
                        className="w-full"
                      />
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
                          {durations.filter((d: any) => d.value >= 6).map((d: any) => (
                            <option key={d.id} value={d.id}>{`${d.value} ${d.unit}`}</option>
                          ))}
                        </select>
                        <div className="mt-2 text-xs text-gray-500">
                          💡 Combo packages are only available for 6 or 12 months duration
                        </div>
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

                  {/* Step 3: Package Selection - Only show when duration is selected */}
                  {comboDurationId && (
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
                  )}

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
                          <div className="space-y-2">
                            {formCombo.discountRate > 0 ? (
                              <>
                                <div>
                                  <div className="text-sm text-gray-600">Original Price</div>
                                  <div className="text-lg text-gray-500 line-through">
                                    {comboPriceInfo.total.toLocaleString()}₫
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Final Price</div>
                                  <div className="text-2xl font-bold text-green-600">
                                    {(comboPriceInfo.total * (1 - formCombo.discountRate / 100)).toLocaleString()}₫
                                  </div>
                                  <div className="text-xs text-red-600 font-medium">
                                    Save {(comboPriceInfo.total * formCombo.discountRate / 100).toLocaleString()}₫ ({formCombo.discountRate}% OFF)
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                          <div className="text-sm text-gray-600 mb-1">Total Package Price</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {comboPriceInfo.total.toLocaleString()}₫
                          </div>
                              </>
                          )}
                          </div>
                        </div>
                        
                        {/* Package Details */}
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="text-sm text-gray-600 mb-2">Selected Packages</div>
                          <div className="space-y-1 text-xs">
                            <div><span className="font-medium">Accommodation:</span> {selectedComboBasic.accommodation ? basicPlans.find((b: any) => b.id === selectedComboBasic.accommodation)?.name : 'Not selected'}</div>
                            <div><span className="font-medium">Lifestyle Services:</span> {selectedComboBasic.lifeActivities.length} package(s)</div>
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
        {(() => {
          const filteredPlans = basicPlans.filter((b: any) => {
            // Filter by accommodation type and search term
            const matchesType = b.serviceType === 0;
            const matchesSearch = b.name.toLowerCase().includes(searchAccommodation.toLowerCase());
            
            // Filter by duration - only show packages with matching duration
            let matchesDuration = false;
            if (comboDurationId && b.planDurations && b.planDurations.length > 0) {
              matchesDuration = b.planDurations.some((pd: any) => 
                String(pd.planDurationId) === String(comboDurationId)
              );
            }
            
            return matchesType && matchesSearch && matchesDuration;
          });
          
          if (filteredPlans.length === 0) {
            const selectedDuration = durations.find((d: any) => String(d.id) === String(comboDurationId));
            return (
              <div className="text-center py-4 text-gray-500">
                <div className="text-sm">No accommodation packages found</div>
                {selectedDuration && (
                  <div className="text-xs mt-1">
                    for {selectedDuration.value} {selectedDuration.unit} duration
                  </div>
                )}
              </div>
            );
          }
          
          return filteredPlans.map((b: any) => (
          <button key={b.id} type="button" className={`flex flex-col items-start border rounded p-2 hover:bg-blue-50 ${selectedComboBasic.accommodation === b.id ? 'border-blue-500 bg-blue-50' : ''}`} onClick={() => { setSelectedComboBasic(prev => ({ ...prev, accommodation: b.id })); setShowSelectAccommodation(false) }}>
            <span className="font-medium text-blue-900">{b.name}</span>
            <span className="text-xs text-gray-500">Giá: {b.price?.toLocaleString()}₫</span>
            <span className="text-xs text-gray-500">Duration: {b.planDurations && b.planDurations[0] ? `${b.planDurations[0].planDurationValue} ${b.planDurations[0].planDurationUnit}` : '-'}</span>
          </button>
        ));
        })()}
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
        {(() => {
          const filteredPlans = basicPlans.filter((b: any) => {
            // Filter by lifestyle services type and search term
            const matchesType = b.serviceType === 1;
            const matchesSearch = b.name.toLowerCase().includes(searchLife.toLowerCase());
            
            // Filter by duration - only show packages with matching duration
            let matchesDuration = false;
            if (comboDurationId && b.planDurations && b.planDurations.length > 0) {
              matchesDuration = b.planDurations.some((pd: any) => 
                String(pd.planDurationId) === String(comboDurationId)
              );
            }
            
            return matchesType && matchesSearch && matchesDuration;
          });
          
          if (filteredPlans.length === 0) {
            const selectedDuration = durations.find((d: any) => String(d.id) === String(comboDurationId));
            return (
              <div className="text-center py-4 text-gray-500">
                <div className="text-sm">No life activities packages found</div>
                {selectedDuration && (
                  <div className="text-xs mt-1">
                    for {selectedDuration.value} {selectedDuration.unit} duration
                  </div>
                )}
              </div>
            );
          }
          
          return filteredPlans.map((b: any) => {
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
          );
        });
        })()}
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium" onClick={() => setShowSelectLife(false)}>Xong</button>
      </div>
    </div>
  </div>
)}
          {/* Combo Package Detail Modal */}
          {showComboDetailModal && selectedCombo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedCombo.name}</h2>
                      <p className="text-sm text-gray-600 mt-1">Combo Package • {selectedCombo.code} • {selectedCombo.isSuggested ? 'Suggested' : 'Custom'}</p>
                </div>
                    <button 
                      className="text-gray-400 hover:text-gray-600 transition-colors" 
                      onClick={() => setShowComboDetailModal(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Pricing */}
                    <div className="lg:col-span-1">
                      <div className="space-y-4">
                        {/* Pricing Summary */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing Summary</h3>
                          <div className="space-y-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-700">
                                {selectedCombo.totalPrice ? Number(selectedCombo.totalPrice).toLocaleString('vi-VN') + '₫' : 'N/A'}
                              </div>
                              <div className="text-xs text-green-600">Final Price</div>
                            </div>
                            {selectedCombo.discountRate > 0 && (
                              <div className="text-center pt-2 border-t border-green-200">
                                <div className="text-lg font-semibold text-red-600">
                                  -{(selectedCombo.discountRate * 100).toFixed(0)}%
                                </div>
                                <div className="text-xs text-red-500">Discount Applied</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Package Overview */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Package Overview</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Package Code:</span>
                              <span className="text-sm font-mono text-gray-900">{selectedCombo.code}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Verify Purchase:</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedCombo.verifyBuy ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {selectedCombo.verifyBuy ? 'Required' : 'Not Required'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Suggested:</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${selectedCombo.isSuggested ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                {selectedCombo.isSuggested ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {selectedCombo.description && selectedCombo.description.trim() && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
                            <div className="prose prose-sm max-w-none">
                              <div 
                                dangerouslySetInnerHTML={{ 
                                  __html: renderMarkdownPreview(selectedCombo.description) 
                                }} 
                              />
                            </div>
                          </div>
                        )}

                        {/* Classification */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 mb-3">Classification</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Category:</span>
                              <span className="text-sm text-gray-900">{selectedCombo.basicPlanCategoryName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Level:</span>
                              <span className="text-sm text-gray-900">{selectedCombo.planLevelName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Target Audience:</span>
                              <span className="text-sm text-gray-900">{selectedCombo.targetAudienceName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Duration */}
                        {selectedCombo.packageDurations && selectedCombo.packageDurations.length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Duration</h3>
                            {selectedCombo.packageDurations.map((d: any, idx: number) => {
                              const duration = durations.find((dur: any) => dur.id === d.durationId);
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Period:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {duration ? duration.description : `${d.durationValue || d.durationId} Month`}
                                    </span>
                                  </div>
                                  {d.discountRate > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">Additional Discount:</span>
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                        {(d.discountRate * 100).toFixed(0)}% OFF
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Package Details */}
                    <div className="lg:col-span-2">
                      {/* Property */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Property</h3>
                        <div className="text-sm text-gray-700">
                          {selectedCombo.propertyName}
                        </div>
                      </div>

                      {/* Included Packages */}
                      {selectedCombo.basicPlanIds && selectedCombo.basicPlanIds.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-semibold text-gray-900">Included Packages</h3>
                            <div className="text-xs text-gray-500">
                              {selectedCombo.basicPlanIds.length} packages total
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCombo.basicPlanIds.map((planId: string, idx: number) => {
                              const basicPlan = basicPlans.find((b: any) => b.id === planId);
                              if (!basicPlan) return null;
                              
                              return (
                                <div key={idx} className={`rounded-lg p-3 border-2 ${
                                  basicPlan.serviceType === 0 
                                    ? 'border-blue-200 bg-blue-50' 
                                    : 'border-green-200 bg-green-50'
                                }`}>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        basicPlan.serviceType === 0
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {basicPlan.nextUServiceName}
                                      </div>
                                      <div className="text-xs text-gray-500 font-mono">
                                        {basicPlan.code}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">
                                        {basicPlan.name}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {basicPlan.price ? Number(basicPlan.price).toLocaleString('vi-VN') + '₫' : 'Price not set'}
                                      </div>
                                    </div>

                                    {/* Package Duration */}
                                    {basicPlan.planDurations && basicPlan.planDurations.length > 0 && (
                                      <div className="text-xs text-gray-500">
                                        Duration: {basicPlan.planDurations[0].planDurationDescription}
                                      </div>
                                    )}

                                    {/* Services for Life Activities */}
                                    {basicPlan.entitlements && basicPlan.entitlements.length > 0 && (
                                      <div className="pt-1 border-t border-gray-200">
                                        <div className="text-xs text-gray-600 mb-1">Services:</div>
                                        {basicPlan.entitlements.map((ent: any, entIdx: number) => (
                                          <div key={entIdx} className="text-xs text-gray-700 flex items-center space-x-1">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            <span>{ent.nextUSerName}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Accommodation details */}
                                    {basicPlan.acomodations && basicPlan.acomodations.length > 0 && (
                                      <div className="pt-1 border-t border-gray-200">
                                        <div className="text-xs text-gray-600 mb-1">Accommodation:</div>
                                        {basicPlan.acomodations.map((acc: any, accIdx: number) => (
                                          <div key={accIdx} className="text-xs text-gray-700">
                                            {acc.accmodationOptionName || acc.roomType || 'N/A'}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Package Type Summary */}
                          <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Accommodation:</span>
                              <span className="font-medium text-blue-700">
                                {selectedCombo.basicPlanIds.filter((id: string) => {
                                  const plan = basicPlans.find((b: any) => b.id === id);
                                  return plan?.serviceType === 0;
                                }).length} package(s)
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Lifestyle Services:</span>
                              <span className="font-medium text-green-700">
                                {selectedCombo.basicPlanIds.filter((id: string) => {
                                  const plan = basicPlans.find((b: any) => b.id === id);
                                  return plan?.serviceType === 1;
                                }).length} package(s)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Combo Package • Last updated: {new Date().toLocaleDateString('vi-VN')}
                  </div>
                  <button 
                    onClick={() => setShowComboDetailModal(false)}
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
