<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bonus_karyawan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('bonus_id')->constrained('bonuses')->onDelete('cascade');
            $table->date('bonus_date');
            $table->decimal('final_amount', 12, 2);
            $table->foreignId('salary_id')->nullable()->constrained('salaries')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bonus_karyawan');
    }
};