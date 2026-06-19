<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create departments table
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        // 2. Migrate existing unique department values from employees
        $existing = DB::table('employees')
            ->whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->pluck('department');

        foreach ($existing as $name) {
            DB::table('departments')->insertOrIgnore([
                'name'       => $name,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Add department_id to employees
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('department_id')
                  ->nullable()
                  ->after('department')
                  ->constrained('departments')
                  ->onDelete('restrict');
        });

        // 4. Populate department_id from existing string
        $departments = DB::table('departments')->get()->keyBy('name');

        DB::table('employees')->get()->each(function ($emp) use ($departments) {
            if ($emp->department && isset($departments[$emp->department])) {
                DB::table('employees')
                    ->where('id', $emp->id)
                    ->update(['department_id' => $departments[$emp->department]->id]);
            }
        });

        // 5. Drop old string column
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('department');
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->string('department')->nullable()->after('department_id');
        });

        DB::table('employees')->get()->each(function ($emp) {
            if ($emp->department_id) {
                $dept = DB::table('departments')->find($emp->department_id);
                if ($dept) {
                    DB::table('employees')
                        ->where('id', $emp->id)
                        ->update(['department' => $dept->name]);
                }
            }
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');
        });

        Schema::dropIfExists('departments');
    }
};