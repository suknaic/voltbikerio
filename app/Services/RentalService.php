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
                'bike_id' => 'Esta bicicleta não está disponível.',
            ]);
        }

        $rental = $this->rentalRepository->create([
            'bike_id' => $bike->id,
            'customer_id' => $customer->id,
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
        $totalMinutes = (int) $rental->start_time->diffInMinutes($endTime);
        $valorTotal = $totalMinutes * $rental->bike->preco_por_minuto;

        $rental = $this->rentalRepository->update($rental, [
            'end_time' => $endTime,
            'total_minutes' => $totalMinutes,
            'valor_total' => $valorTotal,
        ]);

        $this->bikeRepository->markAsAvailable($rental->bike);

        RentalEnded::dispatch($rental);

        return $rental;
    }
}
