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
        $table->foreignId('approved_by')->nullable()->change();
    });
}

public function down(): void
{
    Schema::table('overtime_schedules', function (Blueprint $table) {
        $table->foreignId('approved_by')->nullable(false)->change();
    });
}
};
