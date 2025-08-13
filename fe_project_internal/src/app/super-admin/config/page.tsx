import { getSuperAdminNavigation } from "@/components/Internal/super-admin/superAdminNavigation";
import Sidebar from "@/components/Internal/shared/sidebar";
import TopNav from "@/components/Internal/shared/topNav";
import RoleLayout from "@/components/Internal/shared/roleLayout";

const navigation = getSuperAdminNavigation("/super-admin/config");

const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@nextu.com",
  role: "SuperAdmin",
  avatar: "/placeholder.svg?height=32&width=32",
};

export default function SystemConfigPage() {
  return (
    <RoleLayout>
      <Sidebar navigation={navigation} title="Next U" userRole="SuperAdmin" />

      <div className="lg:pl-64 flex flex-col flex-1">
        <TopNav user={mockUser} title="System Configuration" />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Configuration</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">General Settings</h3>
                <p className="text-gray-600">System configuration options will be implemented here.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Security Settings</h3>
                <p className="text-gray-600">Security and authentication configuration options.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notification Settings</h3>
                <p className="text-gray-600">Email and notification preferences.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </RoleLayout>
  );
}
