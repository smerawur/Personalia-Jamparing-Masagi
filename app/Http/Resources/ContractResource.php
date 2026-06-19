<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
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
            'employee_id' => $this->employee_id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'base_salary' => $this->base_salary,
            'contract_type' => $this->contract_type,
            'created_at' => $this->created_at,
            'employee_name' => $this->employee?->full_name,
            'tunjangan_jabatan' => $this->tunjangan_jabatan,
            'potongan' => $this->potongan,
        ];
    }
}
