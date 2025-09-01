
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PasswordResetModal } from "@/components/PasswordResetModal";
import { PaymentModal } from "@/components/PaymentModal";

interface AuthProps {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const Auth = ({
  logoUrl = "https://msmehub.org/wp-content/uploads/2025/06/cropped-msme_logo-1.png",
  primaryColor = "#a43579",
  secondaryColor = "#364693",
}: AuthProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [signupDisabled, setSignupDisabled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const checkUserExistsInDatabase = async (email: string) => {
    try {
      // Check if user exists in the legacy users table
      const { data: legacyUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (legacyUser) {
        return { exists: true, isLegacy: true };
      }

      // Check if user exists in profiles table (migrated users)
      const { data: profileUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (profileUser) {
        return { exists: true, isLegacy: false };
      }

      return { exists: false, isLegacy: false };
    } catch (error) {
      return { exists: false, isLegacy: false };
    }
  };

  const createUserInAuth = async (email: string, fullName?: string) => {
    try {
      // Generate a temporary password
      const tempPassword = `temp_${Math.random().toString(36).substring(2, 15)}`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName || '',
            requires_password_reset: true
          }
        }
      });

      if (error) throw error;
      return { user: data.user, tempPassword };
    } catch (error) {
      console.error('Error creating user in auth:', error);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) throw error;
      
      toast({
        title: "Password Reset Sent",
        description: "Please check your email for password reset instructions to set up your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // First, check if user exists in our database
      const { exists, isLegacy } = await checkUserExistsInDatabase(email);
      
      if (exists) {
        // Try to sign in first
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (signInError) {
          if (signInError.message.includes("Invalid login credentials") || 
              signInError.message.includes("Email not confirmed")) {
            
            // User exists in database but not in auth or needs password reset
            try {
              // Create user in Supabase Auth if they don't exist there
              await createUserInAuth(email);
              
              // Send password reset email
              await sendPasswordResetEmail(email);
              
              toast({
                title: "Account Setup Required",
                description: "We found your account! Please check your email to set up your password and complete login.",
              });
            } catch (createError: any) {
              if (createError.message.includes("User already registered")) {
                // User exists in auth, just send password reset
                await sendPasswordResetEmail(email);
              } else {
                throw createError;
              }
            }
          } else {
            throw signInError;
          }
        }
      } else {
        // User doesn't exist in database
        toast({
          title: "Account Not Found",
          description: "No account found with this email address. Please contact support or sign up for a new account.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First check if user already exists in auth.users
      const { data: existingUser } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        if (error.message.includes("Signups not allowed")) {
          setSignupDisabled(true);
          toast({
            title: "Registration Currently Limited",
            description: "New registrations are currently limited. Please contact support for access.",
            variant: "destructive",
          });
        } else if (error.message.includes("User already registered")) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setActiveTab("signin");
        } else if (error.message.includes("Database error saving new user")) {
          // Handle the specific database constraint error
          console.error('Database constraint error during signup:', error);
          toast({
            title: "Registration Error", 
            description: "There was an issue creating your account. Please try again or contact support if the problem persists.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else if (data.user) {
        console.log('User created successfully:', data.user.email);
        
        // Check if user was invited by admin
        const { data: inviteData } = await supabase
          .from('admin_user_invites')
          .select('*')
          .eq('email', email)
          .single();

        if (inviteData) {
          // Admin-invited user, bypass payment
          toast({
            title: "Account Created",
            description: "Welcome! Your account has been activated by an administrator.",
          });
          
          // Trigger the verification process to set up the account
          try {
            await supabase.functions.invoke('verify-payment', {
              body: {} // Empty body since we're bypassing payment
            });
          } catch (verifyError) {
            console.log('Verification process initiated for admin user');
          }
          
          navigate("/");
        } else {
          // Regular user, require payment
          setPendingUser(data.user);
          setShowPaymentModal(true);
          toast({
            title: "Account Created",
            description: "Please complete your payment to access the platform.",
          });
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast({
      title: "Payment Successful",
      description: "Welcome! Your account is now active.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-16 relative z-10">
        <div className="max-w-md w-full mx-auto">
          <Card className="bg-white shadow-xl rounded-2xl border" style={{ borderColor: `${primaryColor}33` }}>
            <CardHeader className="text-center">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-24 h-24 mx-auto mb-4 object-contain rounded-xl shadow-md"
              />

              <CardTitle
                className="text-3xl font-bold flex items-center justify-center gap-2"
                style={{ color: secondaryColor }}
              >
                <FileText className="w-5 h-5" style={{ color: secondaryColor }} />
                Business Plan Tool
              </CardTitle>
              <CardDescription style={{ color: `${secondaryColor}CC` }}>
                Create professional business plans with AI assistance
              </CardDescription>
            </CardHeader>

            <CardContent>
              {signupDisabled && (
                <Alert className="mb-4 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    New user registration is currently limited. Please contact support at support@example.com for access or try signing in if you already have an account.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" disabled={signupDisabled}>
                    Sign Up {signupDisabled && "(Limited)"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-6 mt-6">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div>
                      <Label htmlFor="signin-email" className="flex items-center gap-2" style={{ color: secondaryColor }}>
                        <Mail className="w-4 h-4" /> Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="mt-1 h-11"
                        style={{ borderColor: `${primaryColor}55` }}
                        required
                      />
                    </div>

                    <div className="relative">
                      <Label htmlFor="signin-password" className="flex items-center gap-2" style={{ color: secondaryColor }}>
                        <Lock className="w-4 h-4" /> Password
                      </Label>
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        className="mt-1 h-11 pr-10"
                        style={{ borderColor: `${primaryColor}55` }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[39px]"
                        style={{ color: primaryColor }}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="text-right">
                      <PasswordResetModal>
                        <button
                          type="button"
                          className="text-sm hover:underline"
                          style={{ color: primaryColor }}
                        >
                          Forgot your password?
                        </button>
                      </PasswordResetModal>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 text-white font-semibold rounded-md shadow-md"
                      style={{
                        background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                      }}
                    >
                      {loading ? "Signing in..." : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" /> Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-6 mt-6">
                  {!signupDisabled && (
                    <>
                      <Alert className="border-blue-200 bg-blue-50">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>One-time payment of ₦5,000</strong> required for platform access after registration.
                        </AlertDescription>
                      </Alert>

                      <form onSubmit={handleSignUp} className="space-y-6">
                        <div>
                          <Label htmlFor="signup-name" className="flex items-center gap-2" style={{ color: secondaryColor }}>
                            <UserPlus className="w-4 h-4" /> Full Name
                          </Label>
                          <Input
                            id="signup-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="mt-1 h-11"
                            style={{ borderColor: `${primaryColor}55` }}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="signup-email" className="flex items-center gap-2" style={{ color: secondaryColor }}>
                            <Mail className="w-4 h-4" /> Email
                          </Label>
                          <Input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="mt-1 h-11"
                            style={{ borderColor: `${primaryColor}55` }}
                            required
                          />
                        </div>

                        <div className="relative">
                          <Label htmlFor="signup-password" className="flex items-center gap-2" style={{ color: secondaryColor }}>
                            <Lock className="w-4 h-4" /> Password
                          </Label>
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="mt-1 h-11 pr-10"
                            style={{ borderColor: `${primaryColor}55` }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[39px]"
                            style={{ color: primaryColor }}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        <div className="relative">
                          <Label htmlFor="confirm-password" className="flex items-center gap-2" style={{ color: secondaryColor }}>
                            <Lock className="w-4 h-4" /> Confirm Password
                          </Label>
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="********"
                            className="mt-1 h-11 pr-10"
                            style={{ borderColor: `${primaryColor}55` }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-[39px]"
                            style={{ color: primaryColor }}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-11 text-white font-semibold rounded-md shadow-md"
                          style={{
                            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                          }}
                        >
                          {loading ? "Creating Account..." : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" /> Create Account & Pay ₦5,000
                            </>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </TabsContent>
              </Tabs>

              <p className="text-center text-sm mt-4 text-gray-500">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              © 2025 FATE Foundation. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Decorative Image */}
      <div className="hidden lg:flex flex-1 relative">
        <img
          src="https://businessdevelopertool.fatefoundation.org/msme-login.jpg"
          alt="Workspace"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${primaryColor}66, ${secondaryColor}66)`,
          }}
        />
        <div className="absolute bottom-16 left-10 text-white max-w-md">
          <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">Plan with Confidence</h2>
          <p className="text-lg drop-shadow">
            Build investor ready plan....
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && pendingUser && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          user={pendingUser}
        />
      )}
    </div>
  );
};

export default Auth;