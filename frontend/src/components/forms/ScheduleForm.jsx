import { useState, useEffect } from "react";

function ScheduleForm({ onSubmit, initialData = {}, isSubmitting }) {
  const [form, setForm] = useState({
    jam_masuk: "",
    jam_keluar: "",
    toleransi: "",
  });

  const [jadwals, setJadwals] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
  setForm({
    jam_masuk: initialData.jam_masuk || "",
    jam_keluar: initialData.jam_keluar || "",
    toleransi: initialData.toleransi || "",
  });
}, [initialData?.id]);

  useEffect(() => {
    const fetchJadwals = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/jadwals", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        setJadwals(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchJadwals();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="time"
        name="jam_masuk"
        placeholder="Jam Masuk"
        className="w-full border rounded-lg px-3 py-2 mb-3"
        value={form.jam_masuk}
        onChange={handleChange}
        required
      />

      <input
        type="time"
        name="jam_keluar"
        placeholder="Jam Keluar"
        className="w-full border rounded-lg px-3 py-2 mb-3"
        value={form.jam_keluar}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="toleransi"
        placeholder="Toleransi"
        className="w-full border rounded-lg px-3 py-2 mb-3"
        value={form.toleransi}
        onChange={handleChange}
        required
      />

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

export default ScheduleForm;