<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MyProfileController extends Controller
{
    /**
     * Get the authenticated employee's full profile.
     */
    public function show()
    {
        $user     = auth()->user();
        $employee = Employee::with(['user', 'jadwal', 'department'])
            ->where('user_id', $user->id)
            ->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $contract = Contract::where('employee_id', $employee->id)
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now()->toDateString());
            })
            ->latest('start_date')
            ->first();

        return response()->json([
            'id'         => $employee->id,
            'full_name'  => $employee->full_name,
            'email'      => $user->email,
            'phone'      => $employee->phone,
            'address'    => $employee->address,
            'position'   => $employee->position,
            'department' => $employee->department?->name,
            'status'     => $employee->status,
            'photo_url'  => $employee->photo
                ? asset('storage/' . $employee->photo)
                : null,
            'jadwal' => $employee->jadwal ? [
                'name'       => $employee->jadwal->name ?? null,
                'jam_masuk'  => $employee->jadwal->jam_masuk,
                'jam_keluar' => $employee->jadwal->jam_keluar,
            ] : null,
            'contract' => $contract ? [
                'contract_type' => $contract->contract_type,
                'base_salary'   => $contract->base_salary,
                'start_date'    => $contract->start_date,
                'end_date'      => $contract->end_date,
            ] : null,
        ]);
    }

    /**
     * Update phone, address, and optionally photo.
     */
    public function update(Request $request)
    {
        $request->validate([
            'phone'   => 'required|string|max:50',
            'address' => 'required|string',
            'photo'   => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user     = auth()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee not found'], 404);
        }

        $data = [
            'phone'   => $request->phone,
            'address' => $request->address,
        ];

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($employee->photo && Storage::disk('public')->exists($employee->photo)) {
                Storage::disk('public')->delete($employee->photo);
            }
            $data['photo'] = $request->file('photo')->store('employees', 'public');
        }

        $employee->update($data);

        return response()->json([
            'message'   => 'Profile updated successfully.',
            'photo_url' => $employee->photo
                ? asset('storage/' . $employee->photo)
                : null,
        ]);
    }
}