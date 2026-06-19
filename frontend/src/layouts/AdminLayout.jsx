import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";

function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — sticky so it stays visible while content scrolls */}
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-slate-100 flex flex-col">
        {/* Top bar */}
        <div className="flex justify-end p-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Page content */}
        <div className="p-6 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;