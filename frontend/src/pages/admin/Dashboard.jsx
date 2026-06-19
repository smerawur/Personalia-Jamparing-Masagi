import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const STATUS_COLORS = {
  Izin:  "bg-blue-100 text-blue-700",
  Sakit: "bg-yellow-100 text-yellow-700",
  Cuti:  "bg-purple-100 text-purple-700",
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentSalaries, setRecentSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Approve / Reject state
  const [processingId, setProcessingId] = useState(null);

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Dashboard fetch failed:", data);
        return;
      }

      setStats(data.stats);
      setRecentLeaves(data.recent_leaves);
      setRecentSalaries(data.recent_salaries);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");
    setProcessingId(id);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/absensis/${id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        console.error("Approve failed:", data);
        return;
      }

      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem("token");
    setProcessingId(id);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/absensis/${id}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ alasan: "" }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        console.error("Reject failed:", data);
        return;
      }

      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Karyawan Aktif"
          value={stats?.total_active_employees ?? 0}
          color="bg-slate-700"
        />
        <StatCard
          icon={Calendar}
          label="izin / cuti pending"
          value={stats?.pending_leaves ?? 0}
          color="bg-yellow-500"
        />
        <StatCard
          icon={DollarSign}
          label="Gaji Pending"
          value={stats?.pending_salaries ?? 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={FileText}
          label="Kontrak Expiring"
          value={stats?.expiring_contracts ?? 0}
          color="bg-red-500"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Pending Leaves */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">permintaan izin / cuti</h3>
            <button
              onClick={() => navigate("/admin/attendance")}
              className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
            >
              View all
            </button>
          </div>

          {recentLeaves.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              tidak ada permintaan izin / cuti yang pending.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                        STATUS_COLORS[leave.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {leave.status}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {leave.employee_name}
                      </p>
                      <p className="text-xs text-gray-400">{leave.date}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(leave.id)}
                      disabled={processingId === leave.id}
                      className="text-xs px-3 py-1 rounded-md bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(leave.id)}
                      disabled={processingId === leave.id}
                      className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Salaries */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Gaji Terbaru</h3>
            <button
              onClick={() => navigate("/admin/salaries")}
              className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
            >
              View all
            </button>
          </div>

          {recentSalaries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              tidak ada catatan gaji baru.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSalaries.map((sal) => (
                <div
                  key={sal.id}
                  className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {sal.employee_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {MONTHS[sal.month - 1]} {sal.year}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-semibold text-gray-700">
                      {formatIDR(sal.total_salary)}
                    </p>
                    {sal.status === "paid" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        Paid
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;