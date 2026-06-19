import { useState } from "react";
import Modal from "../ui/Modal";
import EditEmployeeModal from "./EditEmployeeModal";
import ConfirmModal from "../ui/ConfirmModal";

function EmployeeDetailModal({ isOpen, onClose, onSuccess, employee }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!employee) return null;

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    const token = localStorage.getItem("token");
    setIsDeleting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/employees/${employee.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        console.error("Delete failed");
        return;
      }

      setIsDeleteOpen(false);
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    onSuccess();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Employee Details">
        <div className="space-y-6">
          {/* Photo Section */}
          <div className="flex justify-center">
            {employee.photo_url ? (
              <img
                src={employee.photo_url}
                alt={employee.full_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-4xl font-bold border-4 border-slate-300">
                {employee.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Employee Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Nama
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {employee.full_name}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                NIP
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {employee.nip ?? "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Departemen
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {employee.department?.name ?? "—"}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Jabatan
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {employee.position}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Email
              </label>
              <p className="text-gray-800 font-medium mt-1">{employee.email}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Telepon
              </label>
              <p className="text-gray-800 font-medium mt-1">{employee.phone}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Alamat
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {employee.address}
              </p>
            </div>
            {employee.jadwal && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Jam Masuk
                  </label>
                  <p className="text-gray-800 font-medium mt-1">
                    {employee.jadwal.jam_masuk ?? "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Jam Keluar
                  </label>
                  <p className="text-gray-800 font-medium mt-1">
                    {employee.jadwal.jam_keluar ?? "—"}
                  </p>
                </div>
              </>
            )}
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Mulai Kerja
              </label>
              <p className="text-gray-800 font-medium mt-1">
                {employee.contract?.start_date ?? "—"}
              </p>
            </div>
            
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleEdit}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium text-sm"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 font-medium text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <EditEmployeeModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
        employee={employee}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Employee"
        message={`Are you sure you want to delete ${employee.full_name}? This action cannot be undone.`}
      />
    </>
  );
}

export default EmployeeDetailModal;
