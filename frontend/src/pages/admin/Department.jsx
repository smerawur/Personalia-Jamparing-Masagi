import { useEffect, useState } from "react";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Modal from "../../components/ui/Modal";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch]           = useState("");
  const [isLoading, setIsLoading]     = useState(false);

  // Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName]     = useState("");
  const [isCreating, setIsCreating]     = useState(false);
  const [createError, setCreateError]   = useState("");

  // Edit
  const [editingDept, setEditingDept] = useState(null);
  const [isEditOpen, setIsEditOpen]   = useState(false);
  const [editName, setEditName]       = useState("");
  const [isEditing, setIsEditing]     = useState(false);
  const [editError, setEditError]     = useState("");

  // Delete
  const [deletingDept, setDeletingDept] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [deleteError, setDeleteError]   = useState("");

  const token = localStorage.getItem("token");

  const fetchDepartments = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/departments?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      );
      const data = await res.json();
      setDepartments(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleCreate = async () => {
    setCreateError("");
    setIsCreating(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ name: createName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.errors?.name?.[0] ?? data.message ?? "Failed to create");
        return;
      }
      setIsCreateOpen(false);
      setCreateName("");
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setCreateError("Something went wrong");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async () => {
    setEditError("");
    setIsEditing(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/departments/${editingDept.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({ name: editName }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.errors?.name?.[0] ?? data.message ?? "Failed to update");
        return;
      }
      setIsEditOpen(false);
      setEditingDept(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setEditError("Something went wrong");
    } finally {
      setIsEditing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDept) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/departments/${deletingDept.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? "Failed to delete");
        return;
      }
      setIsDeleteOpen(false);
      setDeletingDept(null);
      fetchDepartments();
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
          <h2 className="text-2xl font-bold">Departments</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage departments assigned to employees.
          </p>
        </div>
        <button
          onClick={() => { setCreateName(""); setCreateError(""); setIsCreateOpen(true); }}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm"
        >
          + Add Department
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search department name..."
          className="border rounded-lg px-3 py-2 w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={fetchDepartments}
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
              <th className="p-2 text-left">Nama Departemen</th>
              <th className="p-2 text-center">Karyawan</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">Loading...</td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-400">No departments found.</td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{dept.name}</td>
                  <td className="p-2 text-center">
                    <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full font-medium">
                      {dept.employees_count} employee{dept.employees_count !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          setEditingDept(dept);
                          setEditName(dept.name);
                          setEditError("");
                          setIsEditOpen(true);
                        }}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeletingDept(dept);
                          setDeleteError("");
                          setIsDeleteOpen(true);
                        }}
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

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Department">
        {createError && (
          <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">{createError}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. Human Resources"
              className="border rounded-lg px-3 py-2 w-full text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !createName.trim()}
              className="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
            >
              {isCreating ? "Saving..." : "Add Department"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Department">
        {editError && (
          <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">{editError}</div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full text-sm"
              onKeyDown={(e) => { if (e.key === "Enter") handleEdit(); }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditOpen(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={isEditing || !editName.trim()}
              className="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
            >
              {isEditing ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingDept(null); setDeleteError(""); }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Department"
        message={
          deleteError
            ? deleteError
            : `Are you sure you want to delete "${deletingDept?.name}"? This cannot be undone.`
        }
      />
    </div>
  );
}

export default Departments;