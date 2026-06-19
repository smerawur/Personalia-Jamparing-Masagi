<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBonusRequest;
use App\Http\Requests\UpdateBonusRequest;
use App\Http\Resources\BonusResource;
use App\Models\Bonus;
use Illuminate\Http\Request;

class BonusController extends Controller
{
    /**
     * List all bonus presets (admin only).
     * Supports search by name.
     */
    public function index(Request $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $query = Bonus::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return BonusResource::collection($query->latest()->paginate(10));
    }

    /**
     * Create a new bonus preset (admin only).
     */
    public function store(StoreBonusRequest $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $bonus = Bonus::create($request->validated());

        return new BonusResource($bonus);
    }

    /**
     * Update a bonus preset (admin only).
     * Note: updating a preset does NOT retroactively change
     * already-assigned bonus_karyawan rows — final_amount is
     * stored on assignment, not recalculated from the preset.
     */
    public function update(UpdateBonusRequest $request, Bonus $bonus)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $bonus->update($request->validated());

        return new BonusResource($bonus);
    }

    /**
     * Delete a bonus preset (admin only).
     * Blocked if the preset has been assigned to any employee.
     */
    public function destroy(Bonus $bonus)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($bonus->bonusKaryawan()->exists()) {
            return response()->json([
                'error' => 'This bonus preset is assigned to one or more employees and cannot be deleted.',
            ], 422);
        }

        $bonus->delete();

        return response()->json(['message' => 'Bonus preset deleted successfully.']);
    }
}