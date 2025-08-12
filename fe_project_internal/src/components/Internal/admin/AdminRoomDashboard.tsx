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

function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
      <div className="bg-white shadow-2xl w-full max-w-6xl max-h-[98vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl font-light hover:bg-gray-100 w-8 h-8 flex items-center justify-center" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(98vh-80px)]">{children}</div>
      </div>
    </div>
  );
}

const mockUser: User = {
  id: "2",
  name: "Jane Smith", 
  email: "jane@nextu.com",
  role: "Admin",
  location: "San Francisco, CA",
  region: "West Coast",
  avatar: "/placeholder.svg?height=32&width=32",
};

interface AccommodationOption {
  id: string;
  roomTypeId: number;
  roomTypeName: string;
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
  const [nextUServices, setNextUServices] = useState<{ id: string; name: string }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Image upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    description: "",
    type: "image"
  });
  const [uploading, setUploading] = useState(false);
  
  // Drag state for image gallery
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);

  // Fetch data
  useEffect(() => {
    fetchOptions();
    fetchRooms();
    fetchRoomSelectOptions();
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

  // Lấy danh sách NextUServices khi mở modal tạo Room Type
  useEffect(() => {
    if (showOptionModal) {
      api.get('/api/membership/NextUServices').then(res => {
        setNextUServices(res.data.map((s: any) => ({ id: s.id, name: s.name })));
      }).catch(() => setNextUServices([]));
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

  // Create
  const handleCreateOption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/membership/AccommodationOptions", {
        ...optionForm,
        propertyId: propertyId,
        roomTypeId: Number(optionForm.roomTypeId),
        nextUServiceId: optionForm.nextUServiceId,
        capacity: Number(optionForm.capacity),
        pricePerNight: Number(optionForm.pricePerNight),
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
    if (!uploadForm.file || !roomDetail) {
      setToast('Please select an image file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('File', uploadForm.file);
      formData.append('ActorType', '3'); // Fixed value for rooms
      formData.append('ActorId', roomDetail.id);
      formData.append('Description', uploadForm.description);
      formData.append('Type', uploadForm.type);

      await api.post('/api/Media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setToast('Image uploaded successfully!');
      setUploadForm({ file: null, description: "", type: "image" });
      setShowUploadModal(false);
      
      // Refresh room details to show new image
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
      <Sidebar navigation={navigation} title="Next U" userRole="Regional Admin" />
      <div className="lg:pl-64 flex flex-col flex-1 bg-gray-50 min-h-screen">
        <TopNav user={mockUser} title="Room Management" />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
            <p className="text-gray-600">Manage room types and rooms in the system</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard 
              title="Total Rooms" 
              value={totalRooms} 
              icon={() => <span className="text-2xl">🏠</span>} 
            />
            <DashboardCard 
              title="Room Types" 
              value={totalTypes} 
              icon={() => <span className="text-2xl">📦</span>} 
            />
            <DashboardCard 
              title="Total Capacity" 
              value={totalCapacity} 
              icon={() => <span className="text-2xl">👥</span>} 
            />
          </div>

          {/* Room Types */}
          <div className="bg-white shadow-lg rounded-xl mb-8 overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Room Types List</h3>
                  <p className="text-gray-600 text-sm mt-1">Manage different room types</p>
                </div>
                <button 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2" 
                  onClick={() => setShowOptionModal(true)}
                >
                  <span className="text-lg">+</span>
                  Add Room Type
                </button>
              </div>
            </div>
            <div className="overflow-hidden">
              <DataTable columns={typeColumns} data={typeRows} />
            </div>
          </div>

          {/* Rooms */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Rooms List</h3>
                  <p className="text-gray-600 text-sm mt-1">Manage specific rooms</p>
                </div>
                <button 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2" 
                  onClick={() => setShowRoomModal(true)}
                >
                  <span className="text-lg">+</span>
                  Add Room
                </button>
              </div>
            </div>
            <div className="overflow-hidden">
              <DataTable columns={roomColumns} data={roomRows.map((row, idx) => ({...row, _roomId: rooms[idx].id}))} onRowClick={row => handleRowClick(row._roomId)} />
            </div>
          </div>

          {/* Add Room Type Modal */}
          <Modal open={showOptionModal} title="Add New Room Type" onClose={() => setShowOptionModal(false)}>
            <form className="space-y-6" onSubmit={handleCreateOption}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter room type name..." 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={optionForm.roomTypeName} 
                  onChange={e => setOptionForm(f => ({ ...f, roomTypeName: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type ID *</label>
                <input
                  type="number"
                  required
                  placeholder="Enter room type id..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={optionForm.roomTypeId}
                  onChange={e => setOptionForm(f => ({ ...f, roomTypeId: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">NextU Service *</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  value={optionForm.nextUServiceId}
                  onChange={e => setOptionForm(f => ({ ...f, nextUServiceId: e.target.value }))}
                >
                  <option value="">-- Select NextU Service --</option>
                  {nextUServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity *</label>
                  <input 
                    type="number" 
                    min={1} 
                    required 
                    placeholder="Number of people" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                    value={optionForm.capacity} 
                    onChange={e => setOptionForm(f => ({ ...f, capacity: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Night *</label>
                  <input 
                    type="number" 
                    min={0} 
                    required 
                    placeholder="USD" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                    value={optionForm.pricePerNight} 
                    onChange={e => setOptionForm(f => ({ ...f, pricePerNight: Number(e.target.value) }))} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  placeholder="Detailed description of the room type..." 
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none" 
                  value={optionForm.description} 
                  onChange={e => setOptionForm(f => ({ ...f, description: e.target.value }))} 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-3 hover:bg-gray-200 font-medium transition-all duration-200" 
                  onClick={() => setShowOptionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 font-medium transition-all duration-200 shadow-md"
                >
                  Create Room Type
                </button>
              </div>
            </form>
          </Modal>

          {/* Add Room Modal */}
          <Modal open={showRoomModal} title="Add New Room" onClose={() => setShowRoomModal(false)}>
            <form className="space-y-6" onSubmit={handleCreateRoom}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
                    value={roomForm.accommodationOptionId} 
                    onChange={e => setRoomForm(f => ({ ...f, accommodationOptionId: e.target.value }))}
                  >
                    <option value="">-- Select Room Type --</option>
                    {options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.roomTypeName}</option>
                    ))}
                  </select>
                  {/* Hiển thị giá theo đêm nếu đã chọn Room Type */}
                  {roomForm.accommodationOptionId && (() => {
                    const selected = options.find(opt => opt.id === roomForm.accommodationOptionId);
                    if (!selected) return null;
                    return (
                      <div className="mt-2 text-sm text-gray-500">Price per night: <span className="font-semibold text-green-700">{selected.pricePerNight?.toLocaleString()} VND</span></div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Code *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., A101" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.roomCode} 
                    onChange={e => setRoomForm(f => ({ ...f, roomCode: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter room name..." 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.roomName} 
                    onChange={e => setRoomForm(f => ({ ...f, roomName: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Area (m²) *</label>
                  <input 
                    type="number" 
                    min={0} 
                    required 
                    placeholder="e.g., 80" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.areaInSquareMeters} 
                    onChange={e => setRoomForm(f => ({ ...f, areaInSquareMeters: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Size *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room View *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Room Floor *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bed Type *</label>
                  <select 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white" 
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Beds *</label>
                  <input 
                    type="number" 
                    min={0} 
                    required 
                    placeholder="e.g., 2" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.numberOfBeds} 
                    onChange={e => setRoomForm(f => ({ ...f, numberOfBeds: Number(e.target.value) }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Add-on Fee</label>
                  <input 
                    type="text"
                    placeholder="e.g., 20000 or Negotiable"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.addOnFee}
                    onChange={e => setRoomForm(f => ({ ...f, addOnFee: e.target.value }))}
                  />
                  {/* Show add-on fee per night */}
                  {roomForm.addOnFee && (
                    <div className="mt-2 text-sm text-green-700">
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
                      <div className="mt-2 text-sm text-blue-700 font-semibold">
                        Final price per night: {finalPrice.toLocaleString()} VND
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Detailed Description</label>
                <textarea 
                  placeholder="Detailed description of the room..." 
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none" 
                  value={roomForm.descriptionDetails} 
                  onChange={e => setRoomForm(f => ({ ...f, descriptionDetails: e.target.value }))} 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-3 hover:bg-gray-200 font-medium transition-all duration-200" 
                  onClick={() => setShowRoomModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-green-600 text-white rounded-lg px-4 py-3 hover:bg-green-700 font-medium transition-all duration-200 shadow-md"
                >
                  Create Room
                </button>
              </div>
            </form>
          </Modal>

          {/* Room Detail Modal */}
          <Modal open={showDetailModal} title={`Room ${roomDetail?.roomTypeName || 'Details'}`} onClose={() => setShowDetailModal(false)}>
            {detailLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading room details...</p>
              </div>
            ) : roomDetail ? (
                             <div className="flex h-[calc(98vh-80px)]">
                {/* Left Column - Fixed Image Gallery */}
                <div className="w-1/2 p-8 pr-4 flex flex-col">
                  {roomDetail.medias && roomDetail.medias.length > 0 ? (
                    <div className="space-y-4">
                                                                    {/* Main Image Display with Drag Support */}
                        <div className="relative">
                          <div 
                            className="aspect-[4/3] overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
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
                                    alt={media.description || `Room image ${index + 1}`}
                                    className="h-full w-full object-cover"
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
                               className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 shadow-lg transition-all duration-200 hover:scale-110"
                             >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                               </svg>
                             </button>
                             <button 
                               onClick={nextImage}
                               className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 shadow-lg transition-all duration-200 hover:scale-110"
                             >
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                               </svg>
                             </button>
                           </>
                         )}
                         
                         {/* Image Counter */}
                         {roomDetail.medias.length > 1 && (
                           <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1">
                             {currentImageIndex + 1}/{roomDetail.medias.length}
                           </div>
                         )}
                       </div>

                                             {/* Thumbnail Navigation */}
                       {roomDetail.medias.length > 1 && (
                         <div className="flex space-x-2 overflow-x-auto pb-2">
                           {roomDetail.medias.slice(0, 4).map((media: Media, index: number) => (
                             <div key={media.id} className="flex-shrink-0">
                               <div 
                                 onClick={() => goToImage(index)}
                                 className={`w-16 h-12 overflow-hidden border-2 transition-all duration-300 ease-in-out cursor-pointer transform hover:scale-105 ${
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
                             <div className="flex-shrink-0 w-16 h-12 bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">
                               +{roomDetail.medias.length - 4}
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300">
                      <div className="text-gray-400 mb-3">
                        <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No images available for this room</p>
                    </div>
                  )}

                  {/* Upload Image Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload New Image
                    </button>
                  </div>
                </div>

                {/* Right Column - Content & Fixed Pricing */}
                <div className="w-1/2 flex flex-col">
                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto p-8 pl-4">
                    {/* Room Header - Horizontal Layout */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{roomDetail.roomName}</h2>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium ${
                          roomDetail.status === 'Available' ? 'bg-green-100 text-green-800' : 
                          roomDetail.status === 'Occupied' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {roomDetail.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{roomDetail.roomTypeName}</p>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="border-b border-gray-200 mb-6"></div>

                    {/* Description - Moved to top with larger text */}
                    {roomDetail.descriptionDetails && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                        <div className="bg-gray-50 p-4">
                          <p className="text-gray-700 leading-relaxed text-base">{roomDetail.descriptionDetails}</p>
                        </div>
                      </div>
                    )}

                    {/* Horizontal Divider */}
                    <div className="border-b border-gray-200 mb-6"></div>

                    {/* Quick Details */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50">
                        <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Bed Type</p>
                          <p className="text-sm font-medium text-gray-900">{roomDetail.bedTypeName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50">
                        <div className="w-8 h-8 bg-green-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-sm font-medium text-gray-900">{roomDetail.numberOfBeds} people</p>
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="border-b border-gray-200 mb-6"></div>

                    {/* Room Specifications - Restructured */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Room Specifications</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
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
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Bed Type:</span>
                          <span className="font-medium text-gray-900">{roomDetail.bedTypeName}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-600">Number of Beds:</span>
                          <span className="font-medium text-gray-900">{roomDetail.numberOfBeds}</span>
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Divider */}
                    <div className="border-b border-gray-200 mb-6"></div>

                    {/* Location */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Location</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500"></div>
                          <span className="text-gray-600">City:</span>
                          <span className="font-medium text-gray-900">{roomDetail.cityName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-500"></div>
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium text-gray-900">{roomDetail.locationName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-purple-500"></div>
                          <span className="text-gray-600">Property:</span>
                          <span className="font-medium text-gray-900">{roomDetail.propertyName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fixed Pricing Section at Bottom */}
                  <div className="border-t border-gray-200 p-8 pl-4 bg-gray-50 flex-shrink-0">
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-900">Pricing Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Base Price:</span>
                          <span className="font-medium text-gray-900">{getTypePrice(roomDetail.accommodationOptionId)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Add-on Fee:</span>
                          <span className="font-medium text-gray-900">
                            {Number(roomDetail.addOnFee).toLocaleString()} VND
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-300">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total Price</span>
                            <div className="text-right">
                              <span className="text-2xl font-bold text-orange-600">
                                {(() => {
                                  const typePrice = options.find(o => o.id === roomDetail.accommodationOptionId)?.pricePerNight || 0;
                                  const addOn = Number(roomDetail.addOnFee) || 0;
                                  return (typePrice + addOn).toLocaleString();
                                })()}
                              </span>
                              <span className="text-lg text-orange-600"> VND / Night</span>
                              <p className="text-xs text-gray-500">Tax and fees included</p>
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
                <p className="text-red-500 font-medium">Failed to load room details.</p>
                <p className="text-gray-500 text-sm mt-1">Please try again later.</p>
              </div>
            )}
          </Modal>

          {/* Image Upload Modal */}
          <Modal open={showUploadModal} title="Upload Room Image" onClose={() => setShowUploadModal(false)}>
            <div className="max-w-6xl mx-auto">
              <form className="space-y-6" onSubmit={handleImageUpload}>
                {/* Main Content - Horizontal Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left Column - File Upload & Preview */}
                  <div className="space-y-6">
                    {/* File Upload Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload New Image</h3>
                        <p className="text-sm text-gray-600">Select an image file to upload</p>
                      </div>

                      <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all duration-300 hover:bg-blue-50/50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadForm(prev => ({ ...prev, file }));
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer block">
                          {uploadForm.file ? (
                            <div className="space-y-4">
                              {/* Compact Image Preview */}
                              <div className="relative">
                                <div className="w-full max-w-sm mx-auto">
                                  <img
                                    src={URL.createObjectURL(uploadForm.file)}
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded-xl border-2 border-blue-200 shadow-lg"
                                    onLoad={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onload = null;
                                    }}
                                  />
                                  {/* Success Badge */}
                                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Compact File Info */}
                              <div className="bg-white rounded-lg px-3 py-2 border border-blue-200 inline-block">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-32">{uploadForm.file.name}</p>
                                    <p className="text-xs text-gray-500">{(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-xs text-blue-600 font-medium">✓ File selected successfully</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-base font-semibold text-gray-900 mb-1">Drop your image here</p>
                                <p className="text-sm text-gray-600 mb-3">or click to browse files</p>
                                <div className="inline-flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-blue-200 text-xs text-gray-600">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span>PNG, JPG, JPEG up to 10MB</span>
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
                          <span className="text-blue-700 font-medium">Max Size:</span>
                          <span className="text-blue-800 font-medium">10 MB</span>
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
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <input
                            type="text"
                            placeholder="Enter a detailed description..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                            value={uploadForm.description}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                          />
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
                        onClick={() => setShowUploadModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!uploadForm.file || uploading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-6 py-4 hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Image
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