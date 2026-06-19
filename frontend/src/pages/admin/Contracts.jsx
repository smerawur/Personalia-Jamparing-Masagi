import { useEffect, useState } from "react";
import Pagination from "../../components/ui/Pagination";
import CreateContractModal from "../../components/modals/CreateContractModal";
import EditContractModal from "../../components/modals/EditContractModal";
import ConfirmModal from "../../components/ui/ConfirmModal";

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const isActive = (contract) => {
  if (!contract.end_date) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(contract.end_date);
  return today < end;
};

function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Edit
  const [editingContract, setEditingContract] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // End contract
  const [contractToEnd, setContractToEnd] = useState(null);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Delete contract
  const [contractToDelete, setContractToDelete] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContracts = async () => {
    const token = localStorage.getItem("token");

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (page) params.append("page", page);

    const url = `http://127.0.0.1:8000/api/contracts?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("ERROR:", data);
      return;
    }

    const contractsList = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

    setContracts(contractsList);
    setMeta(data.meta || null);
  };

  useEffect(() => {
    fetchContracts();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleEndContract = async () => {
    if (!contractToEnd) return;

    const token = localStorage.getItem("token");
    setIsEnding(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/contracts/${contractToEnd}/end`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        return;
      }

      setIsEndConfirmOpen(false);
      setContractToEnd(null);
      fetchContracts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnding(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!contractToDelete) return;

    const token = localStorage.getItem("token");
    setIsDeleting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/contracts/${contractToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        const data = await res.json();
        console.error("Delete failed:", data);
        return;
      }

      setIsDeleteConfirmOpen(false);
      setContractToDelete(null);
      fetchContracts();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kontrak</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          Buat Kontrak
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search employee name..."
          className="border rounded-lg px-3 py-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={fetchContracts}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          Search
        </button>
      </div>

      <table className="w-full bg-white rounded shadow text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Karyawan</th>
            <th className="p-2 text-right">Gaji Pokok</th>
            <th className="p-2 text-right">Tunjangan Jabatan</th>
            <th className="p-2 text-right">Potongan</th>
            <th className="p-2 text-left">Tanggal Mulai</th>
            <th className="p-2 text-left">Tanggal Berakhir</th>
            <th className="p-2 text-left">Jenis Kontrak</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {contracts.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-6 text-center text-gray-400">
                No contracts found.
              </td>
            </tr>
          ) : (
            contracts.map((con) => (
              <tr key={con.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">
                  {con.employee_name || "N/A"}
                </td>
                <td className="p-2 text-right">{formatIDR(con.base_salary)}</td>
                <td className="p-2 text-right">
                  {formatIDR(con.tunjangan_jabatan)}
                </td>
                <td className="p-2 text-right">{formatIDR(con.potongan)}</td>
                <td className="p-2">{con.start_date}</td>
                <td className="p-2">{con.end_date || "N/A"}</td>
                <td className="p-2">{con.contract_type}</td>
                <td className="p-2 text-center">
                  {isActive(con) ? (
                    <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-medium">
                      Ended
                    </span>
                  )}
                </td>
                <td className="p-2 text-center">
                  {isActive(con) ? (
                    // Active contract — edit and end
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          setEditingContract(con);
                          setIsEditOpen(true);
                        }}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setContractToEnd(con.id);
                          setIsEndConfirmOpen(true);
                        }}
                        className="text-red-600 hover:underline text-xs"
                      >
                        End Contract
                      </button>
                    </div>
                  ) : (
                    // Ended contract — delete only
                    <button
                      onClick={() => {
                        setContractToDelete(con);
                        setIsDeleteConfirmOpen(true);
                      }}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination meta={meta} onPageChange={handlePageChange} />

      <CreateContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchContracts}
      />

      <EditContractModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        contract={editingContract}
        onSuccess={fetchContracts}
      />

      {/* End Contract Confirm */}
      <ConfirmModal
        isOpen={isEndConfirmOpen}
        onClose={() => {
          setIsEndConfirmOpen(false);
          setContractToEnd(null);
        }}
        onConfirm={handleEndContract}
        title="End Contract"
        message="Are you sure you want to end this contract? The employee will be marked as inactive."
        isLoading={isEnding}
      />

      {/* Delete Contract Confirm */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setContractToDelete(null);
        }}
        onConfirm={handleDeleteContract}
        title="Delete Contract"
        message={`Are you sure you want to delete ${contractToDelete?.employee_name ?? "this"}'s contract? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default Contracts;
