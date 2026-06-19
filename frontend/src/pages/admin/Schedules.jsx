import { useEffect, useState } from "react";
import CreateSchedulesModal from "../../components/modals/CreateScheduleModal";
import EditScheduleModal from "../../components/modals/EditScheduleModal";
import ConfirmModal from "../../components/ui/ConfirmModal";

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchJadwals = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/jadwals", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("STATUS:", res.status);

      const text = await res.text();

      console.log("API Response:", res);

      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", parseErr, text);
        data = null;
      }

      if (!res.ok) {
        console.error("API error:", res.status, text);
      }

      const schedulesList =
        data && Array.isArray(data)
          ? data
          : data && Array.isArray(data.data)
            ? data.data
            : data && Array.isArray(data.results)
              ? data.results
              : data && Array.isArray(data.schedules)
                ? data.schedules
                : [];

      setSchedules(schedulesList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJadwals();
  }, []);

  const handleDelete = async () => {
    if (!deletingSchedule) return;
    setIsDeleting(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/jadwals/${deletingSchedule.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        console.error("Failed to delete schedule:", res.status);
        return;
      }

      await fetchJadwals();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingSchedule(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Jadwal</h2>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          + Tambah Jadwal
        </button>
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Jam Masuk</th>
            <th className="p-2">Jam Keluar</th>
            <th className="p-2">Toleransi</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {schedules.map((sch) => (
            <tr key={sch.id} className="border-t">
              <td className="p-2">{sch.id}</td>
              <td className="p-2">{sch.jam_masuk}</td>
              <td className="p-2">{sch.jam_keluar}</td>
              <td className="p-2">{sch.toleransi} menit</td>
              <td className="p-2 text-center">
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setCurrentSchedule(sch);
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setDeletingSchedule(sch);
                      setDeleteError(null);
                      setIsConfirmOpen(true);
                    }}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CreateSchedulesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchJadwals}
      />
      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchJadwals}
        schedule={currentSchedule}
      />
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Schedule"
        message={
          deleteError
            ? deleteError
            : `Are you sure you want to delete "${deletingSchedule?.id}"? This cannot be undone.`
        }
      />
    </div>
  );
}

export default Schedules;
