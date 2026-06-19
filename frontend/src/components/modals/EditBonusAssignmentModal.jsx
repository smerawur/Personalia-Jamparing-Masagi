import { useEffect, useState } from "react";
import Modal from "../ui/Modal";

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

function EditBonusAssignmentModal({ isOpen, onClose, onSuccess, assignment }) {
  const [formData, setFormData] = useState({ bonus_date: "", final_amount: "" });
  const [projectValue, setProjectValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState("");

  const token = localStorage.getItem("token");
  const isPercentage = assignment?.bonus?.type === "percentage";

  useEffect(() => {
    if (assignment) {
      setFormData({
        bonus_date:   assignment.bonus_date   ?? "",
        final_amount: assignment.final_amount ?? "",
      });
      setProjectValue("");
    }
  }, [assignment]);

  const handleProjectValueChange = (e) => {
    const val = e.target.value;
    setProjectValue(val);
    if (val && assignment?.bonus?.amount) {
      const calculated = (Number(assignment.bonus.amount) / 100) * Number(val);
      setFormData((prev) => ({ ...prev, final_amount: calculated }));
    }
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/bonus-karyawan/${assignment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Bonus Assignment">
      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">{error}</div>
      )}

      <div className="space-y-4">
        {/* Read-only info */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Karyawan</span>
            <span className="font-medium">{assignment?.employee?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Preset</span>
            <span className="font-medium">{assignment?.bonus?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              isPercentage
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {isPercentage ? `${assignment?.bonus?.amount}%` : "Fixed"}
            </span>
          </div>
        </div>

        {/* Bonus Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Date</label>
          <input
            type="date"
            value={formData.bonus_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bonus_date: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </div>

        {/* Final Amount */}
        {isPercentage ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nilai Projek (IDR)
            </label>
            <input
              type="number"
              value={projectValue}
              onChange={handleProjectValueChange}
              placeholder="Masukkan nilai proyek baru..."
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
            {projectValue && (
              <p className="text-xs text-green-600 mt-1">
                {assignment?.bonus?.amount}% × {formatIDR(projectValue)} = {formatIDR(formData.final_amount)}
              </p>
            )}
            {!projectValue && (
              <p className="text-xs text-gray-400 mt-1">
                Current: {formatIDR(formData.final_amount)} — masukkan nilai proyek baru untuk menghitung ulang.
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Final Amount (IDR)
            </label>
            <input
              type="number"
              value={formData.final_amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, final_amount: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 w-full text-sm"
            />
          </div>
        )}

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

export default EditBonusAssignmentModal;