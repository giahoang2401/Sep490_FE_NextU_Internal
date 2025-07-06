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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <button className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl" onClick={onClose}>×</button>
        {children}
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
    floor: 1,
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
      setToast("Tạo thể loại phòng thành công!");
      setOptionForm({ roomTypeName: "", capacity: 1, pricePerNight: 0, description: "" });
      setShowOptionModal(false);
      fetchOptions();
    } catch (err: any) {
      setToast("Tạo thất bại: " + (err.response?.data?.message || err.message));
    }
  };
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/membership/RoomInstances", roomForm);
      setToast("Tạo phòng thành công!");
      setRoomForm({ accommodationOptionId: "", roomCode: "", roomName: "", descriptionDetails: "", floor: 1 });
      setShowRoomModal(false);
      fetchRooms();
    } catch (err: any) {
      setToast("Tạo thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  // Table columns
  const typeColumns: TableColumn[] = [
    { key: "roomTypeName", label: "Tên loại phòng" },
    { key: "capacity", label: "Sức chứa" },
    { key: "pricePerNight", label: "Giá/đêm" },
    { key: "description", label: "Mô tả" },
  ];
  const roomColumns: TableColumn[] = [
    { key: "roomName", label: "Tên phòng" },
    { key: "roomCode", label: "Mã phòng" },
    { key: "type", label: "Thể loại" },
    { key: "capacity", label: "Sức chứa" },
    { key: "floor", label: "Tầng" },
    { key: "descriptionDetails", label: "Mô tả" },
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
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Room Management" />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="Tổng số phòng" value={totalRooms} icon={() => <span>🏠</span>} />
            <DashboardCard title="Loại phòng" value={totalTypes} icon={() => <span>📦</span>} />
            <DashboardCard title="Tổng sức chứa" value={totalCapacity} icon={() => <span>👥</span>} />
          </div>
          {/* Loại phòng */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Danh sách loại phòng</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium" onClick={() => setShowOptionModal(true)}>
                + Thêm loại phòng
              </button>
            </div>
            <DataTable columns={typeColumns} data={typeRows} />
          </div>
          {/* Phòng */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Danh sách phòng</h3>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium" onClick={() => setShowRoomModal(true)}>
                + Thêm phòng
              </button>
            </div>
            <DataTable columns={roomColumns} data={roomRows} />
          </div>
          {/* Modal thêm loại phòng */}
          <Modal open={showOptionModal} title="Thêm loại phòng" onClose={() => setShowOptionModal(false)}>
            <form className="space-y-4" onSubmit={handleCreateOption}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng</label>
                <input type="text" required placeholder="Tên loại phòng" className="w-full border rounded px-3 py-2" value={optionForm.roomTypeName} onChange={e => setOptionForm(f => ({ ...f, roomTypeName: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                <input type="number" min={1} required placeholder="Sức chứa" className="w-full border rounded px-3 py-2" value={optionForm.capacity} onChange={e => setOptionForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá mỗi đêm</label>
                <input type="number" min={0} required placeholder="Giá mỗi đêm" className="w-full border rounded px-3 py-2" value={optionForm.pricePerNight} onChange={e => setOptionForm(f => ({ ...f, pricePerNight: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input type="text" placeholder="Mô tả" className="w-full border rounded px-3 py-2" value={optionForm.description} onChange={e => setOptionForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 font-medium">Tạo loại phòng</button>
            </form>
          </Modal>
          {/* Modal thêm phòng */}
          <Modal open={showRoomModal} title="Thêm phòng mới" onClose={() => setShowRoomModal(false)}>
            <form className="space-y-4" onSubmit={handleCreateRoom}>
              <select required className="w-full border rounded px-3 py-2" value={roomForm.accommodationOptionId} onChange={e => setRoomForm(f => ({ ...f, accommodationOptionId: e.target.value }))}>
                <option value="">-- Chọn loại phòng --</option>
                {options.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.roomTypeName}</option>
                ))}
              </select>
              <input type="text" required placeholder="Mã phòng" className="w-full border rounded px-3 py-2" value={roomForm.roomCode} onChange={e => setRoomForm(f => ({ ...f, roomCode: e.target.value }))} />
              <input type="text" required placeholder="Tên phòng" className="w-full border rounded px-3 py-2" value={roomForm.roomName} onChange={e => setRoomForm(f => ({ ...f, roomName: e.target.value }))} />
              <input type="text" placeholder="Mô tả chi tiết" className="w-full border rounded px-3 py-2" value={roomForm.descriptionDetails} onChange={e => setRoomForm(f => ({ ...f, descriptionDetails: e.target.value }))} />
              <input type="number" min={1} required placeholder="Tầng" className="w-full border rounded px-3 py-2" value={roomForm.floor} onChange={e => setRoomForm(f => ({ ...f, floor: Number(e.target.value) }))} />
              <button type="submit" className="w-full bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 font-medium">Tạo phòng</button>
            </form>
          </Modal>
          {/* Toast */}
          {toast && (
            <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
              {toast}
              <button className="ml-4 text-white font-bold" onClick={() => setToast("")}>×</button>
            </div>
          )}
        </main>
      </div>
    </RoleLayout>
  );
} 