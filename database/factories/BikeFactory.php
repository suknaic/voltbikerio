<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bike>
 */
class BikeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nome' => fake()->randomElement(['Caloi 10', 'Monark', 'Caloi Mountain', 'Bicicleta Urbana', 'Speed Pro']),
            'status' => fake()->randomElement(['disponível', 'em uso']),
        ];
    }

    public function available(): static
    {
        return $this->state(['status' => 'disponível']);
    }

    public function inUse(): static
    {
        return $this->state(['status' => 'em uso']);
    }
}
