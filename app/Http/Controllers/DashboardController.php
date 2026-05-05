<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Repositories\BikeRepository;
use App\Repositories\RentalRepository;
use Illuminate\Http\Request;
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
            'availableBikes' => $this->bikeRepository->available(),
            'todaySummary' => $this->rentalRepository->reportSummary($today, $today),
            'monthSummary' => $this->rentalRepository->reportSummary($monthStart, $today),
            'preco_por_minuto' => (string) Setting::get('preco_por_minuto', '0.25'),
        ]);
    }

    public function rentalOperations(): Response
    {
        return Inertia::render('admin/rentals/operations', [
            'availableBikes' => $this->bikeRepository->available(),
            'activeRentals' => $this->rentalRepository->active(),
            'preco_por_minuto' => (string) Setting::get('preco_por_minuto', '0.25'),
        ]);
    }

    public function employee(Request $request): Response
    {
        $filters = $request->only(['date_from', 'date_to', 'bike_id', 'customer_name']);

        return Inertia::render('employee/dashboard', [
            'availableBikes' => $this->bikeRepository->available(),
            'activeRentals' => $this->rentalRepository->active(),
            'preco_por_minuto' => (string) Setting::get('preco_por_minuto', '0.25'),
            'rentals' => $this->rentalRepository->history($filters),
            'bikes' => $this->bikeRepository->all(),
            'filters' => $filters,
        ]);
    }
}
