import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";

function EmployeeLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — sticky on desktop, overlay on mobile */}
      <div className="sticky top-0 h-screen shrink-0 hidden lg:block">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Mobile sidebar rendered outside the sticky wrapper */}
      <div className="lg:hidden">
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-slate-100 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex justify-between items-center p-4 bg-white shadow-sm lg:bg-transparent lg:shadow-none">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-slate-700 hover:text-slate-900"
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:block" />

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-6 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default EmployeeLayout;