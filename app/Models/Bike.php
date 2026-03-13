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
        'foto_url',
        'disponivel',
    ];

    protected function casts(): array
    {
        return [
            'disponivel' => 'boolean',
        ];
    }

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    public function isAvailable(): bool
    {
        return $this->disponivel && $this->status === 'disponível';
    }

    public static function getPricePerMinute(): string
    {
        return (string) Setting::get('preco_por_minuto', '0.25');
    }
}
