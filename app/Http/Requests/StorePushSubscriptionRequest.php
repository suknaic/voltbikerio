<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePushSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'endpoint' => ['required', 'string', 'url', 'max:2048'],
            'public_key' => ['required', 'string', 'max:512'],
            'auth_token' => ['required', 'string', 'max:255'],
            'content_encoding' => ['nullable', 'string', 'in:aesgcm,aes128gcm'],
        ];
    }

    public function messages(): array
    {
        return [
            'endpoint.required' => 'O endpoint é obrigatório.',
            'endpoint.url' => 'O endpoint deve ser uma URL válida.',
            'public_key.required' => 'A chave pública é obrigatória.',
            'auth_token.required' => 'O token de autenticação é obrigatório.',
            'content_encoding.in' => 'Codificação inválida.',
        ];
    }
}
