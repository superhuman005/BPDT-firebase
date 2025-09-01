import { Button } from "@/components/ui/button";
import { Home, HelpCircle, User, LogOut, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";

interface NavbarProps {
  primaryColor?: string; // for title
  secondaryColor?: string; // for subtitle
}

export const Navbar = ({
  primaryColor = "#364693",  // default: blue
  secondaryColor = "#a43579", // default: purple
}: NavbarProps) => {
  const { logout } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="https://msmehub.org/wp-content/uploads/2025/01/cropped-msme_logo-1-300x84.png"
              alt="MSME Hub Logo"
              className="h-10 w-auto"
            />
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: primaryColor }}
              >
                Business Plan Developer Tool
              </h1>
              <p
                className="text-sm"
                style={{ color: secondaryColor }}
              >
                Professional Business Plan Generator
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1">
            <Link to="/">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>
            <Link to="/faq">
              <Button
                variant={isActive("/faq") ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <HelpCircle className="h-4 w-4" />
                <span>FAQ</span>
              </Button>
            </Link>
            <Link to="/profile">
              <Button
                variant={isActive("/profile") ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Button>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  className="flex items-center space-x-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2 ml-4"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};
