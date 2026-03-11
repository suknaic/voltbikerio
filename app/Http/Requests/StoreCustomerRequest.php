<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:100'],
            'telefone' => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do cliente é obrigatório.',
            'telefone.required' => 'O telefone é obrigatório.',
            'telefone.unique' => 'Este telefone já está cadastrado.',
        ];
    }
}
