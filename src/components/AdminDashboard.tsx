import { useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { sendIncompleteReminders } from "@/lib/firebase/functions";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Download,
  Mail,
  Calendar,
} from "lucide-react";

interface DashboardData {
  totalUsers: number;
  totalPlans: number;
  totalDownloads: number;
  totalEmailsSent: number;
  recentSignups: { email: string; created_at: string }[];
  recentPlans: { name: string; user_email: string; created_at: string }[];
  recentDownloads: { plan_name: string; user_email: string; downloaded_at: string }[];
}

export const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return setIsAdmin(false);

      const userRef = doc(db, "profiles", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersSnap, plansSnap, downloadsSnap, emailsSnap] = await Promise.all([
        getCountFromServer(collection(db, "profiles")),
        getCountFromServer(collection(db, "business_plans")),
        getCountFromServer(collection(db, "plan_downloads")),
        getCountFromServer(collection(db, "email_notifications")),
      ]);

      const totalUsers = usersSnap.data().count;
      const totalPlans = plansSnap.data().count;
      const totalDownloads = downloadsSnap.data().count;
      const totalEmailsSent = emailsSnap.data().count;

      const recentSignupsSnap = await getDocs(
        query(collection(db, "profiles"), orderBy("created_at", "desc"), limit(5))
      );
      const recentSignups = recentSignupsSnap.docs.map((doc) => ({
        email: doc.data().email || "Unknown",
        created_at: doc.data().created_at,
      }));

      const recentPlansSnap = await getDocs(
        query(collection(db, "business_plans"), orderBy("created_at", "desc"), limit(5))
      );
      const recentPlansRaw = recentPlansSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { name: string; user_id: string; created_at: string }),
      }));

      const recentPlans = await Promise.all(
        recentPlansRaw.map(async (plan) => {
          const userDoc = await getDoc(doc(db, "profiles", plan.user_id));
          return {
            name: plan.name,
            user_email: userDoc.exists() ? userDoc.data().email : "Unknown",
            created_at: plan.created_at,
          };
        })
      );

      const recentDownloadsSnap = await getDocs(
        query(collection(db, "plan_downloads"), orderBy("downloaded_at", "desc"), limit(5))
      );
      const recentDownloadsRaw = recentDownloadsSnap.docs.map((doc) => doc.data());

      const recentDownloads = await Promise.all(
        recentDownloadsRaw.map(async (download: any) => {
          const userDoc = await getDoc(doc(db, "profiles", download.user_id));
          const planDoc = await getDoc(doc(db, "business_plans", download.plan_id));

          return {
            plan_name: planDoc.exists() ? planDoc.data().name : "Unknown Plan",
            user_email: userDoc.exists() ? userDoc.data().email : "Unknown",
            downloaded_at: download.downloaded_at,
          };
        })
      );

      setDashboardData({
        totalUsers,
        totalPlans,
        totalDownloads,
        totalEmailsSent,
        recentSignups,
        recentPlans,
        recentDownloads,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error loading dashboard",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-center">
          Access Denied. You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <Button onClick={() => sendIncompleteReminders()}>
          <Mail className="h-4 w-4 mr-2" />
          Send Plan Reminders
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Users", icon: <Users />, value: dashboardData?.totalUsers },
          { label: "Total Plans", icon: <FileText />, value: dashboardData?.totalPlans },
          { label: "Total Downloads", icon: <Download />, value: dashboardData?.totalDownloads },
          { label: "Emails Sent", icon: <Mail />, value: dashboardData?.totalEmailsSent },
        ].map((item, index) => (
          <Card key={index} className="shadow-md">
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Recent Signups",
            data: dashboardData?.recentSignups || [],
            render: (item: any) => (
              <div>
                <div className="text-sm font-medium">{item.email}</div>
                <div className="text-xs text-gray-500">
                  <Calendar className="inline-block h-3 w-3 mr-1" />
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            ),
          },
          {
            title: "Recent Plans",
            data: dashboardData?.recentPlans || [],
            render: (item: any) => (
              <div>
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">by {item.user_email}</div>
              </div>
            ),
          },
          {
            title: "Recent Downloads",
            data: dashboardData?.recentDownloads || [],
            render: (item: any) => (
              <div>
                <div className="text-sm font-medium">{item.plan_name}</div>
                <div className="text-xs text-gray-500">by {item.user_email}</div>
              </div>
            ),
          },
        ].map((section, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {section.data.map((item, index) => (
                  <li key={index} className="py-3">
                    {section.render(item)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
