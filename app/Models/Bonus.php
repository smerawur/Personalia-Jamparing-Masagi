<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bonus extends Model
{
    protected $fillable = [
        'name',
        'amount',
        'type',
    ];

    /**
     * A bonus preset can be assigned to many employees.
     */
    public function bonusKaryawan()
    {
        return $this->hasMany(BonusKaryawan::class);
    }
}