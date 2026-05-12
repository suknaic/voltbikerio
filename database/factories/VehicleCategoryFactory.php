<?php

namespace Database\Factories;

use App\Models\VehicleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<VehicleCategory>
 */
class VehicleCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => fake()->randomElement(['Bicicleta', 'Patinete', 'Tandem', 'Infantil']),
            'preco_por_minuto' => fake()->randomFloat(2, 0.2, 1.5),
            'ativo' => true,
            'ordem' => fake()->numberBetween(0, 50),
        ];
    }
}
