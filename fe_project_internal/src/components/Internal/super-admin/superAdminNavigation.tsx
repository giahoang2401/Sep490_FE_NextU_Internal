import {
  Globe,
  Users,
  Settings,
  BarChart3,
  MapPin,
} from "lucide-react";
import type { NavigationItem } from "../types";

export const superAdminNavigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/super-admin",
    icon: Globe,
  },
  { 
    name: "Manage Admins", 
    href: "/super-admin/manage-admins", 
    icon: Users 
  },
  {
    name: "Location Management",
    href: "/super-admin/locations",
    icon: MapPin,
  },
  
];

// Helper function to set current page
export function getSuperAdminNavigation(currentPath: string): NavigationItem[] {
  return superAdminNavigation.map(item => ({
    ...item,
    current: item.href === currentPath,
  }));
}
