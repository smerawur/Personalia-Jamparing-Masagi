import { useState } from "react";
import Modal from "../ui/Modal";
import ScheduleForm from "../forms/ScheduleForm";

function EditScheduleModal({ isOpen, onClose, onSuccess, schedule }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    if (!schedule) return null;

    

    const handleSubmit = async (formData) => {
        setError("");
        setIsSubmitting(true);
        

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/jadwals/${schedule.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                setError(errorData.message || "Failed to update schedule.");
                return;
            }

            const data = await res.json();
            onSuccess(data);
            onClose();
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2>Edit Schedule</h2>
            <ScheduleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} initialData={schedule} />
            {error && <p style={{ color: "red" }}>{error}</p>}
        </Modal>
    );
}

export default EditScheduleModal;