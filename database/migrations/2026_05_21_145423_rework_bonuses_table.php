<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Wipe existing data since this is a full rework
        DB::table('bonuses')->truncate();

        Schema::table('bonuses', function (Blueprint $table) {
            // Drop foreign keys first before dropping columns
            $table->dropForeign(['employee_id']);
            $table->dropForeign(['salary_id']);

            // Now safe to drop the columns
            $table->dropColumn([
                'employee_id',
                'bonus_date',
                'salary_id',
                'reason',
            ]);

            // Add new columns
        });
    }

    public function down(): void
    {
        Schema::table('bonuses', function (Blueprint $table) {

            $table->bigInteger('employee_id')->unsigned()->nullable();
            $table->date('bonus_date')->nullable();
            $table->bigInteger('salary_id')->unsigned()->nullable();
            $table->string('reason')->nullable();
        });
    }
};