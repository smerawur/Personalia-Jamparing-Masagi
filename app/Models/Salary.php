<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'contract_id',
        'month',
        'year',
        'base_salary',
        'overtime_pay',
        'bonus',
        'deductions',
        'total_salary',
        'status',
        'paid_at',
        'tunjangan_jabatan',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
