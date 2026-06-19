import { useState, useEffect } from "react";

function BonusForm({
  onSubmit,
  initialData = {},
  isSubmitting,
  showEmployeeField = true,
}) {
  const [form, setForm] = useState({
    employee_id: "",
    amount: "",
    reason: "",
    bonus_date: "",
  });

  const [employees, setEmployees] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setForm({
      employee_id: initialData.employee_id || "",
      amount: initialData.amount || "",
      reason: initialData.reason || "",
      bonus_date: initialData.bonus_date || "",
    });
  }, [initialData?.id]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/employees?per_page=100",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        const data = await res.json();
        setEmployees(data.data || data);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    if (showEmployeeField) {
      fetchEmployees();
    }
  }, [showEmployeeField]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Employee */}
      {showEmployeeField ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Karyawan
          </label>
          <select
            name="employee_id"
            value={form.employee_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
            required
          >
            <option value="">Select karyawan...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Karyawan
          </label>
          <div className="border rounded-lg px-3 py-2 mb-3 bg-gray-50 text-gray-500 text-sm">
            {initialData.employee_name}
          </div>
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jumlah (IDR)
        </label>
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="e.g. 500000"
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          required
        />
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori
        </label>
        <select
          name="reason"
          value={form.reason}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          required
        >
          <option value="">Pilih kategori...</option>
          <option value="Performance bonus">bonus performa</option>
          <option value="Holiday allowance">tunjangan libur</option>
          <option value="Referral bonus">bonus referensi</option>
          <option value="Project completion">penyelesaian proyek</option>
          <option value="Other">lainnya</option>
        </select>
      </div>

      {/* Bonus Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanggal Bonus
        </label>
        <input
          type="date"
          name="bonus_date"
          value={form.bonus_date}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
          required
        />
        <p className="text-xs text-gray-400 mb-3">
          {showEmployeeField
            ? "This date determines which salary period the bonus is included in."
            : "Changing this date will affect which salary period this bonus is included in."}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
      >
        {isSubmitting ? "Saving..." : "Submit"}
      </button>
    </form>
  );
}

export default BonusForm;
