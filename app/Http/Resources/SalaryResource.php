<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'employee_id'       => $this->employee_id,
            'employee'          => $this->whenLoaded('employee', fn() => [
                'id'        => $this->employee->id,
                'full_name' => $this->employee->full_name,
            ]),
            'contract_id'       => $this->contract_id,
            'month'             => $this->month,
            'year'              => $this->year,
            'base_salary'       => $this->base_salary,
            'tunjangan_jabatan' => $this->tunjangan_jabatan,
            'overtime_pay'      => $this->overtime_pay,
            'bonus'             => $this->bonus,
            'deductions'        => $this->deductions,
            'total_salary'      => $this->total_salary,
            'status'            => $this->status,
            'paid_at'           => $this->paid_at,
            'created_at'        => $this->created_at,
        ];
    }
}