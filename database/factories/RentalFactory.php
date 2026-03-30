<?php

namespace Database\Factories;

use App\Models\Bike;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rental>
 */
class RentalFactory extends Factory
{
    public function definition(): array
    {
        $startTime = fake()->dateTimeBetween('-7 days', 'now');
        $endTime = fake()->dateTimeBetween($startTime, 'now');
        $seconds = max(60, $endTime->getTimestamp() - $startTime->getTimestamp());
        $minutes = (int) ceil($seconds / 60);
        $bike = Bike::factory()->make();

        return [
            'bike_id' => Bike::factory(),
            'customer_id' => Customer::factory(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'total_minutes' => $minutes,
            'total_seconds' => $seconds,
            'valor_total' => $minutes * 0.25,
        ];
    }

    public function active(): static
    {
        return $this->state([
            'end_time' => null,
            'total_minutes' => null,
            'valor_total' => null,
        ]);
    }
}
