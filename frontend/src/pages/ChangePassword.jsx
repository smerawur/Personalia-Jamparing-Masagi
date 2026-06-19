import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ChangePassword() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        } else {
          setError(data.message || "Something went wrong");
        }
        return;
      }

      // Update user in context so must_change_password is now false
      setUser((prev) => ({ ...prev, must_change_password: false }));

      // Redirect based on role
      if (user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm w-full max-w-md p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            For your security, you must set a new password before continuing.
          </p>
        </div>

        {/* Global error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-2 w-full text-sm ${
                fieldErrors.current_password
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
              placeholder="Enter current password"
            />
            {fieldErrors.current_password && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.current_password[0]}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-2 w-full text-sm ${
                fieldErrors.new_password ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="At least 8 characters"
            />
            {fieldErrors.new_password && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.new_password[0]}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="new_password_confirmation"
              value={formData.new_password_confirmation}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-2 w-full text-sm ${
                fieldErrors.new_password_confirmation
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
              placeholder="Repeat new password"
            />
            {fieldErrors.new_password_confirmation && (
              <p className="text-red-500 text-xs mt-1">
                {fieldErrors.new_password_confirmation[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm mt-2"
          >
            {isSubmitting ? "Saving..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
