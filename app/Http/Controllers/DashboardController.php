<?php

namespace App\Http\Controllers;

use App\Models\Absensis;
use App\Models\Contract;
use App\Models\Employee;
use App\Models\Salary;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $today = Carbon::today();

        // --- Stat Cards ---

        $totalActiveEmployees = Employee::where('status', 'active')->count();

        $pendingLeaves = Absensis::whereIn('status', ['Izin', 'Sakit', 'Cuti'])
            ->where('approval_status', 'Pending')
            ->count();

        $pendingSalaries = Salary::where('status', 'pending')->count();

        $expiringContracts = Contract::whereNotNull('end_date')
            ->whereDate('end_date', '>=', $today)
            ->whereDate('end_date', '<=', $today->copy()->addDays(30))
            ->count();

        // --- Recent Pending Leave Requests ---

        $recentLeaves = Absensis::with('employee')
            ->whereIn('status', ['Izin', 'Sakit', 'Cuti'])
            ->where('approval_status', 'Pending')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'id'            => $a->id,
                'employee_name' => $a->employee?->full_name ?? 'N/A',
                'status'        => $a->status,
                'date'          => $a->date,
                'keterangan'    => $a->keterangan,
            ]);

        // --- Recent Salary Records ---

        $recentSalaries = Salary::with('employee')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(fn($s) => [
                'id'            => $s->id,
                'employee_name' => $s->employee?->full_name ?? 'N/A',
                'month'         => $s->month,
                'year'          => $s->year,
                'total_salary'  => $s->total_salary,
                'status'        => $s->status,
            ]);

        return response()->json([
            'stats' => [
                'total_active_employees' => $totalActiveEmployees,
                'pending_leaves'         => $pendingLeaves,
                'pending_salaries'       => $pendingSalaries,
                'expiring_contracts'     => $expiringContracts,
            ],
            'recent_leaves'   => $recentLeaves,
            'recent_salaries' => $recentSalaries,
        ]);
    }
}