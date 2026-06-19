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

        Schema::table('contracts', function (Blueprint $table) {
            $table->string('tunjangan_jabatan')->after('base_salary');
            $table->decimal('potongan', 12, 2)->after('tunjangan_jabatan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('nip');
        });

        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn('tunjangan_jabatan');
            $table->dropColumn('potongan');
        });
    }
};
