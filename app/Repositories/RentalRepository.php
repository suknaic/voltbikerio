<?php

namespace App\Repositories;

use App\Models\Rental;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class RentalRepository
{
    public function active(): Collection
    {
        return Rental::query()
            ->with(['bike', 'customer'])
            ->whereNull('end_time')
            ->orderBy('start_time', 'desc')
            ->get();
    }

    public function history(array $filters = []): LengthAwarePaginator
    {
        $query = Rental::query()
            ->with(['bike', 'customer'])
            ->whereNotNull('end_time')
            ->orderBy('start_time', 'desc');

        if (isset($filters['date_from'])) {
            $query->whereDate('start_time', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('start_time', '<=', $filters['date_to']);
        }

        if (isset($filters['bike_id'])) {
            $query->where('bike_id', $filters['bike_id']);
        }

        return $query->paginate(20);
    }

    public function findOrFail(int $id): Rental
    {
        return Rental::query()->with(['bike', 'customer'])->findOrFail($id);
    }

    public function create(array $data): Rental
    {
        return Rental::create($data);
    }

    public function update(Rental $rental, array $data): Rental
    {
        $rental->update($data);

        return $rental->fresh(['bike', 'customer']);
    }

    /**
     * @return array{total_minutes: int, receita_total: float}
     */
    public function reportSummary(string $dateFrom, string $dateTo): array
    {
        $result = Rental::query()
            ->whereNotNull('end_time')
            ->whereBetween('start_time', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->selectRaw('SUM(total_minutes) as total_minutes, SUM(valor_total) as receita_total')
            ->first();

        return [
            'total_minutes' => (int) ($result?->total_minutes ?? 0),
            'receita_total' => (float) ($result?->receita_total ?? 0),
        ];
    }
}
