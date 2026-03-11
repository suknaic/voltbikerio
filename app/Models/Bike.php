<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bike extends Model
{
    /** @use HasFactory<\Database\Factories\BikeFactory> */
    use HasFactory;

    protected $fillable = [
        'nome',
        'status',
        'preco_por_minuto',
    ];

    protected function casts(): array
    {
        return [
            'preco_por_minuto' => 'decimal:2',
        ];
    }

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'disponível';
    }
}
