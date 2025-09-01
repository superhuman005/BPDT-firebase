
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboard } from "@/components/AdminDashboard";
import { UserManagement } from "@/components/UserManagement";
import { PaymentTracking } from "@/components/PaymentTracking";
import { UserMigration } from "@/components/UserMigration";
import { AdminRoute } from "@/components/AdminRoute";

const Admin = () => {
  return (
    <AdminRoute>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="migration">Migration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="payments" className="mt-6">
            <PaymentTracking />
          </TabsContent>
          
          <TabsContent value="migration" className="mt-6">
            <UserMigration />
          </TabsContent>
        </Tabs>
      </div>
    </AdminRoute>
  );
};

export default Admin;
