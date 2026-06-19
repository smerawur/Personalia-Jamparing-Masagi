<?php

namespace App\Http\Controllers;

use App\Models\Jadwals;
use App\Http\Requests\StoreJadwalRequest;
use App\Http\Resources\JadwalResource;
use App\Http\Requests\UpdateJadwalRequest;

class JadwalController extends Controller
{
    public function index()
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return JadwalResource::collection(Jadwals::all());
    }

    public function store(StoreJadwalRequest $request)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $jadwal = Jadwals::create($request->validated());
        return new JadwalResource($jadwal);
    }

    public function update(UpdateJadwalRequest $request, Jadwals $jadwal)
    {
        $jadwal->update($request->validated());
        return new JadwalResource($jadwal);
    }

    public function destroy(Jadwals $jadwal)
    {
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($jadwal->employee()->exists()) {
            return response()->json(['error' => 'Cannot delete jadwal with assigned employees'], 400);
        }


        $jadwal->delete();
        return response()->json(['message' => 'Jadwal deleted successfully']);
    }
    public function jadwalAktif()
{
    $jadwal = Jadwals::first();
    return response()->json($jadwal);
}
}
