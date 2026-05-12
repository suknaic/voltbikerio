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
            'vehicle_category_id' => ['required', 'integer', 'exists:vehicle_categories,id'],
            'nome' => ['required', 'string', 'max:100'],
            'foto' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'vehicle_category_id.required' => 'Selecione a categoria do veículo.',
            'vehicle_category_id.exists' => 'A categoria selecionada não existe.',
            'nome.required' => 'O nome da bicicleta é obrigatório.',
            'foto.image' => 'O arquivo deve ser uma imagem.',
            'foto.mimes' => 'A imagem deve ser em formato JPEG, PNG ou WebP.',
            'foto.max' => 'A imagem não deve exceder 2MB.',
        ];
    }
}
