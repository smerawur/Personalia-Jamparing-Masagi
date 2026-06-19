import { useState, useEffect } from "react";

function DepartmentForm({ onSubmit, initialData = {}, isSubmitting }) {
  const [form, setForm] = useState({
    name: "",
  });

  const [departments, setDepartments] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setForm({
      name: initialData.name || "",
    });
  }, [initialData?.id]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/departments", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDepartments();
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
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default DepartmentForm;