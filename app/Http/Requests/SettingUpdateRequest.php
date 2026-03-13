<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SettingUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'preco_por_minuto' => ['required', 'numeric', 'min:0.01', 'max:999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'preco_por_minuto.required' => 'O preço por minuto é obrigatório.',
            'preco_por_minuto.numeric' => 'O preço deve ser um número.',
            'preco_por_minuto.min' => 'O preço deve ser maior que zero.',
            'preco_por_minuto.max' => 'O preço não pode exceder 999.99.',
        ];
    }
}
