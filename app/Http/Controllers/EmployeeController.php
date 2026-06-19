<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Http\Resources\EmployeeResource;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = Employee::with('user', 'jadwal', 'department', 'contract');

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->department_id) {
            $query->where('department_id', $request->department_id);
        }

        return EmployeeResource::collection(
            $query->latest()->paginate(10)
        );
    }

    public function store(StoreEmployeeRequest $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        DB::beginTransaction();

        try {
            $user = User::create([
                'name'                 => $request->full_name,
                'email'                => $request->email,
                'password'             => bcrypt('password123'),
                'role'                 => 'employee',
                'must_change_password' => true,
            ]);

            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('employees', 'public');
            }

            $employee = Employee::create([
                'user_id'       => $user->id,
                'full_name'     => $request->full_name,
                'nip'           => $request->nip,
                'address'       => $request->address,
                'phone'         => $request->phone,
                'position'      => $request->position,
                'department_id' => $request->department_id,
                'jadwal_id'     => $request->jadwal_id,
                'photo'         => $photoPath,
            ]);

            DB::commit();

            return new EmployeeResource($employee->load('user', 'jadwal', 'department'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create employee',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show(Employee $employee)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return new EmployeeResource($employee->load('user', 'jadwal', 'department', 'contract'));
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        DB::beginTransaction();

        try {
            $employee->user->update([
                'name'  => $request->full_name,
                'email' => $request->email,
            ]);

            $data = [
                'full_name'     => $request->full_name,
                'nip'           => $request->nip,
                'address'       => $request->address,
                'phone'         => $request->phone,
                'position'      => $request->position,
                'department_id' => $request->department_id,
                'jadwal_id'     => $request->jadwal_id,
            ];

            if ($request->hasFile('photo')) {
                if ($employee->photo && Storage::disk('public')->exists($employee->photo)) {
                    Storage::disk('public')->delete($employee->photo);
                }
                $data['photo'] = $request->file('photo')->store('employees', 'public');
            }

            $employee->update($data);

            DB::commit();

            return new EmployeeResource($employee->load('user', 'jadwal', 'department'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update employee',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Employee $employee)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        DB::beginTransaction();

        try {
            if ($employee->photo && Storage::disk('public')->exists($employee->photo)) {
                Storage::disk('public')->delete($employee->photo);
            }

            $employee->delete();
            $employee->user()->delete();

            DB::commit();

            return response()->json(['message' => 'Employee deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete employee',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}