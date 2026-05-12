<?php

namespace App\Models;

use Database\Factories\VehicleCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleCategory extends Model
{
    /** @use HasFactory<VehicleCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'nome',
        'preco_por_minuto',
        'ativo',
        'ordem',
    ];

    protected function casts(): array
    {
        return [
            'preco_por_minuto' => 'decimal:2',
            'ativo' => 'boolean',
            'ordem' => 'integer',
        ];
    }

    public function bikes(): HasMany
    {
        return $this->hasMany(Bike::class);
    }
}
