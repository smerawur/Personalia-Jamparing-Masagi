import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";

const formatIDR = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount ?? 0);

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2 py-2 border-b last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">
        {value ?? "—"}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 lg:p-5">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function MyProfile() {
  const [profile, setProfile]         = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isEditing, setIsEditing]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess]         = useState("");

  const [formData, setFormData] = useState({ phone: "", address: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile]       = useState(null);

  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/my-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Profile fetch failed:", data);
        return;
      }

      setProfile(data);
      setFormData({ phone: data.phone ?? "", address: data.address ?? "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess("");
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    // Use FormData since we may be sending a file
    const form = new FormData();
    form.append("phone", formData.phone);
    form.append("address", formData.address);
    form.append("_method", "PATCH"); // Laravel method spoofing for multipart
    if (photoFile) form.append("photo", photoFile);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/my-profile", {
        method: "POST", // POST with _method=PATCH for multipart support
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: form,
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

      setSuccess("Profile updated successfully.");
      setIsEditing(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      fetchProfile();
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setFieldErrors({});
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({ phone: profile?.phone ?? "", address: profile?.address ?? "" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading profile...
      </div>
    );
  }

  const avatarSrc = photoPreview || profile?.photo_url;

  return (
    <div className="space-y-4 lg:space-y-6 ">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">My Profile</h2>
          <p className="text-sm text-gray-500 mt-1">{profile?.full_name}</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => { setIsEditing(true); setSuccess(""); }}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Photo + Name card */}
      <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={profile?.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-slate-400">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Camera button — only in edit mode */}
          {isEditing && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-slate-900 text-white p-1.5 rounded-full hover:bg-slate-700 shadow"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Name + job */}
        <div>
          <p className="text-lg font-bold text-gray-800">{profile?.full_name}</p>
          <p className="text-sm text-gray-500">{profile?.position}</p>
          <p className="text-sm text-gray-400">{profile?.department}</p>
          {isEditing && photoFile && (
            <p className="text-xs text-blue-600 mt-1">Photo telah dipilih — simpan untuk menerapkan</p>
          )}
        </div>
      </div>

      {/* Job Info */}
      <Section title="Informasi Pekerjaan">
        <InfoRow label="Posisi"   value={profile?.position} />
        <InfoRow label="Departemen" value={profile?.department} />
        <InfoRow label="Status" value={
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            profile?.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}>
            {profile?.status}
          </span>
        } />
      </Section>

      {/* Schedule */}
      <Section title="Jadwal Kerja">
        {profile?.jadwal ? (
          <>
            {profile.jadwal.name && (
              <InfoRow label="Jadwal"  value={profile.jadwal.name} />
            )}
            <InfoRow label="Check In"   value={profile.jadwal.jam_masuk} />
            <InfoRow label="Check Out"  value={profile.jadwal.jam_keluar} />
          </>
        ) : (
          <p className="text-sm text-gray-400">Jadwal belum ditentukan.</p>
        )}
      </Section>

      {/* Contract */}
      <Section title="Informasi Kontrak">
        {profile?.contract ? (
          <>
            <InfoRow label="Jenis Kontrak" value={profile.contract.contract_type} />
            <InfoRow label="Gaji Pokok"   value={formatIDR(profile.contract.base_salary)} />
            <InfoRow label="Tanggal Mulai"    value={profile.contract.start_date} />
            <InfoRow label="Tanggal Berakhir"      value={profile.contract.end_date ?? "Open-ended"} />
          </>
        ) : (
          <p className="text-sm text-gray-400">Kontrak aktif tidak ditemukan.</p>
        )}
      </Section>

      {/* Personal Info */}
      <Section title="Informasi Pribadi">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Email — read only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm bg-gray-50 text-gray-400">
                {profile?.email}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Email tidak dapat diubah. Hubungi admin jika ingin memperbarui email.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telepon
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`border rounded-lg px-3 py-2 w-full text-sm ${
                  fieldErrors.phone ? "border-red-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.phone[0]}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`border rounded-lg px-3 py-2 w-full text-sm resize-none ${
                  fieldErrors.address ? "border-red-400" : "border-gray-300"
                }`}
              />
              {fieldErrors.address && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.address[0]}</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <InfoRow label="Email"   value={profile?.email} />
            <InfoRow label="Phone"   value={profile?.phone} />
            <InfoRow label="Address" value={profile?.address} />
          </>
        )}
      </Section>
    </div>
  );
}

export default MyProfile;