import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { httpsCallable, getFunctions } from "firebase/functions";
import { app } from "../lib/firebase/firebase"; // Adjust path if needed

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

export const PaymentModal = ({ isOpen, onClose, onSuccess, user }: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const functions = getFunctions(app);
  const verifyPayment = httpsCallable(functions, "verifyPayment");

  const paymentPlan = {
    id: "access",
    name: "Platform Access",
    price: 5000,
    currency: "NGN",
    description: "One-time payment for full platform access",
    features: [
      "Unlimited business plans",
      "AI-powered content suggestions",
      "Premium templates",
      "PDF export functionality",
      "Financial modeling tools",
      "Email support",
      "Lifetime access"
    ]
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const paystack = (window as any).PaystackPop.setup({
        key: "pk_test_d21dee0bbff6e6b77f6191a6c69e3be0b6a1c4a6", // Use your public key
        email: user.email,
        amount: paymentPlan.price * 100,
        currency: paymentPlan.currency,
        ref: `${Date.now()}_${user.id}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Payment Type",
              variable_name: "payment_type",
              value: "one_time_access"
            }
          ]
        },
        callback: async (response: any) => {
          console.log("Payment successful:", response);

          try {
            const result = await verifyPayment({
              reference: response.reference,
              plan_id: paymentPlan.id,
              amount: paymentPlan.price,
              currency: paymentPlan.currency
            });

            const data = result.data;

            if (data?.success) {
              toast({
                title: "Payment Successful!",
                description: "Your account has been activated. Welcome aboard!",
              });
              onSuccess();
            } else {
              throw new Error(data?.message || "Unknown verification error");
            }

          } catch (err: any) {
            console.error("Payment verification failed:", err);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support for assistance.",
              variant: "destructive",
            });
          }

          setLoading(false);
        },
        onClose: () => {
          console.log("Payment dialog closed");
          setLoading(false);
        }
      });

      paystack.openIframe();
    } catch (err: any) {
      console.error("Payment initialization failed:", err);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js"></script>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5" />
              Complete Your Registration
            </DialogTitle>
            <p className="text-gray-600">
              Make a one-time payment to access the business plan tool
            </p>
          </DialogHeader>

          <Card className="border-blue-500 ring-1 ring-blue-200">
            <CardHeader className="text-center pb-4">
              <Badge className="mx-auto mb-2 bg-blue-500">One-Time Payment</Badge>
              <CardTitle className="text-lg">{paymentPlan.name}</CardTitle>
              <div className="text-2xl font-bold text-blue-600">
                ₦{paymentPlan.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-500 block">One-time payment</span>
              </div>
              <CardDescription>{paymentPlan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-2 mb-6">
                {paymentPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Secure Payment
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Instant Access
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {loading ? "Processing..." : `Pay ₦${paymentPlan.price.toLocaleString()} with Paystack`}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By proceeding with payment, you agree to our Terms of Service and Privacy Policy.
                This is a one-time payment for lifetime access.
              </p>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
};
