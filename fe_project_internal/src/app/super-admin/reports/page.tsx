import { TrendingUp, Users, MapPin } from "lucide-react";
import Sidebar from "@/components/Internal/shared/sidebar";
import TopNav from "@/components/Internal/shared/topNav";
import RoleLayout from "@/components/Internal/shared/roleLayout";
import { getSuperAdminNavigation } from "@/components/Internal/super-admin/superAdminNavigation";

const navigation = getSuperAdminNavigation("/super-admin/reports");

const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@nextu.com",
  role: "SuperAdmin",
  avatar: "/placeholder.svg?height=32&width=32",
};

export default function GlobalReportsPage() {
  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="SuperAdmin" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="Global Reports" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">12,543</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Active Locations</p>
                    <p className="text-2xl font-bold text-green-900">24</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-purple-900">+15%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">User Activity Report</h3>
                <p className="text-gray-600">Detailed user activity analytics and insights.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Location Performance</h3>
                <p className="text-gray-600">Performance metrics for all locations.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">System Health Report</h3>
                <p className="text-gray-600">Overall system performance and health metrics.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RoleLayout>
  );
}
