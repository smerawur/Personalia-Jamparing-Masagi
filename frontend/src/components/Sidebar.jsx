import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  User,
  Calendar,
  DollarSign,
  Gift,
  Lock,
  X,
} from "lucide-react";

function Sidebar({ isMobileOpen, onMobileClose }) {
  const location = useLocation();
  const { user } = useAuth();

  const adminMenu = [
    { name: "Dashboard",       path: "/admin/dashboard",        icon: LayoutDashboard },
    { name: "Karyawan",       path: "/admin/employees",        icon: Users },
    { name: "Departemen",     path: "/admin/departments",      icon: Users },
    { name: "Absensi",      path: "/admin/attendance",       icon: Calendar },
    { name: "Gaji",        path: "/admin/salaries",         icon: DollarSign },
    { name: "Preset Bonus",         path: "/admin/bonuses",          icon: Gift },
    { name: "Penempatan Bonus",         path: "/admin/bonus-assignments",          icon: Gift },
    { name: "Kontrak",       path: "/admin/contracts",        icon: User },
    { name: "Shift",       path: "/admin/schedules",        icon: Calendar },
    { name: "Lembur",        path: "/admin/overtime",         icon: Calendar },
    { name: "Ubah Password", path: "/admin/change-password",  icon: Lock },
  ];

  const employeeMenu = [
    { name: "Dashboard",       path: "/employee/dashboard",       icon: LayoutDashboard },
    { name: "My Profile",      path: "/employee/profile",         icon: User },
    { name: "Absensi",      path: "/employee/attendance",      icon: Calendar },
    { name: "Ubah Password", path: "/employee/change-password", icon: Lock },
  ];

  const menu = user?.role === "admin" ? adminMenu : employeeMenu;
  const isEmployee = user?.role !== "admin";

  const handleLinkClick = () => {
    if (isEmployee && onMobileClose) onMobileClose();
  };

  // --- Admin: static sidebar ---
  if (!isEmployee) {
    return (
      <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-700">
          Admin Panel
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {Icon && <Icon size={18} />}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
          Logged in sebagai <br />
          <span className="text-white font-medium">{user?.name}</span>
        </div>
      </div>
    );
  }

  // --- Employee: mobile overlay + desktop static ---
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-30
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:z-auto lg:h-full
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 text-xl font-bold border-b border-slate-700 flex justify-between items-center">
          <span>Employee Panel</span>
          <button
            onClick={onMobileClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {Icon && <Icon size={18} />}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
          Logged in sebagai <br />
          <span className="text-white font-medium">{user?.name}</span>
        </div>
      </div>
    </>
  );
}

export default Sidebar;