import { useState } from "react";
import Modal from "../ui/Modal";
import EmployeeForm from "../forms/EmployeeForm";

function CreateEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (formData) => {
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/employees", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          // No Content-Type header — browser sets it automatically for FormData
        },
        body: formData,
      });

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
    <Modal isOpen={isOpen} onClose={onClose} title="Create Employee">
      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
          {error}
        </div>
      )}
      <EmployeeForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Modal>
  );
}

export default CreateEmployeeModal;