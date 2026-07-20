<?php

use App\Models\Bike;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Support\Facades\Event;

test('admin can delete bike without active rental', function (): void {
    Event::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $bike = Bike::factory()->available()->create([
        'disponivel' => true,
    ]);

    $response = $this->actingAs($admin)->delete(route('admin.bikes.destroy', $bike));

    $response->assertRedirect(route('admin.bikes.index'));
    $this->assertDatabaseMissing('bikes', ['id' => $bike->id]);
});

test('admin cannot delete bike with active rental', function (): void {
    Event::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $bike = Bike::factory()->create([
        'status' => 'em uso',
        'disponivel' => true,
    ]);
    Rental::factory()->active()->create([
        'bike_id' => $bike->id,
        'start_time' => now()->subMinutes(10),
    ]);

    $response = $this->actingAs($admin)->delete(route('admin.bikes.destroy', $bike));

    $response->assertRedirect();
    $this->assertDatabaseHas('bikes', ['id' => $bike->id]);
});

test('admin can force available bike with orphaned rental', function (): void {
    Event::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $bike = Bike::factory()->create([
        'status' => 'em uso',
        'disponivel' => true,
    ]);
    $rental = Rental::factory()->active()->create([
        'bike_id' => $bike->id,
        'start_time' => now()->subMinutes(10),
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.bikes.force-available', $bike));

    $response->assertRedirect(route('admin.bikes.index'));

    $bike->refresh();
    expect($bike->status)->toBe('disponível');

    $rental->refresh();
    expect($rental->end_time)->not->toBeNull();
    expect($rental->total_minutes)->toBeGreaterThan(0);
});

test('admin can force available bike without active rental', function (): void {
    Event::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $bike = Bike::factory()->create([
        'status' => 'em uso',
        'disponivel' => true,
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.bikes.force-available', $bike));

    $response->assertRedirect(route('admin.bikes.index'));

    $bike->refresh();
    expect($bike->status)->toBe('disponível');
});

test('employee cannot delete bike', function (): void {
    Event::fake();

    $employee = User::factory()->create(['role' => 'employee']);
    $bike = Bike::factory()->available()->create([
        'disponivel' => true,
    ]);

    $response = $this->actingAs($employee)->delete(route('admin.bikes.destroy', $bike));

    $response->assertForbidden();
});

test('employee cannot force available bike', function (): void {
    Event::fake();

    $employee = User::factory()->create(['role' => 'employee']);
    $bike = Bike::factory()->create([
        'status' => 'em uso',
        'disponivel' => true,
    ]);

    $response = $this->actingAs($employee)->patch(route('admin.bikes.force-available', $bike));

    $response->assertForbidden();
});
