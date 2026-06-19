import { useEffect, useState } from "react";
import Modal from "../ui/Modal";

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

function CreateBonusAssignmentModal({ isOpen, onClose, onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [presets, setPresets] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  // Employee search + selection
  const [empSearch, setEmpSearch] = useState("");
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  const [formData, setFormData] = useState({ bonus_id: "", bonus_date: "" });
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [projectValue, setProjectValue] = useState("");
  const [finalAmount, setFinalAmount] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [empRes, bonusRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/employees?per_page=100", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
          fetch("http://127.0.0.1:8000/api/bonuses?per_page=100", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
        ]);
        const [empData, bonusData] = await Promise.all([
          empRes.json(),
          bonusRes.json(),
        ]);
        setEmployees(empData.data || empData);
        setPresets(bonusData.data || bonusData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [isOpen]);

  const filteredEmployees = employees.filter((emp) =>
    emp.full_name.toLowerCase().includes(empSearch.toLowerCase()),
  );

  const toggleEmployee = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmpIds.length === filteredEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(filteredEmployees.map((e) => e.id));
    }
  };

  const handleBonusChange = (e) => {
    const bonusId = e.target.value;
    setFormData((prev) => ({ ...prev, bonus_id: bonusId }));
    const preset = presets.find((p) => p.id === Number(bonusId));
    setSelectedPreset(preset || null);
    setProjectValue("");
    setFinalAmount(preset?.type === "fixed" ? Number(preset.amount) : null);
  };

  const handleProjectValueChange = (e) => {
    const val = e.target.value;
    setProjectValue(val);
    if (selectedPreset && val) {
      setFinalAmount((Number(selectedPreset.amount) / 100) * Number(val));
    } else {
      setFinalAmount(null);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (selectedEmpIds.length === 0) {
      setError("Please select at least one employee.");
      return;
    }
    if (!formData.bonus_id) {
      setError("Please select a bonus preset.");
      return;
    }
    if (!finalAmount || finalAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!formData.bonus_date) {
      setError("Please select a bonus date.");
      return;
    }

    setIsSubmitting(true);

    let successCount = 0;
    const failed = [];

    for (let i = 0; i < selectedEmpIds.length; i++) {
      const empId = selectedEmpIds[i];
      const empName =
        employees.find((e) => e.id === empId)?.full_name ?? `Employee ${empId}`;
      setProgress(`Assigning ${i + 1} of ${selectedEmpIds.length}...`);

      try {
        const res = await fetch("http://127.0.0.1:8000/api/bonus-karyawan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: JSON.stringify({
            employee_id: empId,
            bonus_id: Number(formData.bonus_id),
            bonus_date: formData.bonus_date,
            final_amount: finalAmount,
          }),
        });

        if (res.ok) {
          successCount++;
        } else {
          failed.push(empName);
        }
      } catch {
        failed.push(empName);
      }
    }

    setIsSubmitting(false);
    setProgress("");

    if (failed.length > 0) {
      setError(`${successCount} assigned. Failed for: ${failed.join(", ")}`);
    }

    if (successCount > 0) {
      onSuccess();
    }

    if (failed.length === 0) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ bonus_id: "", bonus_date: "" });
    setSelectedPreset(null);
    setProjectValue("");
    setFinalAmount(null);
    setSelectedEmpIds([]);
    setEmpSearch("");
    setError("");
    setProgress("");
    onClose();
  };

  const allFilteredSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((e) => selectedEmpIds.includes(e.id));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Bonus">
      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Employee multi-select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Karyawan
            {selectedEmpIds.length > 0 && (
              <span className="ml-2 text-xs text-slate-500 font-normal">
                {selectedEmpIds.length} selected
              </span>
            )}
          </label>

          {/* Search */}
          <input
            type="text"
            placeholder="Search employees..."
            value={empSearch}
            onChange={(e) => setEmpSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm mb-2"
          />

          {/* Select all */}
          <div className="flex items-center gap-2 px-1 mb-1">
            <input
              type="checkbox"
              id="select-all"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
              className="rounded"
            />
            <label
              htmlFor="select-all"
              className="text-xs text-gray-500 cursor-pointer"
            >
              {allFilteredSelected ? "Deselect all" : "Select all"}
              {empSearch ? " (filtered)" : ""}
            </label>
          </div>

          {/* Scrollable checkbox list */}
          <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
            {filteredEmployees.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">
                No employees found.
              </p>
            ) : (
              filteredEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEmpIds.includes(emp.id)}
                    onChange={() => toggleEmployee(emp.id)}
                    className="rounded"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {emp.full_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {emp.department?.name || emp.department}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Bonus Preset */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bonus Preset
          </label>
          <select
            name="bonus_id"
            value={formData.bonus_id}
            onChange={handleBonusChange}
            className="border rounded-lg px-3 py-2 w-full text-sm"
          >
            <option value="">Select bonus preset...</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} —{" "}
                {p.type === "fixed" ? formatIDR(p.amount) : `${p.amount}%`}
              </option>
            ))}
          </select>
        </div>

        {/* Preset details + calculation */}
        {selectedPreset && (
          <div className="bg-slate-50 rounded-lg p-3 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  selectedPreset.type === "fixed"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {selectedPreset.type === "fixed" ? "Fixed" : "Percentage"}
              </span>
            </div>

            {selectedPreset.type === "fixed" && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-green-600">
                  {formatIDR(selectedPreset.amount)}
                </span>
              </div>
            )}

            {selectedPreset.type === "percentage" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rate</span>
                  <span className="font-medium">{selectedPreset.amount}%</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Proyek (IDR)
                  </label>
                  <input
                    type="number"
                    value={projectValue}
                    onChange={handleProjectValueChange}
                    placeholder="Masukkan nilai proyek..."
                    className="border rounded-lg px-3 py-2 w-full text-sm"
                  />
                </div>
                {finalAmount !== null && (
                  <div className="flex justify-between text-sm pt-1 border-t border-slate-200">
                    <span className="text-gray-500">
                      {selectedPreset.amount}% × {formatIDR(projectValue)}
                    </span>
                    <span className="font-semibold text-green-600">
                      = {formatIDR(finalAmount)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Bonus Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Bonus
          </label>
          <input
            type="date"
            name="bonus_date"
            value={formData.bonus_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bonus_date: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Bonus akan muncul di slip gaji bulan yang dipilih.
          </p>
        </div>

        {/* Progress */}
        {progress && (
          <p className="text-xs text-slate-500 text-center">{progress}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
          >
            {isSubmitting
              ? progress || "Assigning..."
              : `Assign to ${selectedEmpIds.length || ""} Employee${selectedEmpIds.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CreateBonusAssignmentModal;
