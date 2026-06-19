<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\Employee::factory(1)->create();


        // Ensure an admin user exists for the seeded employee
        // $admin = \App\Models\User::factory()->create([
        //     'name' => 'Admin',
        //     'email' => 'admin@example.com',
        //     'password' => Hash::make('123456'),
        //     'role' => 'admin',
        // ]);

        // // Ensure a jadwal exists
        // $jadwal = \App\Models\Jadwals::create([
        //     'jam_masuk' => '08:00:00',
        //     'jam_keluar' => '17:00:00',
        //     'toleransi' => 0,
        // ]);

        // $department = \App\Models\Department::create([
        //     'name' => 'IT',
        // ]);

        $fira = \App\Models\User::factory()->create([
            'name' => 'Fira',
            'email' => 'fira@gmail.com',
            'password' => Hash::make('123456'),
            'role' => 'employee',
        ]);

        $karyawan = \App\Models\Employee::factory()->create([
            'user_id' => $fira->id,
            'full_name' => 'Fira',
            'address' => '123 Main St, Anytown, USA',
            'phone' => '555-1234',
            'position' => 'Software Engineer',
            'department_id' => 1,
            'jadwal_id' => 1,
        ]);

        // $john = \App\Models\User::factory()->create([
        //     'name' => 'John Doe',
        //     'email' => 'john@example.com',
        //     'password' => Hash::make('123456'),
        //     'role' => 'admin',
        // ]);

        // $john = \App\Models\Employee::create([
        //     'user_id' => 1,
        //     'full_name' => 'John Doe',
        //     // 'nip' => '123456789',
        //     'address' => '123 Main St, Anytown, USA',
        //     'phone' => '555-1234',
        //     'position' => 'Software Engineer',
        //     'department_id' => 1,
        //     'jadwal_id' => 1,
        // ]);

        
    }
}
