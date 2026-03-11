<?php

namespace App\Http\Controllers;

use App\Http\Requests\StartRentalRequest;
use App\Models\Rental;
use App\Repositories\BikeRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\RentalRepository;
use App\Services\RentalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RentalController extends Controller
{
    public function __construct(
        private readonly RentalService $rentalService,
        private readonly RentalRepository $rentalRepository,
        private readonly BikeRepository $bikeRepository,
        private readonly CustomerRepository $customerRepository,
    ) {}

    public function index(): Response
    {
        return Inertia::render('employee/rentals/index', [
            'activeRentals' => $this->rentalRepository->active(),
            'availableBikes' => $this->bikeRepository->available(),
            'customers' => $this->customerRepository->all(),
        ]);
    }

    public function store(StartRentalRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $bike = $this->bikeRepository->findOrFail($validated['bike_id']);
        $customer = $this->customerRepository->create([
            'nome' => $validated['customer_nome'],
            'telefone' => $validated['customer_telefone'],
        ]);

        $this->rentalService->startRental($bike, $customer, $validated['tempo_solicitado'] ?? null);

        return redirect()->route('employee.dashboard')->with('success', 'Aluguel iniciado com sucesso!');
    }

    public function billing(Rental $rental): Response
    {
        $rental->load(['bike', 'customer']);

        return Inertia::render('employee/rentals/billing', [
            'rental' => $rental,
        ]);
    }

    public function end(Rental $rental): RedirectResponse
    {
        $this->rentalService->endRental($rental);

        return redirect()->route('employee.rentals.billing', $rental);
    }

    public function history(Request $request): Response
    {
        $filters = $request->only(['date_from', 'date_to', 'customer_id']);

        $dateFrom = $filters['date_from'] ?? now()->startOfMonth()->toDateString();
        $dateTo = $filters['date_to'] ?? now()->toDateString();

        return Inertia::render('admin/rentals/history', [
            'rentals' => $this->rentalRepository->history($filters),
            'customers' => $this->customerRepository->all(),
            'summary' => $this->rentalRepository->reportSummary($dateFrom, $dateTo),
            'filters' => $filters,
        ]);
    }
}
