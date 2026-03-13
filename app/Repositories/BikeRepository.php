<?php

namespace App\Repositories;

use App\Models\Bike;
use Illuminate\Database\Eloquent\Collection;

class BikeRepository
{
    public function all(): Collection
    {
        return Bike::query()->orderBy('nome')->get();
    }

    public function available(): Collection
    {
        return Bike::query()
            ->where('disponivel', true)
            ->where('status', 'disponível')
            ->orderBy('nome')
            ->get();
    }

    public function findOrFail(int $id): Bike
    {
        return Bike::query()->findOrFail($id);
    }

    public function create(array $data): Bike
    {
        return Bike::create($data);
    }

    public function update(Bike $bike, array $data): Bike
    {
        $bike->update($data);

        return $bike->fresh();
    }

    public function delete(Bike $bike): void
    {
        $bike->delete();
    }

    public function markAsInUse(Bike $bike): void
    {
        $bike->update(['status' => 'em uso']);
    }

    public function markAsAvailable(Bike $bike): void
    {
        $bike->update(['status' => 'disponível']);
    }
}
