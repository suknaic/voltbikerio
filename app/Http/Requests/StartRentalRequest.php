<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StartRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'bike_id' => ['required', 'integer', 'exists:bikes,id'],
            'customer_nome' => ['required', 'string', 'max:100'],
            'customer_telefone' => ['required', 'string', 'max:20'],
            'tempo_solicitado' => ['nullable', 'integer', 'min:1', 'max:480'],
            'redirect_to' => ['nullable', 'string', Rule::in(['employee.dashboard', 'admin.dashboard', 'admin.rentals.operations'])],
        ];
    }

    public function messages(): array
    {
        return [
            'bike_id.required' => 'Selecione uma bicicleta.',
            'bike_id.exists' => 'Bicicleta não encontrada.',
            'customer_nome.required' => 'Informe o nome do cliente.',
            'customer_telefone.required' => 'Informe o telefone do cliente.',
            'redirect_to.in' => 'Destino inválido.',
        ];
    }
}
