import { useEffect, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import GenerateSalaryModal from "../../components/modals/GenerateSalaryModal";

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
  }).format(amount ?? 0);

const getMonthLabel = (monthNum) =>
  MONTHS.find((m) => m.value === Number(monthNum))?.label ?? monthNum;

function Salaries() {
  const currentDate = new Date();

  const [salaries, setSalaries]   = useState([]);
  const [meta, setMeta]           = useState(null);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear]   = useState(currentDate.getFullYear());

  // Generate modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // Pay confirm
  const [payingSalary, setPayingSalary]         = useState(null);
  const [isPayConfirmOpen, setIsPayConfirmOpen] = useState(false);
  const [isPaying, setIsPaying]                 = useState(false);

  // Delete confirm
  const [deletingSalary, setDeletingSalary]       = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting]               = useState(false);

  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const fetchSalaries = async () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (search)      params.append("search", search);
    if (filterMonth) params.append("month", filterMonth);
    if (filterYear)  params.append("year", filterYear);
    if (page)        params.append("page", page);

    const res = await fetch(
      `http://127.0.0.1:8000/api/salaries?${params.toString()}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    );

    const data = await res.json();
    if (!res.ok) { console.error("ERROR:", data); return; }
    setSalaries(data.data || []);
    setMeta(data.meta || null);
  };

  useEffect(() => { fetchSalaries(); }, [page]);

  const handleSearch = () => { setPage(1); fetchSalaries(); };

  const handleConfirmPay = async () => {
    if (!payingSalary) return;
    const token = localStorage.getItem("token");
    setIsPaying(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/salaries/${payingSalary.id}/pay`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
      );
      if (!res.ok) { const d = await res.json(); console.error(d); return; }
      setIsPayConfirmOpen(false);
      setPayingSalary(null);
      fetchSalaries();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPaying(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSalary) return;
    const token = localStorage.getItem("token");
    setIsDeleting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/salaries/${deletingSalary.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
      );
      if (!res.ok) { const d = await res.json(); console.error(d); return; }
      setIsDeleteConfirmOpen(false);
      setDeletingSalary(null);
      fetchSalaries();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gaji</h2>
        <button
          onClick={() => setIsGenerateOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm"
        >
          Generate Gaji
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-2 w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">All Months</option>
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
          onClick={handleSearch}
          className="bg-slate-900 text-white px-4 rounded-lg text-sm whitespace-nowrap"
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
              <th className="p-2 text-left">Periode</th>
              <th className="p-2 text-right">Gaji Pokok</th>
              <th className="p-2 text-right">Tunjangan</th>
              <th className="p-2 text-right">Lembur</th>
              <th className="p-2 text-right">Bonus</th>
              <th className="p-2 text-right">Potongan</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Dibayar Pada</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salaries.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-6 text-center text-gray-400">
                  tidak ada data gaji yang ditemukan.
                </td>
              </tr>
            ) : (
              salaries.map((sal) => (
                <tr key={sal.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">
                    {sal.employee?.full_name ?? "N/A"}
                  </td>
                  <td className="p-2 text-gray-600">
                    {getMonthLabel(sal.month)} {sal.year}
                  </td>
                  <td className="p-2 text-right">{formatIDR(sal.base_salary)}</td>
                  <td className="p-2 text-right text-indigo-600">
                    {formatIDR(sal.tunjangan_jabatan)}
                  </td>
                  <td className="p-2 text-right text-blue-600">
                    {formatIDR(sal.overtime_pay)}
                  </td>
                  <td className="p-2 text-right text-green-600">
                    {formatIDR(sal.bonus)}
                  </td>
                  <td className="p-2 text-right text-red-500">
                    {formatIDR(sal.deductions)}
                  </td>
                  <td className="p-2 text-right font-semibold">
                    {formatIDR(sal.total_salary)}
                  </td>
                  <td className="p-2 text-center">
                    {sal.status === "paid" ? (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        Dibayar
                      </span>
                    ) : (
                      <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                        Menunggu
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-center text-gray-500 text-xs">
                    {sal.paid_at
                      ? new Date(sal.paid_at).toLocaleDateString("id-ID")
                      : "—"}
                  </td>
                  <td className="p-2 text-center">
                    {sal.status === "pending" ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => { setPayingSalary(sal); setIsPayConfirmOpen(true); }}
                          className="text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors text-xs px-3 py-1 rounded-md"
                        >
                          Mark as Paid
                        </button>
                        <button
                          onClick={() => { setDeletingSalary(sal); setIsDeleteConfirmOpen(true); }}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Delete
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

      <Pagination meta={meta} onPageChange={setPage} />

      <GenerateSalaryModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onSuccess={fetchSalaries}
      />

      {/* Pay Confirm */}
      <ConfirmModal
        isOpen={isPayConfirmOpen}
        onClose={() => { setIsPayConfirmOpen(false); setPayingSalary(null); }}
        onConfirm={handleConfirmPay}
        isLoading={isPaying}
        title="Mark as Paid"
        message={`tandai gaji ${payingSalary?.employee?.full_name ?? "this employee"} untuk ${getMonthLabel(payingSalary?.month)} ${payingSalary?.year} sebagai dibayar? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Mark as Paid"
        loadingLabel="Processing..."
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setDeletingSalary(null); }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Salary"
        message={`Delete ${deletingSalary?.employee?.full_name ?? "this employee"}'s salary for ${getMonthLabel(deletingSalary?.month)} ${deletingSalary?.year}? Linked bonuses will be unlinked and picked up on next generation.`}
      />
    </div>
  );
}

export default Salaries;