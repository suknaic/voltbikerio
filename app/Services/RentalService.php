<?php

namespace App\Services;

use App\Events\RentalEnded;
use App\Events\RentalStarted;
use App\Models\Bike;
use App\Models\Customer;
use App\Models\Rental;
use App\Repositories\BikeRepository;
use App\Repositories\RentalRepository;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class RentalService
{
    public function __construct(
        private readonly BikeRepository $bikeRepository,
        private readonly RentalRepository $rentalRepository,
    ) {}

    public function startRental(Bike $bike, Customer $customer, ?int $tempoSolicitado = null): Rental
    {
        if (! $bike->isAvailable()) {
            throw ValidationException::withMessages([
                'bike_id' => 'Este veículo não está disponível.',
            ]);
        }

        $rental = $this->rentalRepository->create([
            'bike_id' => $bike->id,
            'customer_id' => $customer->id,
            'telefone_cliente' => $customer->telefone,
            'start_time' => Carbon::now(),
            'tempo_solicitado' => $tempoSolicitado,
        ]);

        $this->bikeRepository->markAsInUse($bike);

        $rental->load(['bike', 'customer']);

        RentalStarted::dispatch($rental);

        return $rental;
    }

    public function endRental(Rental $rental): Rental
    {
        if (! $rental->isActive()) {
            throw ValidationException::withMessages([
                'rental_id' => 'Este aluguel já foi encerrado.',
            ]);
        }

        $endTime = Carbon::now();
        $totalSeconds = max(1, $rental->start_time->diffInSeconds($endTime));
        $totalMinutes = (int) max(1, ceil($totalSeconds / 60));
        $pricePerMinute = (float) ($rental->bike?->getPricePerMinute() ?? 0);
        $valorTotal = round(($totalSeconds / 60) * $pricePerMinute, 2);

        $rental = $this->rentalRepository->update($rental, [
            'end_time' => $endTime,
            'total_minutes' => $totalMinutes,
            'total_seconds' => $totalSeconds,
            'valor_total' => $valorTotal,
        ]);

        $this->bikeRepository->markAsAvailable($rental->bike);

        $rental->load(['bike', 'customer']);

        RentalEnded::dispatch($rental);

        return $rental;
    }
}
