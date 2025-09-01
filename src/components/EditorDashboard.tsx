
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Download, TrendingUp, MapPin, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditorAnalytics {
  total_users: number;
  total_plans: number;
  total_downloads: number;
  total_locations: number;
  total_industries: number;
  total_regions: number;
}

interface UserAnalytics {
  id: string;
  email: string;
  full_name: string;
  location: string;
  business_industry: string;
  total_plans: number;
  total_downloads: number;
}

export const EditorDashboard = () => {
  const [analytics, setAnalytics] = useState<EditorAnalytics | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch general analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics_summary')
        .select('*')
        .single();

      if (analyticsError) throw analyticsError;
      setAnalytics(analyticsData);

      // Fetch user analytics
      const { data: userAnalyticsData, error: userAnalyticsError } = await supabase
        .from('user_analytics')
        .select('*')
        .order('total_plans', { ascending: false })
        .limit(10);

      if (userAnalyticsError) throw userAnalyticsError;
      setUserAnalytics(userAnalyticsData || []);

    } catch (error: any) {
      console.error("Editor Dashboard Error:", error.message);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Editor Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Editor Dashboard</h1>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
            <p className="text-sm text-gray-500">Registered users on the platform</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans Generated</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_plans || 0}</div>
            <p className="text-sm text-gray-500">Business plans created</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_downloads || 0}</div>
            <p className="text-sm text-gray-500">Plans downloaded</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_locations || 0}</div>
            <p className="text-sm text-gray-500">Different user locations</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industries</CardTitle>
            <Building className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_industries || 0}</div>
            <p className="text-sm text-gray-500">Business industries represented</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regions</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_regions || 0}</div>
            <p className="text-sm text-gray-500">Global regions covered</p>
          </CardContent>
        </Card>
      </div>

      {/* User Analytics Table */}
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Top Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Location</th>
                  <th className="text-left p-3">Industry</th>
                  <th className="text-left p-3">Plans Created</th>
                  <th className="text-left p-3">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {userAnalytics.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {user.location}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{user.business_industry}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{user.total_plans}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{user.total_downloads}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
