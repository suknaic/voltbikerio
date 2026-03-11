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
        $minutes = (int) (($endTime->getTimestamp() - $startTime->getTimestamp()) / 60);
        $bike = Bike::factory()->make();

        return [
            'bike_id' => Bike::factory(),
            'customer_id' => Customer::factory(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'total_minutes' => $minutes,
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
