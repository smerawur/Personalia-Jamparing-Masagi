<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class storeContractRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'start_date' => 'required|date',
                'end_date' => [
                    'nullable',
                    'date',
                    'after:start_date',
    
                    function ( $value, $fail) {
                        if (in_array($this->contract_type, ['PKWT', 'Temporary']) && !$value) {
                            $fail('End date is required for this contract type.');
                        }
                    }
                ],
            'base_salary' => 'required|numeric',
            'contract_type' => 'required|in:PKWTT,PKWT,Temporary',
            'tunjangan_jabatan' => 'nullable|numeric|min:0',
            'potongan' => 'nullable|numeric|min:0',
        ];
    }
}
