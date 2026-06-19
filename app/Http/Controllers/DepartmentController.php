<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = Department::withCount('employees');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json([
            'data' => $query->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:100|unique:departments,name',
        ]);

        $department = Department::create(['name' => $request->name]);

        return response()->json(['data' => $department], 201);
    }

    public function update(Request $request, Department $department)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:100|unique:departments,name,' . $department->id,
        ]);

        $department->update(['name' => $request->name]);

        return response()->json(['data' => $department]);
    }

    public function destroy(Department $department)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($department->employees()->exists()) {
            return response()->json([
                'error' => "Cannot delete \"{$department->name}\" — {$department->employees()->count()} employee(s) are still assigned to this department.",
            ], 422);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully.']);
    }
}