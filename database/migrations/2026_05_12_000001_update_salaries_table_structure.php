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
        Schema::table('salaries', function (Blueprint $table) {
            // Drop the old period column if it exists
            if (Schema::hasColumn('salaries', 'period')) {
                $table->dropColumn('period');
            }

            // Add month and year if they don't exist
            if (!Schema::hasColumn('salaries', 'month')) {
                $table->integer('month')->after('employee_id');
            }

            if (!Schema::hasColumn('salaries', 'year')) {
                $table->integer('year')->after('month');
            }

            // Add contract_id if it doesn't exist
            if (!Schema::hasColumn('salaries', 'contract_id')) {
                $table->foreignId('contract_id')->after('employee_id')->constrained()->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salaries', function (Blueprint $table) {
            if (Schema::hasColumn('salaries', 'month')) {
                $table->dropColumn('month');
            }

            if (Schema::hasColumn('salaries', 'year')) {
                $table->dropColumn('year');
            }

            if (Schema::hasColumn('salaries', 'contract_id')) {
                $table->dropForeign(['contract_id']);
                $table->dropColumn('contract_id');
            }
        });
    }
};
