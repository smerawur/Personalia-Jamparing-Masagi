import { useEffect, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import CreateBonusAssignmentModal from "../../components/modals/CreateBonusAssignmentModal";
import EditBonusAssignmentModal from "../../components/modals/EditBonusAssignmentModal";

const MONTHS = [
  { value: 1,  label: "January"   },
  { value: 2,  label: "February"  },
  { value: 3,  label: "March"     },
  { value: 4,  label: "April"     },
  { value: 5,  label: "May"       },
  { value: 6,  label: "June"      },
  { value: 7,  label: "July"      },
  { value: 8,  label: "August"    },
  { value: 9,  label: "September" },
  { value: 10, label: "October"   },
  { value: 11, label: "November"  },
  { value: 12, label: "December"  },
];

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const isLocked = (assignment) => assignment.salary?.status === "paid";

function SlipBadge({ assignment }) {
  if (!assignment.salary_id) {
    return (
      <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
        Not generated
      </span>
    );
  }
  if (assignment.salary?.status === "paid") {
    return (
      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
        Paid
      </span>
    );
  }
  return (
    <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
      Pending slip
    </span>
  );
}

function BonusAssignments() {
  const currentDate = new Date();
  const [assignments, setAssignments] = useState([]);
  const [meta, setMeta]               = useState(null);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear]   = useState(currentDate.getFullYear());

  const [isCreateOpen, setIsCreateOpen]       = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isEditOpen, setIsEditOpen]           = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen]       = useState(false);
  const [isDeleting, setIsDeleting]           = useState(false);

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const fetchAssignments = async () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (search)      params.append("search", search);
    if (filterMonth) params.append("month", filterMonth);
    if (filterYear)  params.append("year", filterYear);
    if (page)        params.append("page", page);

    const res = await fetch(
      `http://127.0.0.1:8000/api/bonus-karyawan?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();
    if (!res.ok) { console.error(data); return; }
    setAssignments(data.data || []);
    setMeta(data.meta || null);
  };

  useEffect(() => { fetchAssignments(); }, [page]);

  const handleConfirmDelete = async () => {
    if (!deletingAssignment) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/bonus-karyawan/${deletingAssignment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) { const d = await res.json(); console.error(d); return; }

      setIsDeleteOpen(false);
      setDeletingAssignment(null);
      fetchAssignments();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Penempatan Bonus</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola penempatan bonus untuk karyawan.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm"
        >
          + Assign Bonus
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search employee name..."
          className="border rounded-lg px-3 py-2 flex-1 min-w-0 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">Select Bulan</option>
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={() => { setPage(1); fetchAssignments(); }}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Karyawan</th>
              <th className="p-2 text-left">Bonus Preset</th>
              <th className="p-2 text-center">Type</th>
              <th className="p-2 text-right">Jumlah Final</th>
              <th className="p-2 text-center">Tanggal Bonus</th>
              <th className="p-2 text-center">Slip Gaji</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Bonus karyawan tidak ditemukan.
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">
                    {a.employee?.full_name ?? "N/A"}
                  </td>
                  <td className="p-2 text-gray-600">{a.bonus?.name ?? "N/A"}</td>
                  <td className="p-2 text-center">
                    {a.bonus?.type === "fixed" ? (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        Fixed
                      </span>
                    ) : (
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                        {a.bonus?.amount}%
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right text-green-600 font-medium">
                    {formatIDR(a.final_amount)}
                  </td>
                  <td className="p-2 text-center text-gray-600">
                    {a.bonus_date
                      ? new Date(a.bonus_date).toLocaleDateString("id-ID")
                      : "—"}
                  </td>
                  <td className="p-2 text-center">
                    <SlipBadge assignment={a} />
                  </td>
                  <td className="p-2 text-center">
                    {isLocked(a) ? (
                      <span className="text-gray-300 text-xs">Locked</span>
                    ) : (
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => { setEditingAssignment(a); setIsEditOpen(true); }}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setDeletingAssignment(a); setIsDeleteOpen(true); }}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      <CreateBonusAssignmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchAssignments}
      />
      <EditBonusAssignmentModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchAssignments}
        assignment={editingAssignment}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingAssignment(null); }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Bonus Assignment"
        message={`Are you sure you want to delete this bonus for ${
          deletingAssignment?.employee?.full_name ?? "this employee"
        }? This action cannot be undone.`}
      />
    </div>
  );
}

export default BonusAssignments;