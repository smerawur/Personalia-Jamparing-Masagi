import { useEffect, useState } from "react";
import Modal from "../ui/Modal";

function EditBonusPresetModal({ isOpen, onClose, onSuccess, bonus }) {
  const [formData, setFormData] = useState({ name: "", amount: "", type: "fixed" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (bonus) {
      setFormData({
        name:   bonus.name   ?? "",
        amount: bonus.amount ?? "",
        type:   bonus.type   ?? "fixed",
      });
    }
  }, [bonus]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/bonuses/${bonus.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Bonus Preset">
      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">{error}</div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex gap-3">
            {["fixed", "percentage"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: t }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  formData.type === t
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {t === "fixed" ? "Fixed (Rp)" : "Percentage (%)"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.type === "fixed" ? "Amount (IDR)" : "Percentage (%)"}
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
          {formData.type === "Jumlah (IDR)" && (
            <p className="text-xs text-gray-400 mt-1">
              Note: Mengedit preset tidak akan mengubah bonus yang sudah diberikan sebelumnya.
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default EditBonusPresetModal;