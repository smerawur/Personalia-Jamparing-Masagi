<?php

namespace App\Http\Controllers;

use App\Models\Absensis;
use App\Models\Employee;
use App\Http\Requests\StoreAbsenRequest;
use App\Http\Requests\UpdateAbsenRequest;
use App\Http\Resources\AbsensiResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class AbsensisController extends Controller
{
    /**
     * List attendance records.
     * Admin sees all employees (paginated); employees see only their own (all).
     * Supports search by name/email, filter by date or month.
     */
    public function index(Request $request)
    {
        $user  = auth()->user();
        $query = Absensis::with('employee');

        if ($request->search) {
            $search = $request->search;
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->date) {
            $query->whereDate('date', $request->date);
        }

        if ($request->month) {
            [$y, $m] = explode('-', $request->month);
            $query->whereYear('date', $y)->whereMonth('date', $m);
        }

        if ($request->year && !$request->month) {
            $query->whereYear('date', $request->year);
        }

        if ($user->role === 'admin') {
            return AbsensiResource::collection(
                $query->latest()->paginate(10)
            );
        }

        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['data' => []]);
        }

        return AbsensiResource::collection(
            $query->where('employee_id', $employee->id)->latest()->get()
        );
    }

    /**
     * List distinct months that have attendance records (for the employee).
     */
    public function bulanList()
    {
        $user     = auth()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['data' => []]);
        }

        $bulanList = Absensis::where('employee_id', $employee->id)
            ->selectRaw("DATE_FORMAT(date, '%Y-%m') as bulan")
            ->groupBy('bulan')
            ->orderByDesc('bulan')
            ->pluck('bulan');

        return response()->json(['data' => $bulanList]);
    }

    /**
     * Create a new attendance record.
     * Izin/Sakit/Cuti start as Pending; everything else is auto-Approved.
     */
    public function store(StoreAbsenRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('absensi', 'public');
        } else {
            $data['image_path'] = '';
        }

        $data['approval_status'] = in_array($data['status'], ['Izin', 'Sakit', 'Cuti'])
            ? 'Pending'
            : 'Approved';

        $absensi = Absensis::create($data);

        return new AbsensiResource($absensi);
    }

    /**
     * Update an attendance record.
     */
    public function update(UpdateAbsenRequest $request, Absensis $absensi)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($absensi->image_path && Storage::disk('public')->exists($absensi->image_path)) {
                Storage::disk('public')->delete($absensi->image_path);
            }
            $data['image_path'] = $request->file('image')->store('absensi', 'public');
        }

        $absensi->update($data);

        return new AbsensiResource($absensi);
    }

    /**
     * Approve a leave request (admin only).
     */
    public function approve(Absensis $absensi)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!in_array($absensi->status, ['Izin', 'Sakit', 'Cuti'])) {
            return response()->json(['message' => 'Only Izin/Sakit/Cuti can be approved.'], 422);
        }

        if ($absensi->approval_status !== 'Pending') {
            return response()->json(['message' => 'This record has already been processed.'], 422);
        }

        $absensi->update(['approval_status' => 'Approved']);

        return new AbsensiResource($absensi);
    }

    /**
     * Reject a leave request (admin only).
     */
    public function reject(Request $request, Absensis $absensi)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!in_array($absensi->status, ['Izin', 'Sakit', 'Cuti'])) {
            return response()->json(['message' => 'Only Izin/Sakit/Cuti can be rejected.'], 422);
        }

        if ($absensi->approval_status !== 'Pending') {
            return response()->json(['message' => 'This record has already been processed.'], 422);
        }

        $alasan = $request->input('alasan', '');

        $absensi->update([
            'approval_status' => 'Rejected',
            'keterangan'      => $absensi->keterangan . ($alasan ? ' || Rejection reason: ' . $alasan : ''),
        ]);

        return new AbsensiResource($absensi);
    }

    /**
     * Delete an attendance record.
     * Karyawan hanya boleh hapus milik sendiri yang masih Pending.
     */
    public function destroy(Absensis $absensi)
    {
        $user     = auth()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if ($user->role !== 'admin') {
            if (!$employee || $absensi->employee_id !== $employee->id) {
                return response()->json(['error' => 'Forbidden'], 403);
            }

            if ($absensi->approval_status !== 'Pending') {
                return response()->json(['error' => 'Hanya pengajuan Pending yang bisa dibatalkan.'], 422);
            }
        }

        if ($absensi->image_path && Storage::disk('public')->exists($absensi->image_path)) {
            Storage::disk('public')->delete($absensi->image_path);
        }

        $absensi->delete();

        return response()->json(['message' => 'Pengajuan berhasil dibatalkan.']);
    }
}