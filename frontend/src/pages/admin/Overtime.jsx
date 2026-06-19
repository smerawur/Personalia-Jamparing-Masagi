import { useEffect, useState } from "react";

function Overtime() {
    const [overtimes, setOvertimes]         = useState([]);
    const [loading, setLoading]             = useState(true);
    const [approveModal, setApproveModal]   = useState(null); // menyimpan data overtime yang akan diapprove
    const [approvedJam, setApprovedJam]     = useState({ mulai: '', selesai: '' });
    const [processing, setProcessing]       = useState(false);
    const token = localStorage.getItem("token");

    const fetchOvertimes = async () => {
        setLoading(true);
        try {
            const res  = await fetch("http://127.0.0.1:8000/api/overtimes", {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });
            const data = await res.json();
            const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
            setOvertimes(list);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOvertimes(); }, []);

    // Buka modal approve — isi default dari jam pengajuan karyawan
    const bukaApprove = (ot) => {
        setApproveModal(ot);
        setApprovedJam({
            mulai   : ot.jam_mulai   ? ot.jam_mulai.slice(0, 5)   : '',
            selesai : ot.jam_selesai ? ot.jam_selesai.slice(0, 5) : '',
        });
    };

    const handleApprove = async () => {
        if (!approveModal) return;
        setProcessing(true);
        try {
            await fetch(`http://127.0.0.1:8000/api/overtimes/${approveModal.id}/approve`, {
                method  : "PATCH",
                headers : {
                    Authorization  : `Bearer ${token}`,
                    Accept         : "application/json",
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    approved_jam_mulai   : approvedJam.mulai   || null,
                    approved_jam_selesai : approvedJam.selesai || null,
                }),
            });
            setApproveModal(null);
            fetchOvertimes();
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (id) => {
        try {
            await fetch(`http://127.0.0.1:8000/api/overtimes/${id}/reject`, {
                method  : "PATCH",
                headers : { Authorization: `Bearer ${token}` },
            });
            fetchOvertimes();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Permintaan Lembur</h2>

            <table className="w-full border">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2">Karyawan</th>
                        <th className="p-2">Tanggal</th>
                        <th className="p-2">Alasan</th>
                        <th className="p-2">Jam Diajukan</th>
                        <th className="p-2">Jam Disetujui</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {overtimes.map((ot) => (
                        <tr key={ot.id} className="border-t">
                            <td className="p-2">{ot.employee.full_name}</td>
                            <td className="p-2">{ot.overtime_date}</td>
                            <td className="p-2">{ot.reason}</td>
                            <td className="p-2">
                                {ot.jam_mulai && ot.jam_selesai
                                    ? `${ot.jam_mulai.slice(0,5)} — ${ot.jam_selesai.slice(0,5)}`
                                    : '—'}
                            </td>
                            <td className="p-2">
                                {ot.status === 'approved' && ot.approved_jam_mulai && ot.approved_jam_selesai
                                    ? <span className="text-green-700 font-medium">
                                        {ot.approved_jam_mulai.slice(0,5)} — {ot.approved_jam_selesai.slice(0,5)}
                                      </span>
                                    : '—'}
                            </td>
                            <td className="p-2">
                                <span className={`px-2 py-1 rounded text-sm ${
                                    ot.status === 'approved' ? 'bg-green-100 text-green-600' :
                                    ot.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {ot.status}
                                </span>
                            </td>
                            <td className="p-2 space-x-2">
                                {ot.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => bukaApprove(ot)}
                                            className="px-3 py-1 bg-green-600 text-white rounded"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(ot.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal Approve */}
            {approveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-semibold mb-1">Approve Lembur</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {approveModal.employee.full_name} · {approveModal.overtime_date}
                        </p>

                        <div className="text-xs text-gray-400 mb-3">
                            Diajukan: {approveModal.jam_mulai?.slice(0,5) || '?'} — {approveModal.jam_selesai?.slice(0,5) || '?'}
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Jam Mulai Disetujui</label>
                            <input
                                type="time"
                                className="w-full border rounded px-3 py-2"
                                value={approvedJam.mulai}
                                onChange={e => setApprovedJam(p => ({ ...p, mulai: e.target.value }))}
                            />
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium mb-1">Jam Selesai Disetujui</label>
                            <input
                                type="time"
                                className="w-full border rounded px-3 py-2"
                                value={approvedJam.selesai}
                                onChange={e => setApprovedJam(p => ({ ...p, selesai: e.target.value }))}
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="flex-1 bg-green-600 text-white py-2 rounded font-medium disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Konfirmasi Approve'}
                            </button>
                            <button
                                onClick={() => setApproveModal(null)}
                                className="flex-1 border py-2 rounded font-medium"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Overtime;