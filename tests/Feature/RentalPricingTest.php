<?php

use App\Models\Bike;
use App\Models\Customer;
use App\Models\Rental;
use App\Models\VehicleCategory;
use App\Services\RentalService;
use Carbon\Carbon;

test('rental closing uses the vehicle category price', function (): void {
    Carbon::setTestNow(Carbon::parse('2026-05-12 12:00:00'));
    try {
        $category = VehicleCategory::factory()->create([
            'preco_por_minuto' => '1.50',
            'ativo' => true,
        ]);

        $bike = Bike::factory()->create([
            'vehicle_category_id' => $category->id,
            'status' => 'em uso',
            'disponivel' => false,
        ]);

        $customer = Customer::factory()->create();

        $rental = Rental::factory()->active()->create([
            'bike_id' => $bike->id,
            'customer_id' => $customer->id,
            'start_time' => now()->subMinutes(10),
        ]);

        $closedRental = app(RentalService::class)->endRental($rental);

        expect($closedRental->valor_total)->toBe('15.00');
        expect($closedRental->total_minutes)->toBe(10);
        expect($closedRental->bike->status)->toBe('disponível');
    } finally {
        Carbon::setTestNow();
    }
});
