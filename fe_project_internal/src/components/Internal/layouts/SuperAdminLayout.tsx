"use client";

import React from "react";
import { getSuperAdminNavigation } from "../super-admin/superAdminNavigation";
import Sidebar from "../shared/sidebar";
import TopNav from "../shared/topNav";
import type { User } from "../types";

const navigation = getSuperAdminNavigation("/super-admin/locations");

const mockUser: User = {
  id: "1",
  name: "John Doe",
  email: "john@nextu.com",
  role: "SuperAdmin",
  avatar: "/placeholder.svg?height=32&width=32",
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar navigation={navigation} title="Next U" userRole="SuperAdmin" />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Location Management" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 