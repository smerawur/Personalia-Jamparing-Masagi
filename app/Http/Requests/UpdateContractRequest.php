<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id'       => 'sometimes|required|exists:employees,id',
            'base_salary'       => 'sometimes|required|numeric|min:0',
            'tunjangan_jabatan' => 'sometimes|required|numeric|min:0',
            'potongan'          => 'sometimes|required|numeric|min:0',
            'contract_type'     => 'sometimes|required|in:PKWTT,PKWT,Temporary',
            'start_date'        => 'sometimes|required|date',
            'end_date'          => [
                'nullable',
                'date',
                'after:start_date',
                function ($attribute, $value, $fail) {
                    if (
                        in_array($this->contract_type, ['PKWT', 'Temporary']) &&
                        !$value
                    ) {
                        $fail('End date is required for PKWT and Temporary contracts.');
                    }
                },
            ],
        ];
    }
}