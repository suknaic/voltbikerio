<?php

namespace App\Repositories;

use App\Models\Rental;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class RentalRepository
{
    public function active(): Collection
    {
        return Rental::query()
            ->with(['bike.category', 'customer'])
            ->whereNull('end_time')
            ->orderBy('start_time', 'desc')
            ->get();
    }

    public function history(array $filters = []): LengthAwarePaginator
    {
        return $this->buildHistoryQuery($filters)->paginate(20);
    }

    public function historyAll(array $filters = []): Collection
    {
        return $this->buildHistoryQuery($filters)->get();
    }

    private function buildHistoryQuery(array $filters = []): Builder
    {
        $query = Rental::query()
            ->with(['bike.category', 'customer'])
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

        if (isset($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (! empty($filters['customer_name'])) {
            $query->whereHas('customer', static function ($query) use ($filters): void {
                $query->where('nome', 'like', '%' . $filters['customer_name'] . '%');
            });
        }

        return $query;
    }

    public function findOrFail(int $id): Rental
    {
        return Rental::query()->with(['bike.category', 'customer'])->findOrFail($id);
    }

    public function create(array $data): Rental
    {
        return Rental::create($data);
    }

    public function update(Rental $rental, array $data): Rental
    {
        $rental->update($data);

        return $rental->fresh(['bike.category', 'customer']);
    }

    /**
     * @return array{total_rentals: int, total_minutes: int, receita_total: float, tempo_medio: int, ticket_medio: float}
     */
    public function reportSummary(string $dateFrom, string $dateTo, ?int $bikeId = null, ?string $customerName = null): array
    {
        $query = Rental::query()
            ->whereNotNull('end_time')
            ->whereBetween('start_time', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);

        if ($bikeId !== null) {
            $query->where('bike_id', $bikeId);
        }

        if ($customerName !== null && $customerName !== '') {
            $query->whereHas('customer', static function ($query) use ($customerName): void {
                $query->where('nome', 'like', '%' . $customerName . '%');
            });
        }

        $result = $query
            ->selectRaw('COUNT(*) as total_rentals, SUM(total_minutes) as total_minutes, SUM(valor_total) as receita_total')
            ->first();

        $totalRentals = (int) ($result?->total_rentals ?? 0);
        $totalMinutes = (int) ($result?->total_minutes ?? 0);
        $receita = (float) ($result?->receita_total ?? 0);

        return [
            'total_rentals' => $totalRentals,
            'total_minutes' => $totalMinutes,
            'receita_total' => $receita,
            'tempo_medio' => $totalRentals > 0 ? (int) round($totalMinutes / $totalRentals) : 0,
            'ticket_medio' => $totalRentals > 0 ? round($receita / $totalRentals, 2) : 0.0,
        ];
    }
}
