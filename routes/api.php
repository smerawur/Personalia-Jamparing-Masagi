<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AbsensisController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\JadwalController;
use App\Http\Controllers\OvertimeController;
use App\Http\Controllers\BonusController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeDashboardController;
use App\Http\Controllers\MyProfileController;
use App\Http\Controllers\BonusKaryawanController;
use App\Http\Controllers\DepartmentController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/holidays', [EmployeeDashboardController::class, 'getHolidays']); // ← public, tanpa auth

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/employee-dashboard', [EmployeeDashboardController::class, 'index']);
    Route::get('/me', fn(Request $r) => $r->user());
    Route::apiResource('employees', EmployeeController::class);
    Route::get('absensis/bulan-list', [AbsensisController::class, 'bulanList']);
    Route::get('/jadwal-aktif', [JadwalController::class, 'jadwalAktif']);
    Route::apiResource('absensis', AbsensisController::class);
    Route::apiResource('salaries', SalaryController::class);
    Route::apiResource('contracts', ContractController::class);
    Route::post('/contracts/{id}/end', [ContractController::class, 'endContract']);
    Route::apiResource('jadwals', JadwalController::class);
    Route::apiResource('overtimes', OvertimeController::class);
    Route::apiResource('departments', DepartmentController::class);
    Route::patch('overtimes/{overtime}/approve', [OvertimeController::class, 'approve']);
    Route::patch('overtimes/{overtime}/reject', [OvertimeController::class, 'reject']);
    Route::patch('absensis/{absensi}/approve', [AbsensisController::class, 'approve']);
    Route::patch('absensis/{absensi}/reject',  [AbsensisController::class, 'reject']);
    Route::patch('salaries/{salary}/pay', [SalaryController::class, 'pay']);
    Route::post('salaries/generate', [SalaryController::class, 'generate']);
    Route::apiResource('bonuses', BonusController::class);
    Route::apiResource('bonus-karyawan', BonusKaryawanController::class);
    Route::get('/my-salary', [SalaryController::class, 'mySalary']);
    Route::get('/my-profile', [MyProfileController::class, 'show']);
    Route::post('/my-profile', [MyProfileController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/my-contract', [ContractController::class, 'myContract']);
    Route::get('/employee-dashboard/holidays', [EmployeeDashboardController::class, 'getHolidays']);
});