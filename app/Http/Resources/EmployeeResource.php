<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'nip' => $this->nip,
            'email' => $this->user->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'position' => $this->position,
            'department'    => $this->whenLoaded('department', fn() => [
                'id'   => $this->department->id,
                'name' => $this->department->name,
            ]),
            'jadwal_id' => $this->jadwal_id,

            'user' => [
                'id' => $this->user->id,
                'email' => $this->user->email,
            ],

            'jadwal' => [
                'id' => $this->jadwal->id,
                'jam_masuk' => $this->jadwal->jam_masuk,
                'jam_keluar' => $this->jadwal->jam_keluar,
            ],

            'photo_url' => $this->photo ? asset('storage/' . $this->photo) : null,
            'contract' => $this->whenLoaded('contract', fn() => [
                'id' => $this->contract->id,
                'start_date' => $this->contract->start_date,
            ])
        ];
    }
}
