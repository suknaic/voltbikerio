<?php

namespace Database\Seeders;

use App\Models\Bike;
use Illuminate\Database\Seeder;

class BikeSeeder extends Seeder
{
    public function run(): void
    {
        $bikes = [
            ['nome' => 'Caloi 10', 'status' => 'disponível'],
            ['nome' => 'Monark Barra Circular', 'status' => 'disponível'],
            ['nome' => 'Caloi Mountain Bike', 'status' => 'disponível'],
            ['nome' => 'Oggi Speed 29', 'status' => 'disponível'],
        ];

        foreach ($bikes as $bike) {
            Bike::create($bike);
        }
    }
}
