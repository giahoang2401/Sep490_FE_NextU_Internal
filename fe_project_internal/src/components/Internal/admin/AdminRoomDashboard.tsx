"use client"
import React, { useEffect, useState } from "react";
import Sidebar from "../shared/sidebar";
import TopNav from "../shared/topNav";
import RoleLayout from "../shared/roleLayout";
import DashboardCard from "../shared/dashboardCard";
import DataTable from "../shared/dataTable";
import api from "../../../utils/axiosConfig"; 
import type { User, TableColumn, NavigationItem } from "../types";
import { MapPin, Users, UserPlus, BarChart3, DoorOpen } from "lucide-react";
import { getNavigationForRole } from "../navigation";

// Custom CSS for hiding scrollbars and ensuring modal width
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Ensure Room Detail modal is wide */
  .room-detail-modal {
    max-width: 80vw !important;
    width: 80vw !important;
    min-width: 1200px !important;
  }
  
  .room-detail-modal .modal-content {
    width: 100% !important;
    max-width: none !important;
  }
`;

// Helper function to get user initials for avatar
const getUserInitials = (name: string) => {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A'
}

function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  
  // Check if this is the Room Detail modal by looking at the title
  const isRoomDetailModal = title.startsWith('Room');
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className={`bg-white shadow-2xl w-full overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300 ${
          isRoomDetailModal ? 'max-w-7xl max-h-[95vh] room-detail-modal' : 
          title.includes('Upload') ? 'max-w-6xl max-h-[95vh]' : 'max-w-2xl max-h-[90vh]'
        }`}
        style={isRoomDetailModal ? {
          width: '90vw',
          maxWidth: '1400px',
          minWidth: '1200px'
        } : title.includes('Upload') ? {
          width: '85vw',
          maxWidth: '1200px',
          minWidth: '900px'
        } : {}}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl font-light hover:bg-gray-100 w-8 h-8 flex items-center justify-center" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={`overflow-y-auto ${isRoomDetailModal ? 'max-h-[calc(95vh-80px)]' : 'max-h-[calc(90vh-80px)]'}`}>
          {isRoomDetailModal ? (
            <div className="scrollbar-hide">
              {children}
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

interface AccommodationOption {
  id: string;
  roomTypeId: number;
  roomTypeName: string;
  accmodationOptionName: string;
  locationId: string | null;
  locationName: string | null;
  nextServiceId: string;
  nextServiceName: string;
  capacity: number;
  pricePerNight: number;
  description: string;
}

interface Media {
  id: string;
  url: string;
  type: string;
  description: string;
  actorType: number;
  actorId: string;
}

interface RoomInstance {
  id: string;
  accommodationOptionId: string;
  roomCode: string;
  roomName: string;
  descriptionDetails: string;
  floor: number;
  addOnFee?: number | string;
  status?: string;
  areaInSquareMeters?: number;
  roomSizeName?: string;
  roomViewName?: string;
  roomFloorName?: string;
  bedTypeName?: string;
  numberOfBeds?: number;
  roomTypeName?: string;
  propertyId?: string;
  propertyName?: string;
  locationId?: string;
  locationName?: string;
  cityId?: string;
  cityName?: string;
  medias?: Media[];
}

export default function AdminRoomDashboard() {
  // Get navigation for admin role with current path
  const navigation = getNavigationForRole("admin", "/admin/rooms");
  
  // State
  const [options, setOptions] = useState<AccommodationOption[]>([]);
  const [rooms, setRooms] = useState<RoomInstance[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  
  // New state for NextUServices and Ecosystems management
  const [nextUServices, setNextUServices] = useState<{ id: string; name: string; serviceType: number; ecosystemId: string; ecosystemName: string; propertyId: string; propertyName: string; mediaGalleryId: string | null }[]>([]);
  const [ecosystems, setEcosystems] = useState<{ id: string; code: string; name: string; description: string }[]>([]);
  const [showNextUServiceModal, setShowNextUServiceModal] = useState(false);
  const [showEcosystemModal, setShowEcosystemModal] = useState(false);
  const [loadingNextUServices, setLoadingNextUServices] = useState(false);
  const [loadingEcosystems, setLoadingEcosystems] = useState(false);
  
  // EntitlementRule state
  const [entitlementRules, setEntitlementRules] = useState<{ id: string; nextUServiceId: string; nextUServiceName: string; price: number; creditAmount: number; period: number; limitPerPeriod: number; note: string }[]>([]);
  const [showEntitlementRuleModal, setShowEntitlementRuleModal] = useState(false);
  const [loadingEntitlementRules, setLoadingEntitlementRules] = useState(false);
  
  // Form states for NextUService
  const [nextUServiceForm, setNextUServiceForm] = useState({
    name: "",
    serviceType: 0,
    ecosystemId: "",
    propertyId: "",
    hiddenField: "" // Trường ẩn để lưu trữ thông tin bổ sung
  });
  
  // Form states for Ecosystem
  const [ecosystemForm, setEcosystemForm] = useState({
    code: "",
    name: "",
    description: ""
  });
  
  // Form states for EntitlementRule
  const [entitlementRuleForm, setEntitlementRuleForm] = useState({
    entittlementRuleName: "",
    nextUServiceId: "",
    price: 0,
    creditAmount: 0,
    period: 0,
    limitPerPeriod: 0,
    note: ""
  });
  
  const [optionForm, setOptionForm] = useState({
    roomTypeName: "",
    roomTypeId: "",
    nextUServiceId: "",
    capacity: 1,
    pricePerNight: 0,
    description: "",
  });
  const [propertyId, setPropertyId] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [roomForm, setRoomForm] = useState({
    accommodationOptionId: "",
    roomCode: "",
    roomName: "",
    descriptionDetails: "",
    areaInSquareMeters: 0,
    roomSizeOptionId: 0,
    roomViewOptionId: 0,
    roomFloorOptionId: 0,
    bedTypeOptionId: 0,
    numberOfBeds: 0,
    addOnFee: "",
  });
  const [roomSizes, setRoomSizes] = useState<{ id: number; name: string }[]>([]);
  const [roomViews, setRoomViews] = useState<{ id: number; name: string }[]>([]);
  const [roomFloors, setRoomFloors] = useState<{ id: number; name: string }[]>([]);
  const [bedTypes, setBedTypes] = useState<{ id: number; name: string }[]>([]);
  const [toast, setToast] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [roomDetail, setRoomDetail] = useState<RoomInstance | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // User state from localStorage
  const [user, setUser] = useState<{
    id: string
    name: string
    email: string
    role: string
    location: string
    property_name: string
    region: string
    avatar: string
  }>({
    id: "",
    name: "",
    email: "",
    role: "",
    location: "",
    property_name: "",
    region: "West Coast",
    avatar: ""
  })
  
  // Image upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    files: [] as File[],
    descriptions: [] as string[],
    type: "image"
  });
  const [uploading, setUploading] = useState(false);
  
  // Drag state for image gallery
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  
  // Drag and drop state for file upload
  const [isDragOver, setIsDragOver] = useState(false);

  // Get user info from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("nextu_internal_user")
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr)
          setUser({
            id: userObj.user_id || "",
            name: userObj.name || "",
            email: userObj.email || "",
            role: userObj.role || "",
            location: userObj.property_name || "",
            property_name: userObj.property_name || "",
            region: "West Coast",
            avatar: getUserInitials(userObj.name || "")
          })
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }
    }
  }, [])

  // Fetch data only once when component mounts
  useEffect(() => {
    console.log('🔄 Component mounted - Fetching data once...');
    fetchOptions();
    fetchRooms();
    fetchRoomSelectOptions();
    fetchNextUServices();
    fetchEcosystems();
    fetchEntitlementRules();
  }, []);

  // Lấy propertyId từ localStorage khi mở modal tạo Room Type
  useEffect(() => {
    if (showOptionModal) {
      let propId = "";
      let propName = "";
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("nextu_internal_user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            propId = userObj.location || "";
            propName = userObj.locationName || "";
          } catch {}
        }
      }
      setPropertyId(propId);
      setPropertyName(propName);
    }
  }, [showOptionModal]);

  // Lấy propertyId từ localStorage khi mở modal tạo NextU Service
  useEffect(() => {
    if (showNextUServiceModal) {
      let propId = "";
      if (typeof window !== "undefined") {
        const userStr = localStorage.getItem("nextu_internal_user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            propId = userObj.location || "";
          } catch {}
        }
      }
             // Reset form khi mở modal
       setNextUServiceForm({
         name: "",
         serviceType: 0,
         ecosystemId: "",
         propertyId: propId,
         hiddenField: ""
       });
    }
  }, [showNextUServiceModal]);

  // Lấy danh sách NextUServices khi mở modal tạo Room Type
  useEffect(() => {
    if (showOptionModal) {
      // Không cần refresh API khi mở modal, dữ liệu đã có sẵn
      console.log('Modal opened, using existing data...');
    }
  }, [showOptionModal]);

  const fetchOptions = async () => {
    setLoadingOptions(true);
    try {
      const res = await api.get("/api/membership/AccommodationOptions");
      setOptions(res.data);
    } catch (err) {
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await api.get("/api/membership/RoomInstances");
      setRooms(res.data);
    } catch (err) {
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchRoomSelectOptions = async () => {
    try {
      const [sizes, views, floors, beds] = await Promise.all([
        api.get("/api/membership/RoomOptions/sizes"),
        api.get("/api/membership/RoomOptions/views"),
        api.get("/api/membership/RoomOptions/floors"),
        api.get("/api/membership/RoomOptions/bed-types"),
      ]);
      setRoomSizes(sizes.data);
      setRoomViews(views.data);
      setRoomFloors(floors.data);
      setBedTypes(beds.data);
    } catch (err) {
      setRoomSizes([]);
      setRoomViews([]);
      setRoomFloors([]);
      setBedTypes([]);
    }
  };

  // Fetch NextUServices
  const fetchNextUServices = async () => {
    console.log('📡 fetchNextUServices called at:', new Date().toLocaleTimeString());
    setLoadingNextUServices(true);
    try {
      const res = await api.get("/api/NextUServices");
      console.log("NextUServices API response:", res.data);
      
      // Đảm bảo dữ liệu có định dạng đúng và xử lý serviceType
      const processedData = res.data.map((service: any) => {
        // Đảm bảo serviceType là số và có giá trị hợp lệ
        let serviceType = 0;
        if (service.serviceType !== null && service.serviceType !== undefined) {
          const parsed = Number(service.serviceType);
          serviceType = isNaN(parsed) ? 0 : parsed;
        }
        
        return {
          ...service,
          serviceType: serviceType
        };
      });
      
      console.log("Processed NextUServices data:", processedData);
      setNextUServices(processedData);
    } catch (err) {
      console.error("Error fetching NextUServices:", err);
      setNextUServices([]);
    } finally {
      setLoadingNextUServices(false);
    }
  };

  // Fetch Ecosystems
  const fetchEcosystems = async () => {
    console.log('📡 fetchEcosystems called at:', new Date().toLocaleTimeString());
    setLoadingEcosystems(true);
    try {
      const res = await api.get("/api/Ecosystems");
      setEcosystems(res.data);
    } catch (err) {
      setEcosystems([]);
    } finally {
      setLoadingEcosystems(false);
    }
  };

  // Fetch EntitlementRules
  const fetchEntitlementRules = async () => {
    setLoadingEntitlementRules(true);
    try {
      const res = await api.get("/api/EntitlementRule");
      console.log("EntitlementRules API response:", res.data);
      setEntitlementRules(res.data);
    } catch (err) {
      console.error("Error fetching EntitlementRules:", err);
      setEntitlementRules([]);
    } finally {
      setLoadingEntitlementRules(false);
    }
  };



  // Create NextUService
  const handleCreateNextUService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Đảm bảo serviceType là số
      const serviceType = Number(nextUServiceForm.serviceType);
      if (isNaN(serviceType)) {
        setToast("Invalid service type value");
        return;
      }

      const requestData = {
        ...nextUServiceForm,
        serviceType: serviceType,
      };

      console.log("Creating NextU Service with data:", requestData);
      const response = await api.post("/api/NextUServices", requestData);
      console.log("NextU Service created successfully:", response.data);
      setToast("NextU Service created successfully!");
      
      // Reset form
      setNextUServiceForm({ name: "", serviceType: 0, ecosystemId: "", propertyId: "", hiddenField: "" });
      setShowNextUServiceModal(false);
      
      // Refresh data
      await fetchNextUServices();
    } catch (err: any) {
      console.error("Error creating NextU Service:", err);
      setToast("Creation failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Create Ecosystem
  const handleCreateEcosystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/Ecosystems", ecosystemForm);
      setToast("Ecosystem created successfully!");
      setEcosystemForm({ code: "", name: "", description: "" });
      setShowEcosystemModal(false);
      fetchEcosystems();
    } catch (err: any) {
      setToast("Creation failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Create EntitlementRule
  const handleCreateEntitlementRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestData = {
        entittlementRuleName: entitlementRuleForm.entittlementRuleName,
        nextUServiceId: entitlementRuleForm.nextUServiceId,
        price: Number(entitlementRuleForm.price),
        creditAmount: Number(entitlementRuleForm.creditAmount),
        period: Number(entitlementRuleForm.period),
        limitPerPeriod: Number(entitlementRuleForm.limitPerPeriod),
        note: entitlementRuleForm.note
      };

      console.log("Creating EntitlementRule with data:", requestData);
      const response = await api.post("/api/EntitlementRule", requestData);
      console.log("EntitlementRule created successfully:", response.data);
      setToast("EntitlementRule created successfully!");
      
      // Reset form
      setEntitlementRuleForm({
        entittlementRuleName: "",
        nextUServiceId: "",
        price: 0,
        creditAmount: 0,
        period: 0,
        limitPerPeriod: 0,
        note: ""
      });
      setShowEntitlementRuleModal(false);
      
      // Refresh data
      await fetchEntitlementRules();
    } catch (err: any) {
      console.error("Error creating EntitlementRule:", err);
      setToast("Creation failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Create
  const handleCreateOption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/membership/AccommodationOptions", {
        roomTypeId: Number(optionForm.roomTypeId),
        accmodationOptionName: optionForm.roomTypeName,
        propertyId: propertyId,
        nextUServiceId: optionForm.nextUServiceId,
        capacity: Number(optionForm.capacity),
        pricePerNight: Number(optionForm.pricePerNight),
        description: optionForm.description
      });
      setToast("Room type created successfully!");
      setOptionForm({ roomTypeName: "", roomTypeId: "", nextUServiceId: "", capacity: 1, pricePerNight: 0, description: "" });
      setShowOptionModal(false);
      fetchOptions();
    } catch (err: any) {
      setToast("Creation failed: " + (err.response?.data?.message || err.message));
    }
  };
  
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roomData = {
        ...roomForm,
        areaInSquareMeters: Number(roomForm.areaInSquareMeters) || 0,
        roomSizeOptionId: Number(roomForm.roomSizeOptionId) || 0,
        roomViewOptionId: Number(roomForm.roomViewOptionId) || 0,
        roomFloorOptionId: Number(roomForm.roomFloorOptionId) || 0,
        bedTypeOptionId: Number(roomForm.bedTypeOptionId) || 0,
        numberOfBeds: Number(roomForm.numberOfBeds) || 0,
        addOnFee: isNaN(Number(roomForm.addOnFee)) ? roomForm.addOnFee : Number(roomForm.addOnFee),
      };
      await api.post("/api/membership/RoomInstances", roomData);
      setToast("Room created successfully!");
      setRoomForm({
        accommodationOptionId: "",
        roomCode: "",
        roomName: "",
        descriptionDetails: "",
        areaInSquareMeters: 0,
        roomSizeOptionId: 0,
        roomViewOptionId: 0,
        roomFloorOptionId: 0,
        bedTypeOptionId: 0,
        numberOfBeds: 0,
        addOnFee: "",
      });
      setShowRoomModal(false);
      fetchRooms();
    } catch (err: any) {
      setToast("Creation failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Handler: open detail modal
  const handleRowClick = async (roomId: string) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setCurrentImageIndex(0); // Reset image index when opening modal
    try {
      const res = await api.get(`/api/membership/RoomInstances/${roomId}`);
      setRoomDetail(res.data);
    } catch (err) {
      setRoomDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Keyboard navigation for images
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDetailModal || !roomDetail?.medias || roomDetail.medias.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextImage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDetailModal, roomDetail?.medias]);

  // Reset drag offset when image changes
  useEffect(() => {
    setDragOffset(0);
  }, [currentImageIndex]);

  // Image navigation functions
  const nextImage = () => {
    if (roomDetail?.medias && roomDetail.medias.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === (roomDetail.medias?.length || 0) - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (roomDetail?.medias && roomDetail.medias.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? (roomDetail.medias?.length || 0) - 1 : prev - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Drag handlers for image gallery
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragStartTime(Date.now());
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStart;
    setDragOffset(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100; // Minimum distance to trigger slide
    const timeThreshold = 300; // Maximum time for quick swipe
    const timeElapsed = Date.now() - dragStartTime;
    
    if (Math.abs(dragOffset) > threshold || (Math.abs(dragOffset) > 50 && timeElapsed < timeThreshold)) {
      if (dragOffset > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }
    
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setDragStartTime(Date.now());
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStart;
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    const timeThreshold = 300;
    const timeElapsed = Date.now() - dragStartTime;
    
    if (Math.abs(dragOffset) > threshold || (Math.abs(dragOffset) > 50 && timeElapsed < timeThreshold)) {
      if (dragOffset > 0) {
        prevImage();
      } else {
        nextImage();
      }
    }
    
    setDragOffset(0);
  };

  // Image upload handler
  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.files.length || !roomDetail) {
      setToast('Please select at least one image file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      
      // Append multiple files
      uploadForm.files.forEach((file, index) => {
        formData.append(`Files`, file);
      });
      
      // Append descriptions for each file
      uploadForm.descriptions.forEach((description, index) => {
        formData.append('Descriptions', description || `Image ${index + 1}`);
      });
      
      formData.append('ActorType', '3'); // Fixed value for rooms
      formData.append('ActorId', roomDetail.id);
      formData.append('Type', uploadForm.type);

      await api.post('/api/Media/upload-many', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setToast(`${uploadForm.files.length} image(s) uploaded successfully!`);
      setUploadForm({ files: [], descriptions: [], type: "image" });
      setShowUploadModal(false);
      
      // Refresh room details to show new images
      if (roomDetail) {
        const res = await api.get(`/api/membership/RoomInstances/${roomDetail.id}`);
        setRoomDetail(res.data);
        setCurrentImageIndex(0); // Reset to first image
      }
    } catch (err: any) {
      setToast('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Table columns
  const typeColumns: TableColumn[] = [
    { key: "roomTypeName", label: "Room Type Name" },
    { key: "capacity", label: "Capacity" },
    { key: "pricePerNight", label: "Price/Night" },
    { key: "description", label: "Description" },
  ];
  const roomColumns: TableColumn[] = [
    { key: "roomName", label: "Room Name" },
    { key: "roomCode", label: "Room Code" },
    { key: "type", label: "Type" },
    { key: "finalPrice", label: "Price/Night" },
  ];
  
  // DataTable data mapping
  const typeRows = options.map(opt => ({ ...opt }));
  const roomRows = rooms.map(room => {
    const opt = options.find(o => o.id === room.accommodationOptionId);
    let addOnFee = 0;
    if (room.addOnFee !== undefined && !isNaN(Number(room.addOnFee))) {
      addOnFee = Number(room.addOnFee);
    }
    const finalPrice = opt ? (opt.pricePerNight || 0) + addOnFee : addOnFee;
    return {
      roomName: room.roomName,
      roomCode: room.roomCode,
      type: opt?.roomTypeName || '-',
      finalPrice: finalPrice ? finalPrice.toLocaleString() + ' VND' : '-',
    };
  });

  // Dashboard cards
  const totalRooms = rooms.length;
  const totalTypes = options.length;
  const totalCapacity = options.reduce((sum, o) => sum + (o.capacity || 0), 0);

  // Helper: get type price from options by accommodationOptionId
  const getTypePrice = (accommodationOptionId: string) => {
    const opt = options.find(o => o.id === accommodationOptionId);
    return opt?.pricePerNight ? Number(opt.pricePerNight).toLocaleString() + ' VND' : '-';
  };

  return (
    <RoleLayout>
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />
      <Sidebar navigation={navigation} title="Next U" userRole="Admin" />
      <div className="lg:pl-64 flex flex-col flex-1 bg-gray-50 min-h-screen">
        <TopNav user={user} title="Room Management" />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
         

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <DashboardCard 
              title="Total Spaces" 
              value={totalRooms} 
              icon={() => <span className="text-2xl">🏠</span>} 
            />
            <DashboardCard 
              title="Space Types" 
              value={totalTypes} 
              icon={() => <span className="text-2xl">📦</span>} 
            />
            <DashboardCard 
              title="NextU Services" 
              value={nextUServices.length} 
              icon={() => <span className="text-2xl">🔧</span>} 
            />
            <DashboardCard 
              title="Ecosystems" 
              value={ecosystems.length} 
              icon={() => <span className="text-2xl">🌐</span>} 
            />
            <DashboardCard 
              title="Entitlement Rules" 
              value={entitlementRules.length} 
              icon={() => <span className="text-2xl">📋</span>} 
            />
          </div>



          {/* Main Content Grid - 2x3 Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
            
            {/* Top Left - Ecosystems */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ecosystems</h3>
                    <p className="text-gray-600 text-xs">Business ecosystems management</p>
                  </div>
                  <button 
                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 text-sm font-medium transition-all duration-200 shadow-md" 
                    onClick={() => setShowEcosystemModal(true)}
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="overflow-hidden h-[calc(100%-60px)]">
                {loadingEcosystems ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto h-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ecosystems.map((ecosystem) => (
                          <tr key={ecosystem.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{ecosystem.code}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{ecosystem.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-500 truncate max-w-32">{ecosystem.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Top Right - NextU Services */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">NextU Services</h3>
                    <p className="text-gray-600 text-xs">Service types management</p>
                  </div>
                  <button 
                    className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-sm font-medium transition-all duration-200 shadow-md" 
                    onClick={() => setShowNextUServiceModal(true)}
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="overflow-hidden h-[calc(100%-60px)]">
                {loadingNextUServices ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto h-full">
                    <table className="min-w-full divide-y divide-gray-200">
                                             <thead className="bg-gray-50 sticky top-0">
                         <tr>
                           <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                           <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                           <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ecosystem</th>
                           <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                         </tr>
                       </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                                                {nextUServices.map((service) => {
                          // Đảm bảo serviceType là số và có giá trị hợp lệ
                          const serviceType = typeof service.serviceType === 'number' ? service.serviceType : Number(service.serviceType) || 0;
                          const isBooking = serviceType === 0;
                          
                          // Debug logging
                          if (process.env.NODE_ENV === 'development') {
                            console.log(`Service ${service.name}:`, {
                              original: service.serviceType,
                              type: typeof service.serviceType,
                              processed: serviceType,
                              isBooking: isBooking
                            });
                          }
                         
                          return (
                            <tr key={service.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  isBooking 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {isBooking ? ' Booking' : ' Service'}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 truncate max-w-24">{service.ecosystemName}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 truncate max-w-24">{service.propertyName}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Left - Room Types */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Space Types</h3>
                    <p className="text-gray-600 text-xs">Accommodation types</p>
                  </div>
                  <button 
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium transition-all duration-200 shadow-md" 
                    onClick={() => setShowOptionModal(true)}
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="overflow-hidden h-[calc(100%-60px)]">
                {loadingOptions ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto h-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Night</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {options.map((option) => (
                          <tr key={option.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{option.accmodationOptionName || option.roomTypeName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{option.capacity}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{option.pricePerNight?.toLocaleString()} VND</td>
                            <td className="px-3 py-2 text-sm text-gray-500 truncate max-w-32">{option.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Right - Rooms */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Spaces</h3>
                    <p className="text-gray-600 text-xs">Room instances</p>
                  </div>
                  <button 
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium transition-all duration-200 shadow-md" 
                    onClick={() => setShowRoomModal(true)}
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="overflow-hidden h-[calc(100%-60px)]">
                {loadingRooms ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto h-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Night</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rooms.map((room, index) => {
                          const opt = options.find(o => o.id === room.accommodationOptionId);
                          let addOnFee = 0;
                          if (room.addOnFee !== undefined && !isNaN(Number(room.addOnFee))) {
                            addOnFee = Number(room.addOnFee);
                          }
                          const finalPrice = opt ? (opt.pricePerNight || 0) + addOnFee : addOnFee;
                          
                          return (
                            <tr key={room.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(room.id)}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{room.roomName}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{room.roomCode}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{opt?.accmodationOptionName || opt?.roomTypeName || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{finalPrice ? finalPrice.toLocaleString() + ' VND' : '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Third Column - EntitlementRules */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Entitlement Rules</h3>
                    <p className="text-gray-600 text-xs">Service entitlement management</p>
                  </div>
                  <button 
                    className="bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 text-sm font-medium transition-all duration-200 shadow-md" 
                    onClick={() => setShowEntitlementRuleModal(true)}
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="overflow-hidden h-[calc(100%-60px)]">
                {loadingEntitlementRules ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto h-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entitlementRules.map((rule) => (
                          <tr key={rule.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-32">{rule.nextUServiceName}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{rule.price.toLocaleString()} VND</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{rule.creditAmount}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{rule.period}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{rule.limitPerPeriod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Room Type Modal */}
          <Modal open={showOptionModal} title="Add New Space Type" onClose={() => setShowOptionModal(false)}>
            <form className="space-y-3 p-5" onSubmit={handleCreateOption}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Space Type Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter space type name..." 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                    value={optionForm.roomTypeName} 
                    onChange={e => setOptionForm(f => ({ ...f, roomTypeName: e.target.value }))} 
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be used as the accommodation option name</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Space Type ID *</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter room type id..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={optionForm.roomTypeId}
                    onChange={e => setOptionForm(f => ({ ...f, roomTypeId: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">NextU Service *</label>
                {loadingNextUServices ? (
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-gray-500 text-sm">Loading services...</span>
                  </div>
                ) : (
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    value={optionForm.nextUServiceId}
                    onChange={e => setOptionForm(f => ({ ...f, nextUServiceId: e.target.value }))}
                  >
                    <option value="">-- Select NextU Service --</option>
                    {nextUServices
                      .filter(service => {
                        // Đảm bảo serviceType là số và bằng 0 (booking phòng)
                        const serviceType = typeof service.serviceType === 'number' ? service.serviceType : Number(service.serviceType) || 0;
                        return serviceType === 0;
                      })
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.ecosystemName || 'No Ecosystem'})
                        </option>
                      ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Only showing booking services (serviceType = "Booking") - Total: {nextUServices.filter(s => {
                    const serviceType = typeof s.serviceType === 'number' ? s.serviceType : Number(s.serviceType) || 0;
                    return serviceType === 0;
                  }).length}
                </p>
                {nextUServices.length > 0 && nextUServices.filter(s => {
                  const serviceType = typeof s.serviceType === 'number' ? s.serviceType : Number(s.serviceType) || 0;
                  return serviceType === 0;
                }).length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ No booking services found. Please create a service with serviceType = "Booking".
                  </p>
                )}
                {/* Debug info */}
              
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Capacity *</label>
                  <input 
                    type="number" 
                    min={1} 
                    required 
                    placeholder="Number of people" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                    value={optionForm.capacity} 
                    onChange={e => setOptionForm(f => ({ ...f, capacity: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price per Unit *</label>
                  <input 
                    type="number" 
                    min={0} 
                    required 
                    placeholder="VND" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                    value={optionForm.pricePerNight} 
                    onChange={e => setOptionForm(f => ({ ...f, pricePerNight: Number(e.target.value) }))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea 
                  placeholder="Detailed description of the room type..." 
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none" 
                  value={optionForm.description} 
                  onChange={e => setOptionForm(f => ({ ...f, description: e.target.value }))} 
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-200 font-medium transition-all duration-200" 
                  onClick={() => setShowOptionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 font-medium transition-all duration-200 shadow-md"
                >
                  Create Room Type
                </button>
              </div>
            </form>
          </Modal>

          {/* Add Room Modal */}
          <Modal open={showRoomModal} title="Add New Room" onClose={() => setShowRoomModal(false)}>
            <form className="space-y-3 p-5" onSubmit={handleCreateRoom}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Accommodation Option *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
                    value={roomForm.accommodationOptionId} 
                    onChange={e => setRoomForm(f => ({ ...f, accommodationOptionId: e.target.value }))}
                  >
                    <option value="">-- Select Accommodation Option --</option>
                    {options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.accmodationOptionName || opt.roomTypeName}</option>
                    ))}
                  </select>
                  {/* Hiển thị giá theo đêm nếu đã chọn Accommodation Option */}
                  {roomForm.accommodationOptionId && (() => {
                    const selected = options.find(opt => opt.id === roomForm.accommodationOptionId);
                    if (!selected) return null;
                    return (
                      <div className="mt-1.5 text-sm text-gray-500">Price per night: <span className="font-semibold text-green-700">{selected.pricePerNight?.toLocaleString()} VND</span></div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Space Code *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., A101" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.roomCode} 
                    onChange={e => setRoomForm(f => ({ ...f, roomCode: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Space Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter space name..." 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.roomName} 
                    onChange={e => setRoomForm(f => ({ ...f, roomName: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Area (m²) *</label>
                  <input 
                    type="number" 
                    min={0} 
                    required 
                    placeholder="e.g., 80" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.areaInSquareMeters} 
                    onChange={e => setRoomForm(f => ({ ...f, areaInSquareMeters: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Space Size *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
                    value={roomForm.roomSizeOptionId} 
                    onChange={e => setRoomForm(f => ({ ...f, roomSizeOptionId: Number(e.target.value) }))}
                  >
                    <option value={0}>-- Select Size --</option>
                    {roomSizes.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Space View *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
                    value={roomForm.roomViewOptionId} 
                    onChange={e => setRoomForm(f => ({ ...f, roomViewOptionId: Number(e.target.value) }))}
                  >
                    <option value={0}>-- Select View --</option>
                    {roomViews.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Space Floor *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
                    value={roomForm.roomFloorOptionId} 
                    onChange={e => setRoomForm(f => ({ ...f, roomFloorOptionId: Number(e.target.value) }))}
                  >
                    <option value={0}>-- Select Floor --</option>
                    {roomFloors.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bed Type *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
                    value={roomForm.bedTypeOptionId} 
                    onChange={e => setRoomForm(f => ({ ...f, bedTypeOptionId: Number(e.target.value) }))}
                  >
                    <option value={0}>-- Select Bed Type --</option>
                    {bedTypes.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Beds *</label>
                  <input 
                    type="number" 
                    min={0} 
                    required 
                    placeholder="e.g., 2" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.numberOfBeds} 
                    onChange={e => setRoomForm(f => ({ ...f, numberOfBeds: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Add-on Fee</label>
                  <input 
                    type="text"
                    placeholder="e.g., 20000 or Negotiable"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.addOnFee}
                    onChange={e => setRoomForm(f => ({ ...f, addOnFee: e.target.value }))}
                  />
                  {/* Show add-on fee per night */}
                  {roomForm.addOnFee && (
                    <div className="mt-1.5 text-sm text-green-700">
                      Add-on fee per night: {isNaN(Number(roomForm.addOnFee))
                        ? roomForm.addOnFee
                        : Number(roomForm.addOnFee).toLocaleString() + ' VND'}
                    </div>
                  )}
                  {/* Show final price per night */}
                  {roomForm.accommodationOptionId && (() => {
                    const selected = options.find(opt => opt.id === roomForm.accommodationOptionId);
                    if (!selected) return null;
                    const addOnFeeNum = Number(roomForm.addOnFee);
                    const isAddOnFeeNumber = !isNaN(addOnFeeNum);
                    const finalPrice = isAddOnFeeNumber ? selected.pricePerNight + addOnFeeNum : selected.pricePerNight;
                    return (
                      <div className="mt-1.5 text-sm text-blue-700 font-semibold">
                        Final price per night: {finalPrice.toLocaleString()} VND
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detailed Description</label>
                <textarea 
                  placeholder="Detailed description of the room..." 
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none" 
                  value={roomForm.descriptionDetails} 
                  onChange={e => setRoomForm(f => ({ ...f, descriptionDetails: e.target.value }))} 
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-200 font-medium transition-all duration-200" 
                  onClick={() => setShowRoomModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 font-medium transition-all duration-200 shadow-md"
                >
                  Create Room
                </button>
              </div>
            </form>
          </Modal>

          {/* Add NextU Service Modal */}
          <Modal open={showNextUServiceModal} title="Add New NextU Service" onClose={() => setShowNextUServiceModal(false)}>
            <form className="space-y-3 p-5" onSubmit={handleCreateNextUService}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter service name..." 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200" 
                    value={nextUServiceForm.name} 
                    onChange={e => setNextUServiceForm(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Type *</label>
                   <select
                     required
                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                     value={nextUServiceForm.serviceType}
                     onChange={e => setNextUServiceForm(f => ({ ...f, serviceType: Number(e.target.value) }))}
                   >
                     <option value={0}>Booking</option>
                     <option value={1}>Non-booking</option>
                   </select>
                 </div>
              </div>
              
                             <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ecosystem *</label>
                 <select
                   required
                   className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                   value={nextUServiceForm.ecosystemId}
                   onChange={e => setNextUServiceForm(f => ({ ...f, ecosystemId: e.target.value }))}
                 >
                   <option value="">-- Select Ecosystem --</option>
                   {ecosystems.map(ecosystem => (
                     <option key={ecosystem.id} value={ecosystem.id}>{ecosystem.name}</option>
                   ))}
                 </select>
               </div>
              
                             {/* Hidden field for non-booking information */}
               <input
                 type="hidden"
                 value={nextUServiceForm.hiddenField}
                 onChange={e => setNextUServiceForm(f => ({ ...f, hiddenField: e.target.value }))}
               />
               
               <div className="flex gap-3 pt-2">
                                  <button 
                    type="button" 
                    className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-200 font-medium transition-all duration-200" 
                    onClick={() => {
                      setShowNextUServiceModal(false);
                      // Reset form khi đóng modal
                      setNextUServiceForm({
                        name: "",
                        serviceType: 0,
                        ecosystemId: "",
                        propertyId: "",
                        hiddenField: ""
                      });
                    }}
                  >
                    Cancel
                  </button>
                 <button 
                   type="submit" 
                   className="flex-1 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 font-medium transition-all duration-200 shadow-md"
                 >
                   Create Service
                 </button>
               </div>
            </form>
          </Modal>

          {/* Add Ecosystem Modal */}
          <Modal open={showEcosystemModal} title="Add New Ecosystem" onClose={() => setShowEcosystemModal(false)}>
            <form className="space-y-3 p-5" onSubmit={handleCreateEcosystem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Code *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., CO-LV" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    value={ecosystemForm.code} 
                    onChange={e => setEcosystemForm(f => ({ ...f, code: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Co-living" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200" 
                    value={ecosystemForm.name} 
                    onChange={e => setEcosystemForm(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea 
                  placeholder="Enter ecosystem description..." 
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none" 
                  value={ecosystemForm.description} 
                  onChange={e => setEcosystemForm(f => ({ ...f, description: e.target.value }))} 
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-200 font-medium transition-all duration-200" 
                  onClick={() => setShowEcosystemModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 text-white rounded-lg px-4 py-2 hover:bg-emerald-700 font-medium transition-all duration-200 shadow-md"
                >
                  Create Ecosystem
                </button>
              </div>
            </form>
          </Modal>

          {/* Add EntitlementRule Modal */}
          <Modal open={showEntitlementRuleModal} title="Add New Entitlement Rule" onClose={() => setShowEntitlementRuleModal(false)}>
            <form className="space-y-3 p-5" onSubmit={handleCreateEntitlementRule}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Entitlement Rule Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter entitlement rule name..." 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                    value={entitlementRuleForm.entittlementRuleName} 
                    onChange={e => setEntitlementRuleForm(f => ({ ...f, entittlementRuleName: e.target.value }))} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a descriptive name for this entitlement rule</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">NextU Service *</label>
                  {loadingNextUServices ? (
                    <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                      <span className="text-gray-500 text-sm">Loading services...</span>
                    </div>
                  ) : (
                    <select
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                      value={entitlementRuleForm.nextUServiceId}
                      onChange={e => setEntitlementRuleForm(f => ({ ...f, nextUServiceId: e.target.value }))}
                    >
                      <option value="">-- Select NextU Service --</option>
                      {nextUServices
                        .filter(service => {
                          // Chỉ hiển thị non-booking services (serviceType = 1)
                          const serviceType = typeof service.serviceType === 'number' ? service.serviceType : Number(service.serviceType) || 0;
                          return serviceType === 1;
                        })
                        .map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name} ({service.ecosystemName || 'No Ecosystem'})
                          </option>
                        ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Only showing non-booking services - Total: {nextUServices.filter(s => {
                      const serviceType = typeof s.serviceType === 'number' ? s.serviceType : Number(s.serviceType) || 0;
                      return serviceType === 1;
                    }).length}
                  </p>
                  {nextUServices.length > 0 && nextUServices.filter(s => {
                    const serviceType = typeof s.serviceType === 'number' ? s.serviceType : Number(s.serviceType) || 0;
                    return serviceType === 1;
                  }).length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ No non-booking services found. Please create a service with serviceType = "Non-Booking" first.
                    </p>
                  )}
                  {/* Debug info */}
                  <p className="text-xs text-gray-400 mt-1">
                  
                    Services with type non-booking: {nextUServices.filter(s => {
                      const serviceType = typeof s.serviceType === 'number' ? s.serviceType : Number(s.serviceType) || 0;
                      return serviceType === 1;
                    }).length}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price *</label>
                  <input 
                    type="number" 
                    min={0}
                    required 
                    placeholder="Enter price..." 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                    value={entitlementRuleForm.price} 
                    onChange={e => setEntitlementRuleForm(f => ({ ...f, price: Number(e.target.value) }))} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Credit Amount *</label>
                  <input 
                    type="number" 
                    min={0}
                    required 
                    placeholder="Enter credit amount..." 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                    value={entitlementRuleForm.creditAmount} 
                    onChange={e => setEntitlementRuleForm(f => ({ ...f, creditAmount: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Period *</label>
                  <input 
                    type="number" 
                    min={0}
                    required 
                    placeholder="Enter period..." 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                    value={entitlementRuleForm.period} 
                    onChange={e => setEntitlementRuleForm(f => ({ ...f, period: Number(e.target.value) }))} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Limit Per Period *</label>
                <input 
                  type="number" 
                  min={0}
                  required 
                  placeholder="Enter limit per period..." 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200" 
                  value={entitlementRuleForm.limitPerPeriod} 
                  onChange={e => setEntitlementRuleForm(f => ({ ...f, limitPerPeriod: Number(e.target.value) }))} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note</label>
                <textarea 
                  placeholder="Enter note..." 
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 resize-none" 
                  value={entitlementRuleForm.note} 
                  onChange={e => setEntitlementRuleForm(f => ({ ...f, note: e.target.value }))} 
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-200 font-medium transition-all duration-200" 
                  onClick={() => {
                    setShowEntitlementRuleModal(false);
                    // Reset form when closing modal
                    setEntitlementRuleForm({
                      entittlementRuleName: "",
                      nextUServiceId: "",
                      price: 0,
                      creditAmount: 0,
                      period: 0,
                      limitPerPeriod: 0,
                      note: ""
                    });
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-orange-600 text-white rounded-lg px-4 py-2 hover:bg-orange-700 font-medium transition-all duration-200 shadow-md"
                >
                  Create Entitlement Rule
                </button>
              </div>
            </form>
          </Modal>

          {/* Room Detail Modal */}
          <Modal open={showDetailModal} title={`Room ${roomDetail?.roomTypeName || 'Details'}`} onClose={() => setShowDetailModal(false)}>
            {detailLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Space details...</p>
              </div>
            ) : roomDetail ? (
                             <div className="flex h-[calc(95vh-120px)]">
                {/* Left Column - Fixed Image Gallery */}
                <div className="w-2/5 p-4 pr-2 flex flex-col">
                  {roomDetail.medias && roomDetail.medias.length > 0 ? (
                    <div className="space-y-3">
                      {/* Main Image Display with Drag Support */}
                      <div className="relative">
                        <div 
                          className="aspect-[4/3] overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing rounded-lg"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                        >
                          <div 
                            className="relative h-full w-full flex transition-transform duration-300 ease-out"
                            style={{
                              transform: `translateX(calc(-${currentImageIndex * 100}% + ${dragOffset}px))`,
                              width: `${roomDetail.medias.length * 100}%`
                            }}
                          >
                            {roomDetail.medias.map((media: Media, index: number) => (
                              <div key={media.id} className="w-full h-full flex-shrink-0">
                                <img
                                  src={media.url}
                                  alt={media.description || `space image ${index + 1}`}
                                  className="h-full w-full object-cover rounded-lg"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0IDg5LjU0NCA4MCAxMDAgODBDMTEwLjQ1NiA4MCAxMjAgODkuNTQ0IDEyMCAxMDBDMTIwIDExMC40NTYgMTEwLjQ1NiAxMjAgMTAwIDEyMEM4OS41NDQgMTIwIDgwIDExMC40NTYgODAgMTAwWiIgZmlsbD0iIzlCOUJBMCIvPjxwYXRoIGQ9Ik0xMDAgMTMwQzExMC40NTYgMTMwIDEyMCAxMjAuNDU2IDEyMCAxMTBDMTIwIDk5LjU0NCAxMTAuNDU2IDkwIDEwMCA5MEM4OS41NDQgOTAgODAgOTkuNTQ0IDgwIDExMEM4MCAxMjAuNDU2IDg5LjU0NCAxMzAgMTAwIDEzMFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Navigation Arrows */}
                        {roomDetail.medias.length > 1 && (
                          <>
                            <button 
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 shadow-lg transition-all duration-200 hover:scale-110 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button 
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 shadow-lg transition-all duration-200 hover:scale-110 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        {roomDetail.medias.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {currentImageIndex + 1}/{roomDetail.medias.length}
                          </div>
                        )}
                      </div>

                      {/* Thumbnail Navigation */}
                      {roomDetail.medias.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-1">
                          {roomDetail.medias.slice(0, 4).map((media: Media, index: number) => (
                            <div key={media.id} className="flex-shrink-0">
                              <div 
                                onClick={() => goToImage(index)}
                                className={`w-12 h-9 overflow-hidden border-2 transition-all duration-300 ease-in-out cursor-pointer transform hover:scale-105 rounded ${
                                  currentImageIndex === index 
                                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' 
                                    : 'border-gray-200 hover:border-blue-400'
                                }`}
                              >
                                <img
                                  src={media.url}
                                  alt={media.description || `Thumbnail ${index + 1}`}
                                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0IDg5LjU0NCA4MCAxMDAgODBDMTEwLjQ1NiA4MCAxMjAgODkuNTQ0IDEyMCAxMDBDMTIwIDExMC40NTYgMTEwLjQ1NiAxMjAgMTAwIDEyMEM4OS41NDQgMTIwIDgwIDExMC40NTYgODAgMTAwWiIgZmlsbD0iIzlCOUJBMCIvPjxwYXRoIGQ9Ik0xMDAgMTMwQzExMC40NTYgMTMwIDEyMCAxMjAuNDU2IDEyMCAxMTBDMTIwIDk5LjU0NCAxMTAuNDU2IDkwIDEwMCA5MEM4OS41NDQgOTAgODAgOTkuNTQ0IDgwIDExMEM4MCAxMjAuNDU2IDg5LjU0NCAxMzAgMTAwIDEzMFoiIGZpbGw9IiM5QjlCQTAiLz4KPC9zdmc+';
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                          {roomDetail.medias.length > 4 && (
                            <div className="flex-shrink-0 w-12 h-9 bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium rounded">
                              +{roomDetail.medias.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-xs">No images available</p>
                    </div>
                  )}

                  {/* Upload Image Button - Fixed at bottom of left column */}
                  <div className="mt-auto pt-4">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Image
                    </button>
                  </div>
                </div>

                {/* Right Column - Content & Fixed Pricing */}
                <div className="w-3/5 flex flex-col">
                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto p-4 pl-2">
                    {/* Room Header - Compact Layout */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{roomDetail.roomName}</h2>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                          roomDetail.status === 'Available' ? 'bg-green-100 text-green-800' : 
                          roomDetail.status === 'Occupied' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {roomDetail.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{roomDetail.roomTypeName}</p>
                    </div>

                    {/* Description - Compact */}
                    {roomDetail.descriptionDetails && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Description</h4>
                        <div className="bg-gray-50 p-2 rounded text-sm">
                          <p className="text-gray-700">{roomDetail.descriptionDetails}</p>
                        </div>
                      </div>
                    )}

                    {/* Quick Details - Compact Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-6 h-6 bg-blue-100 flex items-center justify-center rounded">
                          <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bed Type</p>
                          <p className="text-sm font-medium text-gray-900">{roomDetail.bedTypeName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <div className="w-6 h-6 bg-green-100 flex items-center justify-center rounded">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-sm font-medium text-gray-900">{roomDetail.numberOfBeds} people</p>
                        </div>
                      </div>
                    </div>

                    {/* Room Specifications - Compact */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Space Specifications</h4>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium text-gray-900">{roomDetail.areaInSquareMeters} m²</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium text-gray-900">{roomDetail.roomSizeName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">View:</span>
                          <span className="font-medium text-gray-900">{roomDetail.roomViewName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Floor:</span>
                          <span className="font-medium text-gray-900">{roomDetail.roomFloorName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location - Compact */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Location</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded"></div>
                          <span className="text-gray-600">City:</span>
                          <span className="font-medium text-gray-900">{roomDetail.cityName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded"></div>
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-gray-900">{roomDetail.locationName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded"></div>
                          <span className="text-gray-600">Property:</span>
                          <span className="font-medium text-gray-900">{roomDetail.propertyName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fixed Bottom Section - Pricing & Upload Button */}
                  <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      {/* Pricing Details */}
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Pricing Details</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Base Price:</span>
                            <span className="font-medium text-gray-900">{getTypePrice(roomDetail.accommodationOptionId)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Add-on Fee:</span>
                            <span className="font-medium text-gray-900">
                              {Number(roomDetail.addOnFee).toLocaleString()} VND
                            </span>
                          </div>
                          <div className="pt-1 border-t border-gray-300">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-gray-900">Total Price</span>
                              <div className="text-right">
                                <span className="text-lg font-bold text-orange-600">
                                  {(() => {
                                    const typePrice = options.find(o => o.id === roomDetail.accommodationOptionId)?.pricePerNight || 0;
                                    const addOn = Number(roomDetail.addOnFee) || 0;
                                    return (typePrice + addOn).toLocaleString();
                                  })()}
                                </span>
                                <span className="text-sm text-orange-600"> VND / Night</span>
                                <p className="text-xs text-gray-500">Tax and fees included</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-red-500 font-medium">Failed to load space details.</p>
                <p className="text-gray-500 text-sm mt-1">Please try again later.</p>
              </div>
            )}
          </Modal>

          {/* Image Upload Modal */}
          <Modal open={showUploadModal} title={`Upload Space Images ${uploadForm.files.length > 0 ? `(${uploadForm.files.length} selected)` : ''}`} onClose={() => setShowUploadModal(false)}>
            <div className="max-w-7xl mx-auto">
              <form className="space-y-6" onSubmit={handleImageUpload}>
                {/* Main Content - Horizontal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column - File Upload & Preview */}
                  <div className="space-y-6">
                    {/* File Upload Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {uploadForm.files.length > 0 && (
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {uploadForm.files.length}
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {uploadForm.files.length > 0 ? `${uploadForm.files.length} Images Selected` : 'Upload New Images'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {uploadForm.files.length > 0 ? 'Click to add more images or drag & drop' : 'Select multiple image files to upload'}
                        </p>
                      </div>

                      <div 
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                          isDragOver 
                            ? 'border-blue-500 bg-blue-100/70 scale-105' 
                            : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/50'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                          
                          const droppedFiles = Array.from(e.dataTransfer.files).filter(
                            file => file.type.startsWith('image/')
                          );
                          
                          if (droppedFiles.length > 0) {
                            setUploadForm(prev => ({ 
                              ...prev, 
                              files: [...prev.files, ...droppedFiles],
                              descriptions: [...prev.descriptions, ...new Array(droppedFiles.length).fill("")]
                            }));
                          }
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const newFiles = Array.from(e.target.files || []);
                            if (newFiles.length > 0) {
                              setUploadForm(prev => ({ 
                                ...prev, 
                                files: [...prev.files, ...newFiles],
                                descriptions: [...prev.descriptions, ...new Array(newFiles.length).fill("")]
                              }));
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer block">
                          {uploadForm.files.length > 0 ? (
                            <div className="space-y-4">
                              {/* Multiple Images Preview */}
                              <div className="max-w-full mx-auto">
                                {/* Main preview grid */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                  {uploadForm.files.slice(0, 6).map((file, index) => (
                                    <div key={index} className="relative group">
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-lg border-2 border-blue-200 shadow-md transition-all duration-200 group-hover:scale-105"
                                        onLoad={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.onload = null;
                                        }}
                                      />
                                      {/* Image number badge */}
                                      <div className="absolute top-1 left-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                                        {index + 1}
                                      </div>
                                      {/* Remove button */}
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const newFiles = uploadForm.files.filter((_, i) => i !== index);
                                          const newDescriptions = uploadForm.descriptions.filter((_, i) => i !== index);
                                          setUploadForm(prev => ({ ...prev, files: newFiles, descriptions: newDescriptions }));
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                  {uploadForm.files.length > 6 && (
                                    <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-lg flex flex-col items-center justify-center text-blue-700 font-bold text-sm shadow-md">
                                      <div className="text-lg">+{uploadForm.files.length - 6}</div>
                                      <div className="text-xs">more images</div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* File list summary */}
                                {uploadForm.files.length > 3 && (
                                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                                    <div className="text-xs text-blue-800 font-medium mb-2">Selected Files:</div>
                                    <div className="max-h-20 overflow-y-auto space-y-1">
                                      {uploadForm.files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs">
                                          <span className="text-gray-700 truncate max-w-32">{index + 1}. {file.name}</span>
                                          <span className="text-gray-500 ml-2">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Summary Stats Card */}
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg px-4 py-3 border border-green-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-green-800">{uploadForm.files.length} Images Ready</p>
                                      <p className="text-xs text-green-600">
                                        Total Size: {(uploadForm.files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setUploadForm(prev => ({ ...prev, files: [], descriptions: [] }));
                                      }}
                                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md transition-colors duration-200"
                                    >
                                      Clear All
                                    </button>
                                    <div className="text-2xl">📷</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <div>
                                <p className={`text-base font-semibold mb-1 transition-colors duration-300 ${
                                  isDragOver ? 'text-blue-700' : 'text-gray-900'
                                }`}>
                                  {isDragOver ? '🎯 Drop Images Here!' : '📸 Drop Multiple Images Here'}
                                </p>
                                <p className={`text-sm mb-3 transition-colors duration-300 ${
                                  isDragOver ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                  {isDragOver ? 'Release to add images' : 'or click to browse and select multiple files'}
                                </p>
                                <div className="space-y-2">
                                  <div className="inline-flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-blue-200 text-xs text-gray-600">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>PNG, JPG, JPEG up to 10MB each</span>
                                  </div>
                                  <div className="inline-flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200 text-xs text-green-700">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Select multiple files at once</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Upload Configuration - Compact */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Upload Configuration
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1">
                          <span className="text-blue-700 font-medium">ActorType:</span>
                          <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">3</span>
                        </div>
                        <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1">
                          <span className="text-blue-700 font-medium">Max Files:</span>
                          <span className="text-blue-800 font-medium">Multiple</span>
                        </div>
                        <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1">
                          <span className="text-blue-700 font-medium">Max Size:</span>
                          <span className="text-blue-800 font-medium">10 MB each</span>
                        </div>
                        <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1">
                          <span className="text-blue-700 font-medium">Formats:</span>
                          <span className="text-blue-800 font-medium">PNG, JPG, JPEG</span>
                        </div>
                        <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1">
                          <span className="text-blue-700 font-medium">ActorId:</span>
                          <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs truncate max-w-20">
                            {roomDetail?.id?.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1">
                          <span className="text-blue-700 font-medium">API:</span>
                          <span className="text-blue-800 font-medium">upload-many</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Form Fields */}
                  <div className="space-y-6">
                    {/* Image Details */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        Image Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-gray-700">
                              Descriptions for Each Image
                              <span className="text-blue-600 text-xs ml-2">({uploadForm.files.length} files)</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const autoDescriptions = uploadForm.files.map((file, index) => 
                                  `Space image ${index + 1} - ${file.name.split('.')[0]}`
                                );
                                setUploadForm(prev => ({ ...prev, descriptions: autoDescriptions }));
                              }}
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors duration-200"
                            >
                              Auto Fill
                            </button>
                          </div>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {uploadForm.files.map((file, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex-shrink-0">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Preview ${index + 1}`}
                                    className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                                  />
                                  <div className="text-center mt-1">
                                    <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-xs text-gray-600 mb-1 truncate max-w-48">{file.name}</div>
                                  <input
                                    type="text"
                                    placeholder={`Description for image ${index + 1}...`}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    value={uploadForm.descriptions[index] || ""}
                                    onChange={(e) => {
                                      const newDescriptions = [...uploadForm.descriptions];
                                      newDescriptions[index] = e.target.value;
                                      setUploadForm(prev => ({ ...prev, descriptions: newDescriptions }));
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Image Type</label>
                          <select
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                            value={uploadForm.type}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))}
                          >
                            <option value="image">Image</option>
                            <option value="photo">Photo</option>
                            <option value="screenshot">Screenshot</option>
                            <option value="banner">Banner</option>
                            <option value="icon">Icon</option>
                            <option value="logo">Logo</option>
                            <option value="thumbnail">Thumbnail</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        className="flex-1 bg-gray-100 text-gray-700 rounded-xl px-6 py-4 hover:bg-gray-200 font-medium transition-all duration-200 border border-gray-200 hover:border-gray-300"
                        onClick={() => {
                          setShowUploadModal(false);
                          setUploadForm({ files: [], descriptions: [], type: "image" });
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!uploadForm.files.length || uploading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 py-4 hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Uploading {uploadForm.files.length} images...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload {uploadForm.files.length > 0 ? `${uploadForm.files.length} Images` : 'Images'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </Modal>

          {/* Toast */}
          {toast && (
            <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-in slide-in-from-right-2 duration-300 flex items-center gap-3">
              <span className="text-lg">✓</span>
              <span>{toast}</span>
              <button 
                className="ml-4 text-white hover:text-gray-200 font-bold text-xl transition-colors duration-200" 
                onClick={() => setToast("")}
              >
                ×
              </button>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  );
}
