<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BonusKaryawan extends Model
{
    protected $table = 'bonus_karyawan';

    protected $fillable = [
        'employee_id',
        'bonus_id',
        'bonus_date',
        'final_amount',
        'salary_id',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function bonus()
    {
        return $this->belongsTo(Bonus::class);
    }

    public function salary()
    {
        return $this->belongsTo(Salary::class);
    }
}