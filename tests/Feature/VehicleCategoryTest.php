<?php

use App\Models\Bike;
use App\Models\User;
use App\Models\VehicleCategory;
use App\Repositories\BikeRepository;

test('admin can create vehicle categories', function (): void {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($admin)
        ->post(route('admin.categories.store'), [
            'nome' => 'Patinete',
            'preco_por_minuto' => '0.45',
            'ativo' => true,
            'ordem' => 2,
        ]);

    $response->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseHas('vehicle_categories', [
        'nome' => 'Patinete',
        'preco_por_minuto' => '0.45',
        'ativo' => true,
        'ordem' => 2,
    ]);
});

test('employee cannot create vehicle categories', function (): void {
    $employee = User::factory()->create(['role' => 'employee']);

    $response = $this
        ->actingAs($employee)
        ->post(route('admin.categories.store'), [
            'nome' => 'Patinete',
            'preco_por_minuto' => '0.45',
            'ativo' => true,
            'ordem' => 2,
        ]);

    $response->assertForbidden();
});

test('inactive categories hide their vehicles from the operations list', function (): void {
    $category = VehicleCategory::factory()->create([
        'ativo' => false,
    ]);

    $bike = Bike::factory()->create([
        'vehicle_category_id' => $category->id,
        'disponivel' => true,
        'status' => 'disponível',
    ]);

    $availableBikes = app(BikeRepository::class)->available();

    expect($availableBikes->pluck('id'))->not->toContain($bike->id);
});
