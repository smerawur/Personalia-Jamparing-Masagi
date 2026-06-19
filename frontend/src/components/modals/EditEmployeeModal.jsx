import { useState } from "react";
import Modal from "../ui/Modal";
import EmployeeForm from "../forms/EmployeeForm";

function EditEmployeeModal({ isOpen, onClose, onSuccess, employee }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  if (!employee) return null;

  const handleSubmit = async (formData) => {
    setError("");
    setIsSubmitting(true);

    // Laravel method spoofing — PATCH via POST for multipart support
    formData.append("_method", "PATCH");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/employees/${employee.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            // No Content-Type — browser sets it for FormData
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const firstError = data.errors
          ? Object.values(data.errors)[0][0]
          : data.message;
        setError(firstError);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Employee">
      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
          {error}
        </div>
      )}
      <EmployeeForm
        initialData={{
          id:              employee.id,
          full_name:       employee.full_name,
          nip:             employee.nip,
          email:           employee.user?.email || "",
          phone:           employee.phone,
          address:         employee.address,
          position:        employee.position,
          department_id:   employee.department?.id || "",
          jadwal_id:       employee.jadwal_id,
          photo_url:       employee.photo_url || null,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}

export default EditEmployeeModal;