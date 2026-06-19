import { useState } from "react";
import Modal from "../ui/Modal";
import DepartmentForm from "../forms/DepartmentForm";

function EditDepartmentModal({ isOpen, onClose, onSuccess, department }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    if (!department) return null;

    const handleSubmit = async (formData) => {
        setError("");
        setIsSubmitting(true);

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/departments/${department.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to update department");
            }

            const data = await res.json();
            onSuccess(data);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2>Edit Department</h2>
            <DepartmentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} initialData={department} />
            {error && <p style={{ color: "red" }}>{error}</p>}
        </Modal>
    );
}

export default EditDepartmentModal;