<?php

namespace App\Http\Controllers;

use App\Repositories\BikeRepository;
use App\Repositories\RentalRepository;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly RentalRepository $rentalRepository,
        private readonly BikeRepository $bikeRepository,
    ) {}

    public function admin(): Response
    {
        $today = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        return Inertia::render('admin/dashboard', [
            'activeRentals' => $this->rentalRepository->active(),
            'bikes' => $this->bikeRepository->all(),
            'todaySummary' => $this->rentalRepository->reportSummary($today, $today),
            'monthSummary' => $this->rentalRepository->reportSummary($monthStart, $today),
        ]);
    }

    public function employee(): Response
    {
        return Inertia::render('employee/dashboard', [
            'availableBikes' => $this->bikeRepository->available(),
            'activeRentals' => $this->rentalRepository->active(),
            'preco_por_minuto' => (string) \App\Models\Setting::get('preco_por_minuto', '0.25'),
        ]);
    }
}
