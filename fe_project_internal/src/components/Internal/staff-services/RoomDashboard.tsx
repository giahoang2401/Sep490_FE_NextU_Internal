"use client"
import React, { useEffect, useState } from "react";
import StaffServicesSidebar from "./StaffServicesSidebar";
import TopNav from "../shared/topNav";
import RoleLayout from "../shared/roleLayout";
import DashboardCard from "../shared/dashboardCard";
import DataTable from "../shared/dataTable";
import api from "../../../../utils/axiosConfig";
import type { User, TableColumn } from "../types";

function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 relative animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl font-light" 
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

const mockUser: User = {
  id: "5",
  name: "Carlos Martinez",
  email: "carlos@nextu.com",
  role: "Staff_Services",
  location: "San Francisco, CA",
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
}

export default function RoomDashboard() {
  // State
  const [options, setOptions] = useState<AccommodationOption[]>([]);
  const [rooms, setRooms] = useState<RoomInstance[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [optionForm, setOptionForm] = useState({
    roomTypeName: "",
    capacity: 1,
    pricePerNight: 0,
    description: "",
  });
  const [roomForm, setRoomForm] = useState({
    accommodationOptionId: "",
    roomCode: "",
    roomName: "",
    descriptionDetails: "",
    floor: "",
  });
  const [toast, setToast] = useState("");

  // Fetch data
  useEffect(() => {
    fetchOptions();
    fetchRooms();
  }, []);

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

  // Create
  const handleCreateOption = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/membership/AccommodationOptions", optionForm);
      setToast("Room type created successfully!");
      setOptionForm({ roomTypeName: "", capacity: 1, pricePerNight: 0, description: "" });
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
        floor: parseInt(roomForm.floor) || 1
      };
      await api.post("/api/membership/RoomInstances", roomData);
      setToast("Room created successfully!");
      setRoomForm({ accommodationOptionId: "", roomCode: "", roomName: "", descriptionDetails: "", floor: "" });
      setShowRoomModal(false);
      fetchRooms();
    } catch (err: any) {
      setToast("Creation failed: " + (err.response?.data?.message || err.message));
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
    { key: "capacity", label: "Capacity" },
    { key: "floor", label: "Floor" },
    { key: "descriptionDetails", label: "Description" },
  ];
  
  // DataTable data mapping
  const typeRows = options.map(opt => ({ ...opt }));
  const roomRows = rooms.map(room => {
    const opt = options.find(o => o.id === room.accommodationOptionId);
    return {
      ...room,
      type: opt?.roomTypeName || "-",
      capacity: opt?.capacity || "-",
    };
  });

  // Dashboard cards
  const totalRooms = rooms.length;
  const totalTypes = options.length;
  const totalCapacity = options.reduce((sum, o) => sum + (o.capacity || 0), 0);

  return (
    <RoleLayout>
      <StaffServicesSidebar />
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
              <DataTable columns={roomColumns} data={roomRows} />
            </div>
          </div>

          {/* Add Room Type Modal */}
          <Modal open={showOptionModal} title="Add New Room Type" onClose={() => setShowOptionModal(false)}>
            <form className="space-y-6" onSubmit={handleCreateOption}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter room type name..." 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={optionForm.roomTypeName} 
                  onChange={e => setOptionForm(f => ({ ...f, roomTypeName: e.target.value }))} 
                />
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Floor *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., 1, 2, Ground..." 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200" 
                    value={roomForm.floor} 
                    onChange={e => setRoomForm(f => ({ ...f, floor: e.target.value }))} 
                  />
                </div>
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