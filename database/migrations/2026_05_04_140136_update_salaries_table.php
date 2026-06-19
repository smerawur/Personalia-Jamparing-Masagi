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
            $table->renameColumn('date', 'period');
            
            $table->decimal('base_salary', 12, 2)->change();
            $table->decimal('overtime_pay', 12, 2)->default(0);
            $table->decimal('deductions', 12, 2)->default(0)->change();
            $table->decimal('total_salary', 12, 2)->change();

            $table->enum('status', ['pending', 'paid'])->default('pending');

            $table->timestamp('paid_at')->nullable();

            $table->unique(['employee_id', 'period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salaries', function (Blueprint $table) {
            $table->renameColumn('period', 'date');
            $table->dropColumn('overtime_pay');
            $table->dropColumn('status');
            $table->dropColumn('paid_at');
             $table->integer('base_salary')->unsigned()->change();
             $table->integer('deductions')->unsigned()->default(0)->change();
             $table->integer('total_salary')->unsigned()->change();
        });
    }
};
