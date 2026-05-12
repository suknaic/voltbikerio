<?php

namespace App\Models;

use Database\Factories\BikeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bike extends Model
{
    /** @use HasFactory<BikeFactory> */
    use HasFactory;

    protected $fillable = [
        'vehicle_category_id',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(VehicleCategory::class, 'vehicle_category_id');
    }

    public function isAvailable(): bool
    {
        return $this->disponivel && $this->status === 'disponível' && (bool) $this->category?->ativo;
    }

    public function getPricePerMinute(): float
    {
        return (float) ($this->category?->preco_por_minuto ?? 0);
    }
}
