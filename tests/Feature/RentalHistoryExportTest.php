<?php

use App\Models\Bike;
use App\Models\Customer;
use App\Models\Rental;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('exports rental history filtered by customer in multiple formats', function (): void {
    $admin = User::factory()->create(['role' => 'admin']);
    $bike = Bike::factory()->create();
    $alice = Customer::factory()->create(['nome' => 'Alice']);
    $bruno = Customer::factory()->create(['nome' => 'Bruno']);

    Rental::factory()->create([
        'bike_id' => $bike->id,
        'customer_id' => $alice->id,
        'start_time' => now()->subHours(2),
        'end_time' => now()->subHour(),
        'total_minutes' => 60,
        'total_seconds' => 3600,
        'valor_total' => 25.5,
    ]);

    Rental::factory()->create([
        'customer_id' => $bruno->id,
        'start_time' => now()->subHours(3),
        'end_time' => now()->subHours(2),
        'total_minutes' => 45,
        'total_seconds' => 2700,
        'valor_total' => 19.0,
    ]);

    actingAs($admin);

    $csvResponse = $this->get(route('admin.rentals.export', [
        'format' => 'csv',
        'customer_name' => 'Ali',
    ]));
    $csvResponse->assertOk();
    $csvResponse->assertHeader('content-type', 'text/csv; charset=UTF-8');
    $csvContent = $csvResponse->streamedContent();
    expect($csvContent)->toContain('Alice');
    expect($csvContent)->not->toContain('Bruno');

    $excelResponse = $this->get(route('admin.rentals.export', [
        'format' => 'excel',
        'customer_name' => 'Ali',
    ]));
    $excelResponse->assertOk();
    $excelResponse->assertHeader('content-type', 'application/vnd.ms-excel; charset=UTF-8');
    expect($excelResponse->streamedContent())->toContain('<table');

    $pdfResponse = $this->get(route('admin.rentals.export', [
        'format' => 'pdf',
        'customer_name' => 'Ali',
    ]));
    $pdfResponse->assertOk();
    $pdfResponse->assertHeader('content-type', 'application/pdf');
    $pdfBinary = $pdfResponse->streamedContent();
    expect($pdfBinary)->toStartWith('%PDF');
    expect($pdfBinary)->toContain('Alice');
});
