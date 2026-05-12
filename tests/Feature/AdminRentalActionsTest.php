<?php

use App\Models\Bike;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Support\Facades\Event;

test('admin can start rentals directly from the admin dashboard', function (): void {
    Event::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $bike = Bike::factory()->available()->create([
        'disponivel' => true,
    ]);
    /** @var \Tests\TestCase $this */
    $response = $this
        ->actingAs($admin)
        ->post(route('employee.rentals.store'), [
            'bike_id' => $bike->id,
            'customer_nome' => 'Cliente Admin',
            'customer_telefone' => '11999999999',
            'tempo_solicitado' => 15,
            'redirect_to' => 'admin.rentals.operations',
        ]);

    $response->assertRedirect(route('admin.rentals.operations'));

    $rental = Rental::query()
        ->with('customer')
        ->where('bike_id', $bike->id)
        ->first();

    expect($rental)->not->toBeNull();
    expect($rental?->bike_id)->toBe($bike->id);
    expect($rental?->customer->nome)->toBe('Cliente Admin');
});

test('admin can end rentals directly from the admin dashboard', function (): void {
    Event::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $bike = Bike::factory()->create([
        'status' => 'em uso',
        'disponivel' => false,
    ]);
    $rental = Rental::factory()
        ->active()
        ->create([
            'bike_id' => $bike->id,
            'start_time' => now()->subMinutes(25),
        ]);

    /** @var \Tests\TestCase $this */
    $response = $this
        ->actingAs($admin)
        ->patch(route('employee.rentals.end', $rental), [
            'redirect_to' => 'admin.rentals.operations',
        ]);

    $response->assertRedirect(route('admin.rentals.operations'));

    $rental->refresh();

    expect($rental->end_time)->not->toBeNull();
    expect($rental->total_minutes)->toBeGreaterThan(0);
    expect($rental->bike->status)->toBe('disponível');
});
