import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Users, UserPlus, UsersIcon, MoreHorizontal, Shield, Edit, Activity, Trash2, Loader2 } from "lucide-react";
import { auth, db } from "../lib/firebase/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";

interface User {
  id: string;
  email: string;
  full_name: string;
  region: string;
  location: string;
  business_industry: string;
  created_at: string;
  total_plans: number;
  total_downloads: number;
  last_plan_activity: string;
}

interface UserAnalytics {
  total_users: number;
  total_plans: number;
  total_downloads: number;
  total_locations: number;
  total_industries: number;
  total_regions: number;
}

interface UserActivity {
  user_id: string;
  user_email: string;
  user_name: string;
  last_login: string;
  plans_created: number;
  plans_downloaded: number;
  last_activity: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [showUserActivity, setShowUserActivity] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [bulkCreateLoading, setBulkCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    fullName: "",
    location: "",
    businessIndustry: "",
    role: "user"
  });
  const [bulkEmails, setBulkEmails] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('user_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (analyticsError) throw analyticsError;
      setUsers(analyticsData || []);

      // Fetch analytics summary
      const { data: summaryData, error: summaryError } = await supabase
        .from('analytics_summary')
        .select('*')
        .single();

      if (summaryError) throw summaryError;
      setAnalytics(summaryData);

      // Fetch user activity data
      await fetchUserActivities();

    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async () => {
    try {
      // Get user activity data by combining profiles and business plans
      const { data: activityData, error } = await supabase
        .from('user_analytics')
        .select('*')
        .order('last_plan_activity', { ascending: false });

      if (error) throw error;

      const activities: UserActivity[] = activityData?.map(user => ({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || 'N/A',
        last_login: user.created_at,
        plans_created: user.total_plans,
        plans_downloaded: user.total_downloads,
        last_activity: user.last_plan_activity || user.created_at
      })) || [];

      setUserActivities(activities);
    } catch (error: any) {
      console.error("Failed to fetch user activities:", error);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreateUserLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to invite users",
          variant: "destructive",
        });
        return;
      }

      console.log('Sending invitation for:', newUser.email);

      const response = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: newUser.email,
          fullName: newUser.fullName,
          location: newUser.location,
          businessIndustry: newUser.businessIndustry,
          role: newUser.role
        }
      });

      console.log('Invitation response:', response);

      if (response.error) {
        console.error('Invitation error:', response.error);
        throw response.error;
      }

      if (response.data?.success) {
        toast({
          title: "Success",
          description: "User invitation sent successfully",
        });

        setNewUser({
          email: "",
          fullName: "",
          location: "",
          businessIndustry: "",
          role: "user"
        });
        setShowCreateUser(false);
        fetchData();
      } else {
        throw new Error(response.data?.message || 'Failed to send invitation');
      }
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send user invitation",
        variant: "destructive",
      });
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    const emails = bulkEmails.split('\n').filter(email => email.trim() !== '');
    
    if (emails.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setBulkCreateLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to invite users",
          variant: "destructive",
        });
        return;
      }

      let successCount = 0;
      let failedCount = 0;
      const results = [];

      for (const email of emails) {
        try {
          console.log(`Sending invitation to: ${email.trim()}`);
          
          const response = await supabase.functions.invoke('send-user-invitation', {
            body: {
              email: email.trim(),
              role: 'user'
            }
          });

          if (response.error || !response.data?.success) {
            throw response.error || new Error(response.data?.message || 'Failed to send invitation');
          }

          successCount++;
          results.push({ email: email.trim(), status: 'success' });
        } catch (error: any) {
          console.error(`Failed to invite ${email.trim()}:`, error);
          failedCount++;
          results.push({ email: email.trim(), status: 'failed', error: error.message });
        }
      }

      toast({
        title: "Bulk Invitation Completed",
        description: `Successfully invited ${successCount} users. ${failedCount > 0 ? `${failedCount} invitations failed.` : ''}`,
      });

      setBulkEmails("");
      setShowBulkCreate(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send bulk invitations",
        variant: "destructive",
      });
    } finally {
      setBulkCreateLoading(false);
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User promoted to admin",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      });
    }
  };

  const handleMakeEditor = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'editor'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User promoted to editor",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admins can delete users",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete user's business plans first
      const { error: plansError } = await supabase
        .from('business_plans')
        .delete()
        .eq('user_id', userId);

      if (plansError) throw plansError;

      // Delete user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Delete user roles
      const { error: rolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      // Delete main profile
      const { error: mainProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (mainProfileError) throw mainProfileError;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchData();
    } catch (error: any) {
      console.error("Delete user error:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <div className="flex space-x-4">
          <Dialog open={showUserActivity} onOpenChange={setShowUserActivity}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>User Activity</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>User Application Usage</DialogTitle>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plans Created</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userActivities.map((activity) => (
                      <TableRow key={activity.user_id}>
                        <TableCell className="font-medium">{activity.user_name}</TableCell>
                        <TableCell>{activity.user_email}</TableCell>
                        <TableCell>{activity.plans_created}</TableCell>
                        <TableCell>{activity.plans_downloaded}</TableCell>
                        <TableCell>{activity.last_activity ? new Date(activity.last_activity).toLocaleDateString() : 'Never'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Create User</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    disabled={createUserLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="John Doe"
                    disabled={createUserLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newUser.location}
                    onChange={(e) => setNewUser(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="New York, USA"
                    disabled={createUserLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="businessIndustry">Business Industry</Label>
                  <Input
                    id="businessIndustry"
                    value={newUser.businessIndustry}
                    onChange={(e) => setNewUser(prev => ({ ...prev, businessIndustry: e.target.value }))}
                    placeholder="Technology"
                    disabled={createUserLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                    disabled={createUserLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleCreateUser} 
                  className="w-full" 
                  disabled={createUserLoading}
                >
                  {createUserLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createUserLoading ? 'Sending Invitation...' : 'Create User'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showBulkCreate} onOpenChange={setShowBulkCreate}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4" />
                <span>Bulk Create</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Create Users</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulkEmails">Email Addresses (one per line)</Label>
                  <Textarea
                    id="bulkEmails"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                    rows={10}
                    disabled={bulkCreateLoading}
                  />
                </div>
                <Button 
                  onClick={handleBulkCreate} 
                  className="w-full"
                  disabled={bulkCreateLoading}
                >
                  {bulkCreateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {bulkCreateLoading ? 'Sending Invitations...' : 'Send Invitations'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_users || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_plans || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_downloads || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_locations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_industries || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total_regions || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Plans</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'Not provided'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.location || 'Not provided'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.business_industry || 'Not specified'}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{user.total_plans}</TableCell>
                  <TableCell className="text-center">{user.total_downloads}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem
                          onClick={() => handleMakeAdmin(user.id)}
                          className="cursor-pointer"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleMakeEditor(user.id)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Make Editor
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
