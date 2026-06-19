<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAbsenRequest extends FormRequest
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
            'employee_id' => 'sometimes|required|exists:employees,id',
            'date' => 'sometimes|required|date',
            'status' => 'sometimes|required|string|in:present,absent,late,excused',
            'image' => 'sometimes|file|image|max:2048',
            'latitude' => 'sometimes|string|nullable',
            'longitude' => 'sometimes|string|nullable',
            'address' => 'sometimes|string|nullable',
            'keterangan' => 'sometimes|string|nullable',
        ];
    }
}
