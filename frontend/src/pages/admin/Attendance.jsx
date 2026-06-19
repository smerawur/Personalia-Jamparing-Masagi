import { useEffect, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";

const STATUS_COLORS = {
  "Masuk":         "bg-green-100 text-green-700",
  "Pulang":        "bg-teal-100 text-teal-700",
  "Izin":          "bg-blue-100 text-blue-700",
  "Sakit":         "bg-yellow-100 text-yellow-700",
  "Cuti":          "bg-purple-100 text-purple-700",
  "masuk lembur":  "bg-orange-100 text-orange-700",
  "pulang lembur": "bg-orange-100 text-orange-700",
};

const APPROVAL_COLORS = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Rejected: "bg-red-100 text-red-700",
};

function Attendance() {
  const [attendances, setAttendances] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  // Approve
  const [approvingId, setApprovingId] = useState(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Reject
  const [rejectingId, setRejectingId] = useState(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchAttendances = async () => {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (date) params.append("date", date);
    if (page) params.append("page", page);

    const url = `http://127.0.0.1:8000/api/absensis?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();

    const attendancesList = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

    setAttendances(attendancesList);
    setMeta(data.meta || null);
  };

  useEffect(() => {
    fetchAttendances();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleApprove = async () => {
    if (!approvingId) return;
    const token = localStorage.getItem("token");
    setIsApproving(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/absensis/${approvingId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        const data = await res.json();
        console.error("Approve failed:", data);
        return;
      }

      setIsApproveOpen(false);
      setApprovingId(null);
      fetchAttendances();
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    const token = localStorage.getItem("token");
    setIsRejecting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/absensis/${rejectingId}/reject`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ alasan: "" }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        console.error("Reject failed:", data);
        return;
      }

      setIsRejectOpen(false);
      setRejectingId(null);
      fetchAttendances();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRejecting(false);
    }
  };

  const isPending = (att) => att.approval_status === "Pending";
  const needsApproval = (att) => ["Izin", "Sakit", "Cuti"].includes(att.status);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Absensi</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search name or email..."
          className="border rounded-lg px-3 py-2 w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="date"
          className="border rounded-lg px-3 py-2 text-sm"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          onClick={fetchAttendances}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm whitespace-nowrap"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Karyawan</th>
              <th className="p-2 text-left">Tanggal</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Approval</th>
              <th className="p-2 text-left">Catatan</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {attendances.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Tidak ada catatan absensi yang ditemukan.
                </td>
              </tr>
            ) : (
              attendances.map((att) => (
                <tr key={att.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">
                    {att.employee_name || "N/A"}
                  </td>
                  <td className="p-2 text-gray-600">{att.date}</td>
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
                    {needsApproval(att) ? (
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
                  <td className="p-2 text-center">
                    {needsApproval(att) && isPending(att) ? (
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => {
                            setApprovingId(att.id);
                            setIsApproveOpen(true);
                          }}
                          className="text-green-600 hover:underline text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(att.id);
                            setIsRejectOpen(true);
                          }}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={handlePageChange} />

      {/* Approve Confirm */}
      <ConfirmModal
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false);
          setApprovingId(null);
        }}
        onConfirm={handleApprove}
        isLoading={isApproving}
        confirmLabel="Approve"
        loadingLabel="Approving..."
        title="Approve Leave"
        message="Are you sure you want to approve this leave request?"
      />

      {/* Reject Confirm */}
      <ConfirmModal
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setRejectingId(null);
        }}
        onConfirm={handleReject}
        isLoading={isRejecting}
        confirmLabel="Reject"
        loadingLabel="Rejecting..."
        title="Reject Leave"
        message="Are you sure you want to reject this leave request?"
      />
    </div>
  );
}

export default Attendance;
