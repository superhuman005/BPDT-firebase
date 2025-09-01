import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { auth, db } from "../lib/firebase";
import { collection, getDocs, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Users, TrendingUp, DollarSign } from "lucide-react";

interface PaymentData {
  id: string;
  user_id: string;
  subscription_type: string;
  status: string;
  amount: number | null;
  currency: string | null;
  payment_reference: string | null;
  created_at: string;
  user_email: string | null;
  user_name: string | null;
}

interface PaymentStats {
  total_payments: number;
  total_revenue: number;
  active_subscriptions: number;
  pending_payments: number;
}

export const PaymentTracking = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      
      // Fetch payment data with user information using a direct join
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          profiles!inner(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        console.error('Failed to fetch payment data:', paymentsError);
        // Try alternative query without the problematic join
        const { data: altPaymentsData, error: altError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .order('created_at', { ascending: false });

        if (altError) throw altError;

        // Get user info separately
        const userIds = altPaymentsData?.map(p => p.user_id) || [];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

        const formattedPayments: PaymentData[] = altPaymentsData?.map(payment => {
          const profile = profilesMap.get(payment.user_id);
          return {
            id: payment.id,
            user_id: payment.user_id,
            subscription_type: payment.subscription_type,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            payment_reference: payment.payment_reference,
            created_at: payment.created_at,
            user_email: profile?.email || 'Unknown',
            user_name: profile?.full_name || 'Unknown'
          };
        }) || [];

        setPayments(formattedPayments);
      } else {
        const formattedPayments: PaymentData[] = paymentsData?.map(payment => ({
          id: payment.id,
          user_id: payment.user_id,
          subscription_type: payment.subscription_type,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          payment_reference: payment.payment_reference,
          created_at: payment.created_at,
          user_email: payment.profiles?.email || 'Unknown',
          user_name: payment.profiles?.full_name || 'Unknown'
        })) || [];

        setPayments(formattedPayments);
      }

      // Calculate stats
      const totalPayments = payments.length;
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const activeSubscriptions = payments.filter(p => p.status === 'active').length;
      const pendingPayments = payments.filter(p => p.status === 'pending').length;

      setStats({
        total_payments: totalPayments,
        total_revenue: totalRevenue,
        active_subscriptions: activeSubscriptions,
        pending_payments: pendingPayments
      });

    } catch (error: any) {
      console.error("Failed to fetch payment data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Payment Tracking</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_payments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.total_revenue || 0, 'NGN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active_subscriptions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_payments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.user_name || 'Unknown'}
                  </TableCell>
                  <TableCell>{payment.user_email || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {payment.subscription_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {payment.payment_reference || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {payments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No payment data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
