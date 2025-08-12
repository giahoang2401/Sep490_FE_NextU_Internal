"use client";

import React from "react";
import { Globe, Users, MapPin, Settings, BarChart3 } from "lucide-react";
import Sidebar from "../shared/sidebar";
import TopNav from "../shared/topNav";
import type { User, NavigationItem } from "../types";

const navigation: NavigationItem[] = [
  {
    name: "System Overview",
    href: "/super-admin",
    icon: Globe,
    current: false,
  },
  { name: "Manage Admins", href: "/super-admin/admins", icon: Users, current: false },
  {
    name: "Location Management",
    href: "/super-admin/locations",
    icon: MapPin,
    current: true,
  },
  {
    name: "System Config",
    href: "/super-admin/config",
    icon: Settings,
    current: false,
  },
  {
    name: "Global Reports",
    href: "/super-admin/reports",
    icon: BarChart3,
    current: false,
  },
];

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