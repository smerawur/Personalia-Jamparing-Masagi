<?php

namespace App\Http\Controllers;

use App\Http\Resources\BonusKaryawanResource;
use App\Models\BonusKaryawan;
use App\Models\Salary;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BonusKaryawanController extends Controller
{
    /**
     * List all bonus assignments (admin only).
     * Supports search by employee name, filter by month+year.
     */
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = BonusKaryawan::with(['employee', 'bonus', 'salary']);

        if ($request->search) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->month) {
            $query->whereMonth('bonus_date', $request->month);
        }

        if ($request->year) {
            $query->whereYear('bonus_date', $request->year);
        }

        return BonusKaryawanResource::collection($query->latest('bonus_date')->paginate(10));
    }

    /**
     * Assign a bonus to an employee (admin only).
     * final_amount is calculated on the frontend and sent directly.
     * If a pending salary exists for this employee+period, auto-link
     * and recalculate the salary totals.
     */
    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'employee_id'  => 'required|exists:employees,id',
            'bonus_id'     => 'required|exists:bonuses,id',
            'bonus_date'   => 'required|date',
            'final_amount' => 'required|numeric|min:0',
        ]);

        $bonusKaryawan = BonusKaryawan::create($request->only([
            'employee_id',
            'bonus_id',
            'bonus_date',
            'final_amount',
        ]));

        // Auto-link to pending salary if one exists for this period
        $bonusDate = Carbon::parse($bonusKaryawan->bonus_date);

        $salary = Salary::where('employee_id', $bonusKaryawan->employee_id)
            ->where('month', $bonusDate->month)
            ->where('year', $bonusDate->year)
            ->where('status', 'pending')
            ->first();

        if ($salary) {
            $bonusKaryawan->update(['salary_id' => $salary->id]);
            $this->recalculateSalary($salary);
        }

        return new BonusKaryawanResource($bonusKaryawan->load(['employee', 'bonus', 'salary']));
    }

    /**
     * Update a bonus assignment (admin only).
     * Locked if linked salary is paid.
     * Recalculates salary if still pending.
     */
    public function update(Request $request, BonusKaryawan $bonusKaryawan)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($bonusKaryawan->salary && $bonusKaryawan->salary->status === 'paid') {
            return response()->json([
                'error' => 'This bonus is part of a salary that has already been paid and cannot be edited.',
            ], 422);
        }

        $request->validate([
            'bonus_date'   => 'required|date',
            'final_amount' => 'required|numeric|min:0',
        ]);

        $bonusKaryawan->update($request->only(['bonus_date', 'final_amount']));

        // Reload salary relation after update to avoid stale cached data
        if ($bonusKaryawan->salary_id) {
            $bonusKaryawan->load('salary');
            if ($bonusKaryawan->salary && $bonusKaryawan->salary->status === 'pending') {
                $this->recalculateSalary($bonusKaryawan->salary);
            }
        }

        return new BonusKaryawanResource($bonusKaryawan->load(['employee', 'bonus', 'salary']));
    }

    /**
     * Delete a bonus assignment (admin only).
     * Locked if linked salary is paid.
     * Recalculates salary if still pending.
     */
    public function destroy(BonusKaryawan $bonusKaryawan)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($bonusKaryawan->salary && $bonusKaryawan->salary->status === 'paid') {
            return response()->json([
                'error' => 'This bonus is part of a salary that has already been paid and cannot be deleted.',
            ], 422);
        }

        // Fetch fresh salary data before delete to avoid stale relation
        $salary = $bonusKaryawan->salary_id ? Salary::find($bonusKaryawan->salary_id) : null;

        $bonusKaryawan->delete();

        if ($salary && $salary->status === 'pending') {
            $this->recalculateSalary($salary);
        }

        return response()->json(['message' => 'Bonus assignment deleted successfully.']);
    }

    /**
     * Recalculate a salary's bonus total and total_salary
     * based on current bonus_karyawan rows linked to it.
     */
    private function recalculateSalary(Salary $salary): void
    {
        $newBonusTotal = BonusKaryawan::where('salary_id', $salary->id)->sum('final_amount');

        $salary->update([
            'bonus'        => $newBonusTotal,
            'total_salary' => $salary->base_salary + $salary->overtime_pay + $newBonusTotal - $salary->deductions,
        ]);
    }
}
