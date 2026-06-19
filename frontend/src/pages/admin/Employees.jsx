import { useEffect, useState } from "react";
import CreateEmployeeModal from "../../components/modals/CreateEmployeeModal";
import EmployeeDetailModal from "../../components/modals/EmployeeDetailModal";
import Pagination from "../../components/ui/Pagination";

function EmployeeAvatar({ employee }) {
  if (employee.photo_url) {
    return (
      <img
        src={employee.photo_url}
        alt={employee.full_name}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
      {employee.full_name?.charAt(0).toUpperCase()}
    </div>
  );
}

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      setDepartments(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (department) params.append("department_id", department);
    if (page) params.append("page", page);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/employees?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setEmployees(data.data || data);
      setMeta(data.meta || null);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message || "Failed to fetch employees");
      setEmployees([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page]);

  const handlePageChange = (newPage) => setPage(newPage);

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Karyawan</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm"
        >
          + Tambah Karyawan
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search name or email..."
          className="border rounded-lg px-3 py-2 w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <button
          onClick={fetchEmployees}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-blue-700 text-sm">
          Loading Karyawan...
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-center text-gray-400 text-xs">#</th>
              <th className="p-2 text-left">Photo</th>
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-left">NIP</th>
              <th className="p-2 text-left">Departemen</th>
              <th className="p-2 text-left">Telepon</th>
              <th className="p-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Tidak ada karyawan yang ditemukan.
                </td>
              </tr>
            ) : (
              employees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(emp)}
                >
                  <td className="p-2 text-center text-gray-400 text-xs">
                    {(meta?.from ?? 1) + index}
                  </td>
                  <td className="p-2">
                    <EmployeeAvatar employee={emp} />
                  </td>
                  <td className="p-2 font-medium">{emp.full_name}</td>
                  <td className="p-2 text-gray-600">{emp.nip ?? "—"}</td>
                  <td className="p-2 text-gray-600">
                    {emp.department?.name ?? "—"}
                  </td>
                  <td className="p-2 text-gray-600">{emp.phone}</td>
                  <td className="p-2 text-gray-600">{emp.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={handlePageChange} />

      <CreateEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchEmployees}
      />
      <EmployeeDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedEmployee(null);
        }}
        onSuccess={fetchEmployees}
        employee={selectedEmployee}
      />
    </div>
  );
}

export default Employees;
