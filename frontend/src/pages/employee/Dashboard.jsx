import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar, DollarSign, Clock, AlertCircle, Briefcase } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

const STATUS_COLORS = {
  Izin:  "bg-blue-100 text-blue-700",
  Sakit: "bg-yellow-100 text-yellow-700",
  Cuti:  "bg-purple-100 text-purple-700",
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-5">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();

  const [profile, setProfile]             = useState(null);
  const [attendance, setAttendance]       = useState(null);
  const [latestSalary, setLatestSalary]   = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [isLoading, setIsLoading]         = useState(true);

  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/employee-dashboard", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const data = await res.json();
      if (!res.ok) { console.error("Dashboard fetch failed:", data); return; }
      setProfile(data.profile);
      setAttendance(data.attendance);
      setLatestSalary(data.latest_salary);
      setPendingLeaves(data.pending_leaves);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading dashboard...
      </div>
    );
  }

  const monthLabel = MONTHS[(attendance?.month ?? 1) - 1];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Welcome back, {profile?.full_name ?? user?.name}
        </p>
      </div>

      {/* Working days strip */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-700">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Hari Kerja ({monthLabel})</p>
            <p className="text-lg font-bold text-gray-800">
              {attendance?.working_days ?? 0} Hari
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400">kecualI akhir pekan dan hari libur</p>
      </div>

      {/* Stat Cards — 2 cols mobile, 4 desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          icon={Calendar}
          label={`Hadir (${monthLabel})`}
          value={attendance?.days_present ?? 0}
          color="bg-green-500"
        />
        <StatCard
          icon={Clock}
          label={`Terlambat (${monthLabel})`}
          value={attendance?.days_terlambat ?? 0}
          color="bg-orange-400"
        />
        <StatCard
          icon={AlertCircle}
          label={`Absen (${monthLabel})`}
          value={attendance?.days_absent ?? 0}
          color="bg-red-500"
        />
        <StatCard
          icon={DollarSign}
          label="Gaji Terakhir"
          value={latestSalary ? formatIDR(latestSalary.total_salary) : "N/A"}
          color="bg-slate-700"
        />
      </div>

      {/* Leave strip */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500">
            <Calendar size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Izin / Sakit / Cuti</p>
            <p className="text-lg font-bold text-gray-800">
              {attendance?.days_leave ?? 0} Hari
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">

        {/* Profile */}
        <InfoCard title="My Profile">
          <div className="space-y-2.5 text-sm">
            {[
              { label: "Nama",       value: profile?.full_name },
              { label: "Email",      value: profile?.email },
              { label: "Jabatan",   value: profile?.position },
              { label: "Departemen", value: profile?.department },
              { label: "No Hp",      value: profile?.phone },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="font-medium text-gray-800 text-right truncate">
                  {value ?? "—"}
                </span>
              </div>
            ))}
            <div className="flex justify-between gap-2">
              <span className="text-gray-500 shrink-0">Status</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                profile?.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {profile?.status ?? "—"}
              </span>
            </div>
          </div>
        </InfoCard>

        {/* Latest Salary */}
        <InfoCard title={
          latestSalary
            ? `Salary — ${MONTHS[latestSalary.month - 1]} ${latestSalary.year}`
            : "Latest Salary"
        }>
          {latestSalary ? (
            <div className="space-y-2.5 text-sm">
              {[
                { label: "Gaji Pokok", value: formatIDR(latestSalary.base_salary),        color: "" },
                { label: "Tunjangan",   value: formatIDR(latestSalary.tunjangan_jabatan),  color: "text-indigo-600" },
                { label: "Lembur",    value: formatIDR(latestSalary.overtime_pay),        color: "text-blue-600" },
                { label: "Bonus",       value: formatIDR(latestSalary.bonus),               color: "text-green-600" },
                { label: "Potongan",  value: `- ${formatIDR(latestSalary.deductions)}`,  color: "text-red-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">{label}</span>
                  <span className={`font-medium ${color || "text-gray-800"}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between gap-2 pt-2 border-t">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-gray-800">
                  {formatIDR(latestSalary.total_salary)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-500 shrink-0">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  latestSalary.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {latestSalary.status === "paid" ? "Dibayar" : "Menunggu"}
                </span>
              </div>
              {latestSalary.paid_at && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Dibayar Pada</span>
                  <span className="text-gray-800">
                    {new Date(latestSalary.paid_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              tidak ada data gaji terbaru
            </p>
          )}
        </InfoCard>

        {/* Pending Leaves */}
        <InfoCard title="Permintaan Cuti/Izin/Sakit">
          {pendingLeaves.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              tidak ada permintaan cuti/izin/sakit
            </p>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between gap-3 py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
                      STATUS_COLORS[leave.status] ?? "bg-gray-100 text-gray-600"
                    }`}>
                      {leave.status}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">{leave.date}</p>
                      {leave.keterangan && (
                        <p className="text-xs text-gray-500 truncate">
                          {leave.keterangan}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                    Menunggu
                  </span>
                </div>
              ))}
            </div>
          )}
        </InfoCard>

      </div>
    </div>
  );
}

export default EmployeeDashboard;