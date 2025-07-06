import { Home, GraduationCap, Lightbulb, MessageSquare, DoorOpen } from "lucide-react";
import type { NavigationItem } from "../types";
import Sidebar from "../shared/sidebar";

const navigation: NavigationItem[] = [
  { name: "NextLiving", href: "/staff-services", icon: Home },
  { name: "NextAcademy", href: "/staff-services/academy", icon: GraduationCap },
  { name: "Propose Activities", href: "/staff-services/activities", icon: Lightbulb },
  { name: "Member Feedback", href: "/staff-services/feedback", icon: MessageSquare },
  { name: "Room Management", href: "/staff-services/room", icon: DoorOpen },
];

export default function StaffServicesSidebar({ userRole = "Services Staff" }: { userRole?: string }) {
  return <Sidebar navigation={navigation} title="Next U" userRole={userRole} />;
} 