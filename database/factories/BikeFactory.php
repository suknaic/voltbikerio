<?php

namespace Database\Factories;

use App\Models\Bike;
use App\Models\VehicleCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bike>
 */
class BikeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vehicle_category_id' => VehicleCategory::factory(),
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
