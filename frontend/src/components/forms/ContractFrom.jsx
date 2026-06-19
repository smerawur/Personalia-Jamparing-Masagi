import { useState, useEffect } from "react";

function ContractForm({
  onSubmit,
  initialData = {},
  isSubmitting,
  disableEmployeeId = false,
}) {
  const [form, setForm] = useState({
    employee_id: "",
    base_salary: "",
    tunjangan_jabatan: "",
    potongan: "",
    contract_type: "",
    start_date: "",
    end_date: "",
  });
  const [employees, setEmployees] = useState([]);

  const token = localStorage.getItem("token");

  // Initialize form with initial data
  useEffect(() => {
    setForm({
      employee_id: initialData.employee_id
        ? String(initialData.employee_id)
        : "",
      base_salary: initialData.base_salary
        ? String(initialData.base_salary)
        : "",
      tunjangan_jabatan: initialData.tunjangan_jabatan
        ? String(initialData.tunjangan_jabatan)
        : "",
      potongan: initialData.potongan ? String(initialData.potongan) : "",
      contract_type: initialData.contract_type || "",
      start_date: initialData.start_date || "",
      end_date: initialData.end_date || "",
    });
  }, [initialData?.id]);

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/employees", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        setEmployees(data.data || data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiresEndDate = ["PKWT", "Temporary"].includes(form.contract_type);

    onSubmit({
      employee_id: Number(form.employee_id),
      base_salary: Number(form.base_salary),
      tunjangan_jabatan: Number(form.tunjangan_jabatan),
      potongan: Number(form.potongan),
      contract_type: form.contract_type,
      start_date: form.start_date,
      end_date: requiresEndDate ? form.end_date : null,
    });
  };

  const requiresEndDate = ["PKWT", "Temporary"].includes(form.contract_type);

  return (
    <form onSubmit={handleSubmit}>
      {/* Employee */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Karyawan</label>
        <select
          name="employee_id"
          className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={form.employee_id}
          onChange={handleChange}
          required
          disabled={disableEmployeeId}
        >
          <option value="">Select Karyawan</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Base Salary */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Gaji Pokok</label>
        <input
          type="number"
          name="base_salary"
          className="w-full border rounded-lg px-3 py-2"
          value={form.base_salary}
          onChange={handleChange}
          placeholder="e.g. 5000000"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">
          Tunjangan Jabatan
        </label>
        <input
          type="number"
          name="tunjangan_jabatan"
          className="w-full border rounded-lg px-3 py-2"
          value={form.tunjangan_jabatan}
          onChange={handleChange}
          placeholder="e.g. 1000000"
        />
      </div>

      {/* Contract Type */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Jenis Kontrak</label>
        <select
          name="contract_type"
          className="w-full border rounded-lg px-3 py-2"
          value={form.contract_type}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="PKWTT">PKWTT</option>
          <option value="PKWT">PKWT</option>
          <option value="Temporary">Temporary</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Potongan</label>
        <input
          type="number"
          name="potongan"
          className="w-full border rounded-lg px-3 py-2"
          value={form.potongan}
          onChange={handleChange}
          placeholder="e.g. 500000"
        />
      </div>

      {/* Start Date */}
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
        <input
          type="date"
          name="start_date"
          className="w-full border rounded-lg px-3 py-2"
          value={form.start_date}
          onChange={handleChange}
          required
        />
      </div>

      {/* End Date */}
      {requiresEndDate && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Tanggal Selesai
          </label>
          <input
            type="date"
            name="end_date"
            className="w-full border rounded-lg px-3 py-2"
            value={form.end_date}
            onChange={handleChange}
            required
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-slate-900 text-white py-2 rounded-lg"
      >
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

export default ContractForm;
