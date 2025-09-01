import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Admin";
import CompleteProfile from "./pages/Profile";

const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if user has not completed profile/subscription
  if (user.isProfileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>; // ✅ Must return JSX, not void
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route
            path="/dashboard"
            element={
              <SubscriptionGuard>
                <Dashboard />
              </SubscriptionGuard>
            }
          />
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;




















// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// import { PlanProvider } from "@/contexts/PlanContext";
// import { AdminRoute } from "@/components/AdminRoute";
// import { SubscriptionGuard } from "@/components/SubscriptionGuard";
// import { Navbar } from "@/components/Navbar";
// import { Footer } from "@/components/Footer";
// import Index from "./pages/Index";
// import Auth from "./pages/Auth";
// import FAQ from "./pages/FAQ";
// import Profile from "./pages/Profile";
// import Admin from "./pages/Admin";
// import NotFound from "./pages/NotFound";
// import LoginPage from "./pages/Login";
// import DashboardPage from "./pages/Admin";
// import CompleteProfilePage from "./pages/Profile";

// // ✅ SubscriptionGuard that returns children
// const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (!user.isProfileComplete) {
//     return <Navigate to="/complete-profile" replace />;
//   }

//   return <>{children}</>;
// };

// // ✅ AuthGuard to protect login-required routes
// const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { user } = useAuth();
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   return <>{children}</>;
// };

// const App: React.FC = () => {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           {/* Public route */}
//           <Route path="/login" element={<LoginPage />} />

//           {/* Protected routes */}
//           <Route
//             path="/dashboard"
//             element={
//               <AuthGuard>
//                 <SubscriptionGuard>
//                   <DashboardPage />
//                 </SubscriptionGuard>
//               </AuthGuard>
//             }
//           />

//           {/* Profile completion */}
//           <Route
//             path="/complete-profile"
//             element={
//               <AuthGuard>
//                 <CompleteProfilePage />
//               </AuthGuard>
//             }
//           />

//           {/* Redirect unknown routes */}
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// };

// export default App;















// // import { Toaster } from "@/components/ui/toaster";
// // import { Toaster as Sonner } from "@/components/ui/sonner";
// // import { TooltipProvider } from "@/components/ui/tooltip";
// // import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// // import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// // import { PlanProvider } from "@/contexts/PlanContext";
// // import { AdminRoute } from "@/components/AdminRoute";
// // import { SubscriptionGuard } from "@/components/SubscriptionGuard";
// // import { Navbar } from "@/components/Navbar";
// // import { Footer } from "@/components/Footer";
// // import Index from "./pages/Index";
// // import Auth from "./pages/Auth";
// // import FAQ from "./pages/FAQ";
// // import Profile from "./pages/Profile";
// // import Admin from "./pages/Admin";
// // import NotFound from "./pages/NotFound";

// // const queryClient = new QueryClient();

// // const AppContent = () => {
// //   const { isLoggedIn, loading } = useAuth();

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
// //           <p className="text-gray-600">Loading...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!isLoggedIn) {
// //     return <Auth />;
// //   }

// //   return (
// //     <SubscriptionGuard>
// //       <div className="min-h-screen flex flex-col">
// //         <Navbar />
// //         <main className="flex-1">
// //           <Routes>
// //             <Route path="/" element={<Index />} />
// //             <Route path="/faq" element={<FAQ />} />
// //             <Route path="/profile" element={<Profile />} />
// //             <Route path="/admin" element={
// //               <AdminRoute>
// //                 <Admin />
// //               </AdminRoute>
// //             } 
// //             />
// //             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
// //             <Route path="*" element={<NotFound />} />
// //           </Routes>
// //         </main>
// //         <Footer />
// //       </div>
// //     </SubscriptionGuard>
// //   );
// // };

// // const App = () => (
// //   <QueryClientProvider client={queryClient}>
// //     <TooltipProvider>
// //       <Toaster />
// //       <Sonner />
// //       <AuthProvider>
// //         <PlanProvider>
// //           <BrowserRouter>
// //             <AppContent />
// //           </BrowserRouter>
// //         </PlanProvider>
// //       </AuthProvider>
// //     </TooltipProvider>
// //   </QueryClientProvider>
// // );

// // export default App;
