import { useEffect, useState } from "react";
import Pagination from "../../components/ui/Pagination";

const STATUS_COLORS = {
  Masuk: "bg-green-100 text-green-700",
  Pulang: "bg-teal-100 text-teal-700",
  Izin: "bg-blue-100 text-blue-700",
  Sakit: "bg-yellow-100 text-yellow-700",
  Cuti: "bg-purple-100 text-purple-700",
  "masuk lembur": "bg-orange-100 text-orange-700",
  "pulang lembur": "bg-orange-100 text-orange-700",
};

const APPROVAL_COLORS = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
};

const needsApproval = (status) => ["Izin", "Sakit", "Cuti"].includes(status);

const formatMonth = (bulan) => {
  const [y, m] = bulan.split("-");
  return new Date(y, m - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

function EmployeeAttendance() {
  const [attendances, setAttendances] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [bulanList, setBulanList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  const fetchBulanList = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/absensis/bulan-list", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      const list = data.data || [];
      // Handle both string and object formats from API
      const formattedList = list.map((item) =>
        typeof item === "string" ? item : item.name || item.bulan,
      );
      setBulanList(formattedList);
      if (formattedList.length > 0 && !selectedMonth)
        setSelectedMonth(formattedList[0]);
    } catch (err) {
      console.error("Failed to fetch bulan list:", err);
    }
  };

  const fetchAttendances = async () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (selectedMonth) params.append("month", selectedMonth);
    if (page) params.append("page", page);

    const res = await fetch(
      `http://127.0.0.1:8000/api/absensis?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    const data = await res.json();
    if (!res.ok) {
      console.error("ERROR:", data);
      return;
    }
    setAttendances(data.data || []);
    setMeta(data.meta || null);
  };

  useEffect(() => {
    fetchBulanList();
  }, []);
  useEffect(() => {
    if (selectedMonth) fetchAttendances();
  }, [page, selectedMonth]);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setPage(1);
  };

  // Summary counts — only count unique dates for Masuk
  const presentDates = [
    ...new Set(
      attendances.filter((a) => a.status === "Masuk").map((a) => a.date),
    ),
  ].length;

  const leaveDates = [
    ...new Set(
      attendances
        .filter((a) => ["Izin", "Sakit", "Cuti"].includes(a.status))
        .map((a) => a.date),
    ),
  ].length;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <h2 className="text-xl lg:text-2xl font-bold">Absensi</h2>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          <option value="">Select month...</option>
          {bulanList.map((bulan) => (
            <option key={bulan} value={bulan}>
              {formatMonth(bulan)}
            </option>
          ))}
        </select>
      </div>

      {/* Summary strip */}
      {selectedMonth && (
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{presentDates}</p>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">Hari Hadir</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 lg:p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{leaveDates}</p>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">Hari Cuti</p>
          </div>
        </div>
      )}

      {/* Mobile card list */}
      <div className="block lg:hidden space-y-3">
        {attendances.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400 text-sm">
            {selectedMonth
              ? "No attendance records for this month."
              : "Select a month to view records."}
          </div>
        ) : (
          attendances.map((att) => (
            <div
              key={att.id}
              className="bg-white rounded-xl shadow-sm p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-800">
                  {att.date}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    STATUS_COLORS[att.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {att.status}
                </span>
              </div>
              {needsApproval(att.status) && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Approval</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      APPROVAL_COLORS[att.approval_status] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {att.approval_status}
                  </span>
                </div>
              )}
              {att.keterangan && (
                <p className="text-xs text-gray-500 truncate">
                  {att.keterangan}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Approval</th>
              <th className="p-2 text-left">Note</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  {selectedMonth
                    ? "No records for this month."
                    : "Select a month to view records."}
                </td>
              </tr>
            ) : (
              attendances.map((att) => (
                <tr key={att.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 text-gray-700">{att.date}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                        STATUS_COLORS[att.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {att.status}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    {needsApproval(att.status) ? (
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                          APPROVAL_COLORS[att.approval_status] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {att.approval_status}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-2 text-gray-500 text-xs max-w-xs truncate">
                    {att.keterangan || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  );
}

export default EmployeeAttendance;
