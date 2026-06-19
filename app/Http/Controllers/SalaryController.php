<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use App\Http\Requests\StoreSalaryRequest;
use App\Http\Requests\UpdateSalaryRequest;
use App\Http\Resources\SalaryResource;
use App\Models\Absensis;
use App\Models\BonusKaryawan;
use App\Models\Contract;
use App\Models\Employee;
use App\Models\OvertimeSchedule;
use App\Models\Salary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SalaryController extends Controller
{
    /**
     * List all salaries (admin only).
     */
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = Salary::with('employee');

        if ($request->month) {
            $query->where('month', $request->month);
        }

        if ($request->year) {
            $query->where('year', $request->year);
        }

        if ($request->search) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('full_name', 'like', '%' . $request->search . '%');
            });
        }

        return SalaryResource::collection($query->paginate(10));
    }

    /**
     * Get the authenticated employee's own salary history.
     */
    public function mySalary(Request $request)
    {
        $employee = Employee::where('user_id', auth()->id())->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $query = Salary::where('employee_id', $employee->id)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc');

        if ($request->month) {
            $query->where('month', $request->month);
        }

        if ($request->year) {
            $query->where('year', $request->year);
        }

        return SalaryResource::collection($query->get());
    }

    /**
     * Manually create a salary record.
     */
    public function store(StoreSalaryRequest $request)
    {
        $salary = Salary::create($request->validated());
        return new SalaryResource($salary);
    }

    /**
     * Update a salary record.
     */
    public function update(UpdateSalaryRequest $request, Salary $salary)
    {
        $salary->update($request->validated());
        return new SalaryResource($salary);
    }

    /**
     * Delete a pending salary (admin only).
     */
    public function destroy(Salary $salary)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($salary->status === 'paid') {
            return response()->json(['error' => 'Paid salaries cannot be deleted.'], 422);
        }

        BonusKaryawan::where('salary_id', $salary->id)
            ->update(['salary_id' => null]);

        $salary->delete();

        return response()->json(['message' => 'Salary deleted successfully.']);
    }

    /**
     * Mark a salary as paid.
     */
    public function pay(Salary $salary)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($salary->status === 'paid') {
            return response()->json(['error' => 'Salary is already marked as paid'], 422);
        }

        $salary->update([
            'status'  => 'paid',
            'paid_at' => Carbon::now(),
        ]);

        return new SalaryResource($salary);
    }

    /**
     * Generate salaries for all employees for a given month and year.
     */
    public function generate(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year'  => 'required|integer|min:2000',
        ]);

        $month = (int) $request->month;
        $year  = (int) $request->year;

        // Fetch holiday dates once for the whole generation run
        $holidayDates = $this->fetchHolidayDates($year, $month);

        $employees = Employee::all();
        $generated = 0;
        $skipped   = [];

        foreach ($employees as $employee) {

            $exists = Salary::where('employee_id', $employee->id)
                ->where('month', $month)
                ->where('year', $year)
                ->exists();

            if ($exists) {
                $skipped[] = $employee->full_name . ' (already generated)';
                continue;
            }

            $contract = Contract::where('employee_id', $employee->id)
                ->where('start_date', '<=', Carbon::create($year, $month)->endOfMonth())
                ->where(function ($q) use ($year, $month) {
                    $q->whereNull('end_date')
                      ->orWhere('end_date', '>=', Carbon::create($year, $month)->startOfMonth());
                })
                ->latest('start_date')
                ->first();

            if (!$contract) {
                $skipped[] = $employee->full_name . ' (no active contract)';
                continue;
            }

            $baseSalary       = $contract->base_salary;
            $tunjanganJabatan = $contract->tunjangan_jabatan;
            $potonganPerHari  = $contract->potongan;

            // Overtime
            $overtimeRecords = OvertimeSchedule::where('employee_id', $employee->id)
                ->whereMonth('overtime_date', $month)
                ->whereYear('overtime_date', $year)
                ->where('status', 'approved')
                ->get();

            $overtimeHours = $overtimeRecords->sum(function ($record) {
                if (!$record->jam_mulai || !$record->jam_selesai) return 0;
                $start = Carbon::parse($record->jam_mulai);
                $end   = Carbon::parse($record->jam_selesai);
                return $end->diffInHours($start);
            });

            $overtimePay = $overtimeHours * ($baseSalary / 173);

            // Deductions: absent days × potongan (holidays excluded)
            $absentDays = $this->countAbsentDays($employee->id, $month, $year, $holidayDates);
            $deductions = $absentDays * $potonganPerHari;

            // Bonus
            $bonusTotal = BonusKaryawan::where('employee_id', $employee->id)
                ->whereMonth('bonus_date', $month)
                ->whereYear('bonus_date', $year)
                ->whereNull('salary_id')
                ->sum('final_amount');

            $total = $baseSalary + $tunjanganJabatan + $overtimePay + $bonusTotal - $deductions;

            $salary = Salary::create([
                'employee_id'       => $employee->id,
                'contract_id'       => $contract->id,
                'month'             => $month,
                'year'              => $year,
                'base_salary'       => $baseSalary,
                'tunjangan_jabatan' => $tunjanganJabatan,
                'overtime_pay'      => $overtimePay,
                'bonus'             => $bonusTotal,
                'deductions'        => $deductions,
                'total_salary'      => $total,
                'status'            => 'pending',
            ]);

            BonusKaryawan::where('employee_id', $employee->id)
                ->whereMonth('bonus_date', $month)
                ->whereYear('bonus_date', $year)
                ->whereNull('salary_id')
                ->update(['salary_id' => $salary->id]);

            $generated++;
        }

        return response()->json([
            'message'   => "Salaries generated successfully. {$generated} record(s) created.",
            'generated' => $generated,
            'skipped'   => $skipped,
        ]);
    }

    /**
     * Fetch holiday dates from the external API for a given month+year.
     * Cached for 24 hours — fetched once per year, filtered per month.
     * Returns an empty array on failure so generation never breaks.
     */
    private function fetchHolidayDates(int $year, int $month): array
    {
        $cacheKey = "holidays_{$year}";

        $allHolidays = Cache::remember($cacheKey, now()->addHours(24), function () use ($year) {
            try {
                $response = Http::withHeaders([
                    'Accept' => 'application/json',
                ])->get('http://127.0.0.1:8000/api/holidays', [
                    'year'    => $year,
                    'api_key' => config('services.holiday.api_key'),
                ]);

                if (!$response->successful()) {
                    Log::warning("Holiday API returned {$response->status()}");
                    return [];
                }

                return $response->json('data', []);
            } catch (\Exception $e) {
                Log::error('Holiday API fetch failed: ' . $e->getMessage());
                return [];
            }
        });

        return collect($allHolidays)
            ->filter(fn($h) => Carbon::parse($h['date'])->month === $month)
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->toArray();
    }

    /**
     * Count absent days for the full month.
     * Excludes weekends and public holidays.
     */
    private function countAbsentDays(int $employeeId, int $month, int $year, array $holidayDates): int
    {
        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth   = Carbon::create($year, $month, 1)->endOfMonth();

        $accountedDates = Absensis::where('employee_id', $employeeId)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->whereIn('status', ['Masuk', 'Izin', 'Sakit', 'Cuti'])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->toArray();

        $absentCount = 0;
        foreach (CarbonPeriod::create($startOfMonth, $endOfMonth) as $day) {
            if ($day->isWeekend()) continue;
            if (in_array($day->toDateString(), $holidayDates)) continue;
            if (!in_array($day->toDateString(), $accountedDates)) {
                $absentCount++;
            }
        }

        return $absentCount;
    }
}