<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
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
            'email'      => 'required|email|unique:users,email',
            'full_name'  => 'required|string|max:255',
            'nip'        => 'required|string|max:20',
            'address'    => 'required|string',
            'phone'      => 'required|string|max:50',
            'position'   => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'jadwal_id'  => 'required|exists:jadwals,id',
        ];
    }
}
