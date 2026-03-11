<?php

namespace Database\Seeders;

use App\Models\Bike;
use Illuminate\Database\Seeder;

class BikeSeeder extends Seeder
{
    public function run(): void
    {
        $bikes = [
            ['nome' => 'Caloi 10', 'status' => 'disponível', 'preco_por_minuto' => 0.20],
            ['nome' => 'Monark Barra Circular', 'status' => 'disponível', 'preco_por_minuto' => 0.15],
            ['nome' => 'Caloi Mountain Bike', 'status' => 'disponível', 'preco_por_minuto' => 0.35],
            ['nome' => 'Oggi Speed 29', 'status' => 'disponível', 'preco_por_minuto' => 0.50],
        ];

        foreach ($bikes as $bike) {
            Bike::create($bike);
        }
    }
}
