<?php

namespace App\Http\Controllers;

use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\OvertimeSchedule;
use App\Models\Employee;

class OvertimeController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return OvertimeSchedule::with('employee.user')
                ->orderBy('overtime_date', 'desc')
                ->get();
        }

        $employee = Employee::where('user_id', $user->id)->first();
        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $query = OvertimeSchedule::where('employee_id', $employee->id);
        if ($request->year) {
            $query->whereYear('overtime_date', $request->year);
        }

        return response()->json([
            'data' => $query->orderBy('overtime_date', 'desc')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'overtime_date' => 'required|date',
            'jam_mulai'     => 'nullable|date_format:H:i',
            'jam_selesai'   => 'nullable|date_format:H:i|after:jam_mulai',
            'reason'        => 'nullable|string',
        ]);

        $employee = Employee::where('user_id', auth()->id())->first();
        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $exists = OvertimeSchedule::where('employee_id', $employee->id)
            ->where('overtime_date', $request->overtime_date)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Sudah ada pengajuan lembur di tanggal ini',
            ], 422);
        }

        $overtime = OvertimeSchedule::create([
            'employee_id'   => $employee->id,
            'overtime_date' => $request->overtime_date,
            'jam_mulai'     => $request->jam_mulai,
            'jam_selesai'   => $request->jam_selesai,
            'reason'        => $request->reason,
            'status'        => 'pending',
        ]);

        // Send Telegram notification to HR
        try {
            (new TelegramService())->sendOvertimeNotification(
                employeeName: $employee->full_name,
                date: $request->overtime_date,
                jamMulai: $request->jam_mulai,
                jamSelesai: $request->jam_selesai,
                reason: $request->reason,
            );
        } catch (\Exception $e) {
            // Notification failure must never block the overtime submission
            Log::error('Telegram notification error: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Pengajuan lembur berhasil',
            'data'    => $overtime,
        ], 201);
    }

    public function approve(Request $request, OvertimeSchedule $overtime)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'approved_jam_mulai'   => 'nullable|date_format:H:i',
            'approved_jam_selesai' => 'nullable|date_format:H:i|after:approved_jam_mulai',
        ]);

        if ($overtime->status !== 'pending') {
            return response()->json(['message' => 'Pengajuan sudah diproses sebelumnya'], 422);
        }

        $overtime->update([
            'status'               => 'approved',
            'approved_by'          => auth()->id(),
            'approved_jam_mulai'   => $request->approved_jam_mulai   ?? $overtime->jam_mulai,
            'approved_jam_selesai' => $request->approved_jam_selesai ?? $overtime->jam_selesai,
        ]);

        return response()->json(['message' => 'Lembur disetujui', 'data' => $overtime]);
    }

    public function reject(Request $request, OvertimeSchedule $overtime)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($overtime->status !== 'pending') {
            return response()->json(['message' => 'Pengajuan sudah diproses sebelumnya'], 422);
        }

        $overtime->update([
            'status'      => 'rejected',
            'approved_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Lembur ditolak', 'data' => $overtime]);
    }

    public function destroy(OvertimeSchedule $overtime)
    {
        $user = auth()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if ($user->role !== 'admin') {
            if (!$employee || $overtime->employee_id !== $employee->id) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
            if ($overtime->status !== 'pending') {
                return response()->json(['error' => 'Only pending overtime requests can be deleted'], 422);
            }
        }

        $overtime->delete();
        return response()->json(null, 204);
    }
}
