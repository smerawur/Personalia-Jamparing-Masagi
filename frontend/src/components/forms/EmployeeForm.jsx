import { useState, useEffect, useRef } from "react";
import { Camera } from "lucide-react";

function EmployeeForm({ onSubmit, initialData = {}, isSubmitting }) {
  const [form, setForm] = useState({
    full_name: "",
    nip: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department_id: "",
    jadwal_id: "",
  });

  const [jadwals, setJadwals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setForm({
      full_name: initialData.full_name || "",
      nip: initialData.nip || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      address: initialData.address || "",
      position: initialData.position || "",
      department_id: initialData.department_id || "",
      jadwal_id: initialData.jadwal_id || "",
    });
    // Reset photo state when switching employees
    setPhotoFile(null);
    setPhotoPreview(null);
  }, [initialData?.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jadwalRes, deptRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/jadwals", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
          fetch("http://127.0.0.1:8000/api/departments", {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
        ]);
        const [jadwalData, deptData] = await Promise.all([
          jadwalRes.json(),
          deptRes.json(),
        ]);
        setJadwals(jadwalData.data || jadwalData);
        setDepartments(deptData.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate department is selected
    if (!form.department_id || form.department_id === "") {
      alert("Please select a department");
      return;
    }

    // Always send as FormData so photo upload works
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") {
        // Only append non-empty values
        formData.append(key, value);
      }
    });
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    onSubmit(formData);
  };

  const currentPhoto = photoPreview || initialData.photo_url;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt="Employee"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {form.full_name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-slate-900 text-white p-1.5 rounded-full hover:bg-slate-700 shadow"
          >
            <Camera size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-gray-400">
          {photoFile ? (
            <span className="text-blue-600">New photo selected</span>
          ) : (
            "Click Kamera icon to upload photo (jpg/jpeg/png/webp)"
          )}
        </p>
      </div>

      {/* Full Name */}
      <input
        name="full_name"
        placeholder="Nama Lengkap"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.full_name}
        onChange={handleChange}
        required
      />

      <input
        name="nip"
        type="number"
        placeholder="NIP"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.nip}
        onChange={handleChange}
      />

      {/* Email */}
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.email}
        onChange={handleChange}
        required
      />

      {/* Phone */}
      <input
        name="phone"
        placeholder="Telepon"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.phone}
        onChange={handleChange}
      />

      {/* Address */}
      <textarea
        name="address"
        placeholder="Alamat"
        rows={2}
        className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
        value={form.address}
        onChange={handleChange}
      />

      {/* Position */}
      <input
        name="position"
        placeholder="Jabatan"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.position}
        onChange={handleChange}
      />

      {/* Department */}
      <select
        name="department_id"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.department_id}
        onChange={handleChange}
        required
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>

      {/* Schedule */}
      <select
        name="jadwal_id"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.jadwal_id}
        onChange={handleChange}
        required
      >
        <option value="">Select Jadwal</option>
        {jadwals.map((j) => (
          <option key={j.id} value={j.id}>
            {typeof j.jam_masuk === "object"
              ? j.jam_masuk?.name || j.jam_masuk
              : j.jam_masuk}{" "}
            -{" "}
            {typeof j.jam_keluar === "object"
              ? j.jam_keluar?.name || j.jam_keluar
              : j.jam_keluar}{" "}
            (Toleransi: {j.toleransi} min)
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
      >
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}

export default EmployeeForm;
