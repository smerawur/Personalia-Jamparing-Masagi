import { useState } from "react";

function AdminChangePassword() {
  const [formData, setFormData] = useState({
    current_password:          "",
    new_password:              "",
    new_password_confirmation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState("");
  const [fieldErrors, setFieldErrors]   = useState({});
  const [success, setSuccess]           = useState(false);

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
          Authorization:  `Bearer ${token}`,
          Accept:         "application/json",
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

      setSuccess(true);
      setFormData({
        current_password:          "",
        new_password:              "",
        new_password_confirmation: "",
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ubah Password</h2>
        <p className="text-sm text-gray-500 mt-1">
        Pastikan password baru Anda kuat dan mudah diingat.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4">
            Password berhasil diubah.
          </div>
        )}

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
              placeholder="Enter current password"
              className={`border rounded-lg px-3 py-2 w-full text-sm ${
                fieldErrors.current_password ? "border-red-400" : "border-gray-300"
              }`}
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
              placeholder="At least 8 characters"
              className={`border rounded-lg px-3 py-2 w-full text-sm ${
                fieldErrors.new_password ? "border-red-400" : "border-gray-300"
              }`}
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
              placeholder="Repeat new password"
              className={`border rounded-lg px-3 py-2 w-full text-sm ${
                fieldErrors.new_password_confirmation
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
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
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
          >
            {isSubmitting ? "Saving..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminChangePassword;