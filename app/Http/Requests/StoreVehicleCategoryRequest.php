<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleCategoryRequest extends FormRequest
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
            'ativo' => ['required', 'boolean'],
            'ordem' => ['required', 'integer', 'min:0', 'max:9999'],
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome da categoria é obrigatório.',
            'preco_por_minuto.required' => 'O preço por minuto é obrigatório.',
            'preco_por_minuto.numeric' => 'O preço deve ser um número.',
            'preco_por_minuto.min' => 'O preço deve ser maior que zero.',
            'ativo.required' => 'Informe se a categoria está ativa.',
            'ativo.boolean' => 'O status da categoria é inválido.',
            'ordem.required' => 'A ordem é obrigatória.',
            'ordem.integer' => 'A ordem deve ser um número inteiro.',
        ];
    }
}
