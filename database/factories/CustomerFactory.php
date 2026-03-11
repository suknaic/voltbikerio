<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => fake('pt_BR')->name(),
            'telefone' => fake('pt_BR')->unique()->cellphone(false),
        ];
    }
}
