import { useState } from "react";
import Modal from "../ui/Modal";
import ContractForm from "../forms/ContractFrom";

function EditContractModal({ isOpen, onClose, onSuccess, contract }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  if (!contract) return null;

  const handleSubmit = async (formData) => {
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/contracts/${contract.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        },
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Kontrak">
      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
          {error}
        </div>
      )}

      <ContractForm
        initialData={{
          id: contract.id,
          employee_id: contract.employee_id,
          base_salary: contract.base_salary,
          tunjangan_jabatan: contract.tunjangan_jabatan,
          potongan: contract.potongan,
          contract_type: contract.contract_type,
          start_date: contract.start_date,
          end_date: contract.end_date,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        disableEmployeeId={true}
      />
    </Modal>
  );
}

export default EditContractModal;
