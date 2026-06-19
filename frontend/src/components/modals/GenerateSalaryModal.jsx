import { useState } from "react";
import Modal from "../ui/Modal";
import { AlertTriangle } from "lucide-react";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

function GenerateSalaryModal({ isOpen, onClose, onSuccess }) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Warn if selected period is the current month
  const isCurrentMonth = month === currentMonth && year === currentYear;

  // Warn if selected period is in the future
  const isFutureMonth =
    year > currentYear || (year === currentYear && month > currentMonth);

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/salaries/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ month, year }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to generate salaries");
        return;
      }

      setResult(data);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    setResult(null);
    onClose();
  };

  const selectedMonthLabel = MONTHS.find((m) => m.value === month)?.label;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Generate Gaji">
      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
          {error}
        </div>
      )}

      {result ? (
        // Result screen
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-700 font-medium text-sm">
              {result.message}
            </p>
          </div>

          {result.skipped && result.skipped.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Skipped ({result.skipped.length}):
              </p>
              <ul className="text-sm text-gray-500 space-y-1 max-h-40 overflow-y-auto">
                {result.skipped.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">—</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleClose}
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 text-sm"
          >
            Close
          </button>
        </div>
      ) : (
        // Form
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Generate record gaji untuk semua karyawan berdasarkan data kehadiran
            dan gaji pokok mereka.
          </p>

          {/* Month + Year pickers */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                className="border rounded-lg px-3 py-2 w-full text-sm"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <select
                className="border rounded-lg px-3 py-2 w-full text-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Future month warning — block submission */}
          {isFutureMonth && (
            <div className="flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle
                size={16}
                className="text-red-500 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-600">
                Tidak bisa generate untuk bulan yang akan datang. Silakan pilih
                bulan dan tahun yang valid.
              </p>
            </div>
          )}

          {isCurrentMonth && (
            <div className="flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle
                size={16}
                className="text-red-500 shrink-0 mt-0.5"
              />
              <p className="text-sm text-red-600">
                Tidak bisa generate untuk bulan ini. Silakan pilih
                bulan dan tahun yang valid.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isFutureMonth || isCurrentMonth}
              className="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default GenerateSalaryModal;
