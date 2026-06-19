import { useEffect, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import ConfirmModal from "../../components/ui/ConfirmModal";
import CreateBonusPresetModal from "../../components/modals/CreateBonusPresetModal";
import EditBonusPresetModal from "../../components/modals/EditBonusPresetModal";

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

function Bonuses() {
  const [bonuses, setBonuses]       = useState([]);
  const [meta, setMeta]             = useState(null);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState(null);
  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [deletingBonus, setDeletingBonus] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen]   = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [deleteError, setDeleteError]     = useState("");

  const fetchBonuses = async () => {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (page)   params.append("page", page);

    const res = await fetch(
      `http://127.0.0.1:8000/api/bonuses?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await res.json();
    if (!res.ok) { console.error(data); return; }
    setBonuses(data.data || []);
    setMeta(data.meta || null);
  };

  useEffect(() => { fetchBonuses(); }, [page]);

  const handleConfirmDelete = async () => {
    if (!deletingBonus) return;
    setIsDeleting(true);
    setDeleteError("");
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/bonuses/${deletingBonus.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete");
        return;
      }

      setIsDeleteOpen(false);
      setDeletingBonus(null);
      fetchBonuses();
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
          <h2 className="text-2xl font-bold">Bonus Preset</h2>
          <p className="text-sm text-gray-500 mt-1">
            Kelola preset bonus yang dapat diberikan kepada karyawan.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm"
        >
          + Tambah Preset
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          className="border rounded-lg px-3 py-2 w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => { setPage(1); fetchBonuses(); }}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm whitespace-nowrap"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-center">Type</th>
              <th className="p-2 text-right">Jumlah</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bonuses.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-400">
                  Bonus preset tidak ditemukan.
                </td>
              </tr>
            ) : (
              bonuses.map((bonus) => (
                <tr key={bonus.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{bonus.name}</td>
                  <td className="p-2 text-center">
                    {bonus.type === "fixed" ? (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        Fixed
                      </span>
                    ) : (
                      <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                        Percentage
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    {bonus.type === "fixed"
                      ? formatIDR(bonus.amount)
                      : `${bonus.amount}%`}
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => { setEditingBonus(bonus); setIsEditOpen(true); }}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeletingBonus(bonus); setDeleteError(""); setIsDeleteOpen(true); }}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      <CreateBonusPresetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchBonuses}
      />
      <EditBonusPresetModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchBonuses}
        bonus={editingBonus}
      />
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingBonus(null); setDeleteError(""); }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Bonus Preset"
        message={
          deleteError
            ? deleteError
            : `Are you sure you want to delete "${deletingBonus?.name}"? This cannot be undone.`
        }
      />
    </div>
  );
}

export default Bonuses;