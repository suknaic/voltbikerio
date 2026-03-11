<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBikeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:100'],
            'preco_por_minuto' => ['required', 'numeric', 'min:0.01', 'max:999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome da bicicleta é obrigatório.',
            'preco_por_minuto.required' => 'O preço por minuto é obrigatório.',
            'preco_por_minuto.min' => 'O preço por minuto deve ser maior que zero.',
        ];
    }
}
