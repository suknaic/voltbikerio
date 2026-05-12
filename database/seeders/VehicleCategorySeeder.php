<?php

namespace Database\Seeders;

use App\Models\VehicleCategory;
use Illuminate\Database\Seeder;

class VehicleCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['nome' => 'Bicicleta', 'preco_por_minuto' => 0.25, 'ativo' => true, 'ordem' => 1],
            ['nome' => 'Patinete', 'preco_por_minuto' => 0.40, 'ativo' => true, 'ordem' => 2],
        ];

        foreach ($categories as $category) {
            VehicleCategory::query()->updateOrCreate(
                ['nome' => $category['nome']],
                $category,
            );
        }
    }
}
