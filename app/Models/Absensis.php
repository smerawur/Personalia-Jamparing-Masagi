<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Absensis extends Model
{
    use HasFactory;

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Explicit table name (migration created `absenses`).
     */
    protected $table = 'absenses';

    protected $fillable = [
        'employee_id',
        'date',
        'status',
        'image_path',
        'latitude',
        'longitude',
        'address',
        'keterangan',
        'approval_status',
    ];
}
