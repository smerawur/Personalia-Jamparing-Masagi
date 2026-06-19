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
        Schema::table('bonuses', function (Blueprint $table) {
            $table->foreignId('salary_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->renameColumn('date', 'bonus_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bonuses', function (Blueprint $table) {
            $table->dropForeign(['salary_id']);
            $table->dropColumn('salary_id');
            $table->renameColumn('bonus_date', 'date');
        });
    }
};
