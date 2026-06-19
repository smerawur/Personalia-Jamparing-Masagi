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
    Schema::table('absenses', function (Blueprint $table) {
        $table->enum('approval_status', ['Pending', 'Approved', 'Rejected'])
              ->default('Approved') // ← Masuk/Pulang langsung Approved
              ->after('keterangan');
    });
}

public function down(): void
{
    Schema::table('absenses', function (Blueprint $table) {
        $table->dropColumn('approval_status');
    });
}
};
