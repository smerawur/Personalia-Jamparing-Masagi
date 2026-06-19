<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BonusKaryawanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'employee_id'  => $this->employee_id,
            'employee'     => $this->whenLoaded('employee', fn() => [
                'id'        => $this->employee->id,
                'full_name' => $this->employee->full_name,
            ]),
            'bonus_id'     => $this->bonus_id,
            'bonus'        => $this->whenLoaded('bonus', fn() => [
                'id'     => $this->bonus->id,
                'name'   => $this->bonus->name,
                'amount' => $this->bonus->amount,
                'type'   => $this->bonus->type,
            ]),
            'bonus_date'   => $this->bonus_date,
            'final_amount' => $this->final_amount,
            'salary_id'    => $this->salary_id,
            'salary'       => $this->whenLoaded('salary', fn() => [
                'id'     => $this->salary->id,
                'month'  => $this->salary->month,
                'year'   => $this->salary->year,
                'status' => $this->salary->status,
            ]),
        ];
    }
}