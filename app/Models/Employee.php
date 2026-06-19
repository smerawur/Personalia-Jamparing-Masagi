<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Absensis;
use App\Models\Jadwals;
use App\Models\Department;

class Employee extends Model
{
    use HasFactory;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwals::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function attendances()
    {
        return $this->hasMany(Absensis::class);
    }

    public function overtimes()
    {
        return $this->hasMany(OvertimeSchedule::class);
    }

    public function bonuses()
    {
        return $this->hasMany(Bonus::class);
    }

    public function contract()
    {
        return $this->hasOne(Contract::class);
    }


    protected $fillable = [
        'user_id',
        'full_name',
        'nip',
        'address',
        'phone',
        'position',
        'department_id',
        'jadwal_id',
        'photo',
    ];
}
