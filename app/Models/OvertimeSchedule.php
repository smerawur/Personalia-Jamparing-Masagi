<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OvertimeSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'overtime_date',
        'jam_mulai',
        'jam_selesai',
        'approved_jam_mulai',
        'approved_jam_selesai',
        'reason',
        'status',
        'approved_by',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}