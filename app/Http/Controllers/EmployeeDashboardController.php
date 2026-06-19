<?php

namespace App\Http\Controllers;

use App\Models\Absensis;
use App\Models\Employee;
use App\Models\Salary;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmployeeDashboardController extends Controller
{
    public function index()
    {
        $user     = auth()->user();
        $employee = Employee::with(['user', 'jadwal', 'department'])
            ->where('user_id', $user->id)
            ->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $month = Carbon::now()->month;
        $year  = Carbon::now()->year;

        $attendances = Absensis::where('employee_id', $employee->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->get();

        $holidayDates = $this->fetchHolidayDatesRaw(month: $month, year: $year);

        $workingDays = $this->countWorkingDaysFullMonth($month, $year, $holidayDates);

        $jamMasuk  = $employee->jadwal?->jam_masuk ?? '08:00:00';
        $toleransi = $employee->jadwal?->toleransi ?? 0;

        [$jh, $jm]   = array_map('intval', explode(':', $jamMasuk));
        $batasLambat = ($jh * 60 + $jm) + (int) $toleransi;

        $daysPresent   = 0;
        $daysTerlambat = 0;

        foreach ($attendances->where('status', 'Masuk') as $record) {
            $menitMasuk = Carbon::parse($record->created_at)->hour * 60
                + Carbon::parse($record->created_at)->minute;

            if ($menitMasuk > $batasLambat) {
                $daysTerlambat++;
            } else {
                $daysPresent++;
            }
        }

        $daysLeave = $attendances
            ->whereIn('status', ['Izin', 'Sakit', 'Cuti'])
            ->unique('date')
            ->count();

        $accountedDates = $attendances
            ->whereIn('status', ['Masuk', 'Izin', 'Sakit', 'Cuti'])
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->toArray();

        $daysAbsent = $this->countAbsentDaysUntilToday($month, $year, $holidayDates, $accountedDates);

        $latestSalary = Salary::where('employee_id', $employee->id)
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->first();

        $pendingLeaves = Absensis::where('employee_id', $employee->id)
            ->whereIn('status', ['Izin', 'Sakit', 'Cuti'])
            ->where('approval_status', 'Pending')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'id'         => $a->id,
                'status'     => $a->status,
                'date'       => $a->date,
                'keterangan' => $a->keterangan,
            ]);

        return response()->json([
            'profile' => [
                'full_name'  => $employee->full_name,
                'email'      => $user->email,
                'phone'      => $employee->phone,
                'address'    => $employee->address,
                'position'   => $employee->position,
                'department' => $employee->department?->name,
                'status'     => $employee->status,
            ],
            'attendance' => [
                'month'          => $month,
                'year'           => $year,
                'working_days'   => $workingDays,
                'days_present'   => $daysPresent,
                'days_terlambat' => $daysTerlambat,
                'days_leave'     => $daysLeave,
                'days_absent'    => $daysAbsent,
            ],
            'latest_salary' => $latestSalary ? [
                'month'             => $latestSalary->month,
                'year'              => $latestSalary->year,
                'base_salary'       => $latestSalary->base_salary,
                'tunjangan_jabatan' => $latestSalary->tunjangan_jabatan,
                'overtime_pay'      => $latestSalary->overtime_pay,
                'bonus'             => $latestSalary->bonus,
                'deductions'        => $latestSalary->deductions,
                'total_salary'      => $latestSalary->total_salary,
                'status'            => $latestSalary->status,
                'paid_at'           => $latestSalary->paid_at,
            ] : null,
            'pending_leaves' => $pendingLeaves,
        ]);
    }

    /**
     * Fetch raw date strings only (untuk internal countWorkingDays, dll).
     * Tidak di-cache karena hanya 1 bulan dan dipakai di index().
     */
    private function fetchHolidayDatesRaw(int $year, int $month): array
    {
        try {
            $response = Http::get(config('services.holiday.api_url'), [
                'api_key' => config('services.holiday.api_key'),
                'country' => 'ID',
                'year'    => $year,
                'month'   => $month,
                'type'    => 'national',
            ]);

            if (!$response->successful()) {
                Log::warning("Holiday API returned {$response->status()}");
                return [];
            }

            return collect($response->json('response.holidays', []))
                ->pluck('date.iso')
                ->map(fn($d) => Carbon::parse($d)->toDateString())
                ->toArray();
        } catch (\Exception $e) {
            Log::error('Holiday API fetch failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch satu bulan, return array of {date, name}.
     * Dipakai oleh getHolidays() untuk build response frontend.
     */
    private function fetchHolidayObjects(int $year, int $month): array
    {
        try {
            $response = Http::get(config('services.holiday.api_url'), [
                'api_key' => config('services.holiday.api_key'),
                'country' => 'ID',
                'year'    => $year,
                'month'   => $month,
                'type'    => 'national',
            ]);

            if (!$response->successful()) {
                Log::warning("Holiday API returned {$response->status()} for {$year}-{$month}");
                return [];
            }

            return collect($response->json('response.holidays', []))
                ->map(fn($h) => [
                    'date' => Carbon::parse($h['date']['iso'])->toDateString(),
                    'name' => $h['name'],
                ])
                ->toArray();

        } catch (\Exception $e) {
            Log::error("Holiday API fetch failed ({$year}-{$month}): " . $e->getMessage());
            return [];
        }
    }

    private function countWorkingDaysFullMonth(int $month, int $year, array $holidayDates): int
    {
        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth   = Carbon::create($year, $month, 1)->endOfMonth();

        $count = 0;
        foreach (CarbonPeriod::create($startOfMonth, $endOfMonth) as $day) {
            if ($day->isWeekend()) continue;
            if (in_array($day->toDateString(), $holidayDates)) continue;
            $count++;
        }

        return $count;
    }

    private function countAbsentDaysUntilToday(
        int $month,
        int $year,
        array $holidayDates,
        array $accountedDates
    ): int {
        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth   = Carbon::create($year, $month, 1)->endOfMonth();

        $end = $endOfMonth->isAfter(Carbon::today()) ? Carbon::today() : $endOfMonth;

        $absentCount = 0;
        foreach (CarbonPeriod::create($startOfMonth, $end) as $day) {
            if ($day->isWeekend()) continue;
            if (in_array($day->toDateString(), $holidayDates)) continue;
            if (!in_array($day->toDateString(), $accountedDates)) {
                $absentCount++;
            }
        }

        return $absentCount;
    }

    /**
     * GET /holidays?year=2025
     * GET /holidays?year=2025&month=6  (opsional, untuk internal)
     *
     * Kalau tanpa month → fetch seluruh tahun (12 bulan), di-cache 7 hari.
     * Kalau dengan month → fetch 1 bulan saja, tidak di-cache.
     */
    public function getHolidays(Request $request)
    {
        $year  = (int) $request->query('year', Carbon::now()->year);
        $month = $request->query('month'); // null kalau tidak dikirim

        if ($month != null) {
            // Fetch 1 bulan (dipakai internal / debug)
            $holidays = $this->fetchHolidayObjects($year, (int) $month);

            return response()->json([
                'data'  => $holidays,
                'year'  => $year,
                'month' => (int) $month,
            ]);
        }

        // Fetch seluruh tahun, cache 7 hari supaya tidak 12x hit API tiap reload
        $cacheKey = "holidays_full_{$year}";
        $holidays = Cache::remember($cacheKey, now()->addDays(7), function () use ($year) {
            $all = [];
            for ($m = 1; $m <= 12; $m++) {
                $all = array_merge($all, $this->fetchHolidayObjects($year, $m));
            }
            // Deduplicate by date (jaga-jaga kalau API return duplikat)
            $seen   = [];
            $unique = [];
            foreach ($all as $h) {
                if (!isset($seen[$h['date']])) {
                    $seen[$h['date']] = true;
                    $unique[]         = $h;
                }
            }
            return $unique;
        });

        return response()->json([
            'data' => $holidays,
            'year' => $year,
        ]);
    }
}
