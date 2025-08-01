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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-6 my-16 p-8 relative animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-3xl font-light absolute top-6 right-8" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="pt-6">{children}</div>
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

interface RoomInstance {
  id: string;
  accommodationOptionId: string;
  roomCode: string;
  roomName: string;
  descriptionDetails: string;
  floor: number;
  addOnFee?: number | string;
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
  const [roomDetail, setRoomDetail] = useState<any>(null);
  const [nextUServices, setNextUServices] = useState<{ id: string; name: string }[]>([]);

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
    try {
      const res = await api.get(`/api/membership/RoomInstances/${roomId}`);
      setRoomDetail(res.data);
    } catch (err) {
      setRoomDetail(null);
    } finally {
      setDetailLoading(false);
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
          <Modal open={showDetailModal} title="Room Details" onClose={() => setShowDetailModal(false)}>
            {detailLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : roomDetail ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div><b>City:</b> {roomDetail.cityName}</div>
                <div><b>Location:</b> {roomDetail.locationName}</div>
                <div><b>Property:</b> {roomDetail.propertyName}</div>
                <div><b>Room Name:</b> {roomDetail.roomName}</div>
                <div><b>Room Code:</b> {roomDetail.roomCode}</div>
                <div><b>Type:</b> {roomDetail.roomTypeName}</div>
                <div><b>Status:</b> {roomDetail.status}</div>
                <div><b>Area (m²):</b> {roomDetail.areaInSquareMeters}</div>
                <div><b>Room Size:</b> {roomDetail.roomSizeName}</div>
                <div><b>Room View:</b> {roomDetail.roomViewName}</div>
                <div><b>Room Floor:</b> {roomDetail.roomFloorName}</div>
                <div><b>Bed Type:</b> {roomDetail.bedTypeName}</div>
                <div><b>Number of Beds:</b> {roomDetail.numberOfBeds}</div>
               
                <div className="md:col-span-2"><b>Description:</b> {roomDetail.descriptionDetails}</div>
                <div><b>Add-on Fee:</b> {roomDetail.addOnFee ? Number(roomDetail.addOnFee).toLocaleString() + ' VND' : '-'}</div>
                <div><b>Type Price:</b> {getTypePrice(roomDetail.accommodationOptionId)}</div>
                <div className="md:col-span-2 font-semibold text-blue-700"><b>Price/Night:</b> {(() => {
                  const typePrice = options.find(o => o.id === roomDetail.accommodationOptionId)?.pricePerNight || 0;
                  const addOn = Number(roomDetail.addOnFee) || 0;
                  return (typePrice + addOn).toLocaleString() + ' VND';
                })()}</div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-500">Failed to load room details.</div>
            )}
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