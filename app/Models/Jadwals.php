<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jadwals extends Model
{
    use HasFactory;

    public function employees()
    {
        return $this->hasMany(Employee::class);     
    }

    protected $fillable = [
        'jam_masuk',
        'jam_keluar',
        'toleransi',
    ];
}
