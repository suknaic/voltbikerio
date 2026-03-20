<?php

use App\Models\Bike;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

test('admin can update bike photo without sending nome', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $bike = Bike::factory()->create([
        'nome' => 'Caloi 10',
        'foto_url' => null,
    ]);

    File::ensureDirectoryExists(public_path('assets/upload/foto/bike'));

    $response = $this
        ->actingAs($admin)
        ->post(route('admin.bikes.update', $bike), [
            '_method' => 'PATCH',
            'foto' => UploadedFile::fake()->image('bike.jpg'),
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.bikes.index'));

    expect($bike->fresh()->foto_url)->not->toBeNull();
});
