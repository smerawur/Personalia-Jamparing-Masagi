<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::table('overtime_schedules', function (Blueprint $table) {
        $table->string('jam_mulai')->nullable();
        $table->string('jam_selesai')->nullable();
        $table->string('approved_jam_mulai')->nullable();
        $table->string('approved_jam_selesai')->nullable();
        // approved_by sudah ada, hapus baris itu
    });
}

public function down(): void
{
    Schema::table('overtime_schedules', function (Blueprint $table) {
        $table->dropColumn(['jam_mulai', 'jam_selesai', 'approved_jam_mulai', 'approved_jam_selesai']);
    });
}
};
