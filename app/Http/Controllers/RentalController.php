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
        $redirectRoute = $this->resolveRedirectRoute($validated['redirect_to'] ?? null);
        unset($validated['redirect_to']);

        $bike = $this->bikeRepository->findOrFail($validated['bike_id']);
        $customer = $this->customerRepository->create([
            'nome' => $validated['customer_nome'],
            'telefone' => $validated['customer_telefone'],
        ]);

        $this->rentalService->startRental($bike, $customer, $validated['tempo_solicitado'] ?? null);

        return redirect()->route($redirectRoute)->with('success', 'Aluguel iniciado com sucesso!');
    }

    public function billing(Rental $rental, Request $request): RedirectResponse
    {
        $rental->load(['bike', 'customer']);
        $redirectRoute = $this->resolveRedirectRoute($request->input('redirect_to'));

        return redirect()->route($redirectRoute)->with('lastRental', $this->formatBillingData($rental));
    }

    public function end(Rental $rental, Request $request): RedirectResponse
    {
        $rental = $this->rentalService->endRental($rental);
        $redirectRoute = $this->resolveRedirectRoute($request->input('redirect_to'));

        return redirect()->route($redirectRoute)->with('lastRental', $this->formatBillingData($rental));
    }

    public function history(Request $request): Response
    {
        $filters = $request->only(['date_from', 'date_to', 'bike_id']);

        $dateFrom = $filters['date_from'] ?? now()->startOfMonth()->toDateString();
        $dateTo = $filters['date_to'] ?? now()->toDateString();
        $bikeId = isset($filters['bike_id']) ? (int) $filters['bike_id'] : null;

        return Inertia::render('admin/rentals/history', [
            'rentals' => $this->rentalRepository->history($filters),
            'bikes' => $this->bikeRepository->all(),
            'summary' => $this->rentalRepository->reportSummary($dateFrom, $dateTo, $bikeId),
            'filters' => $filters,
        ]);
    }

    public function exportCsv(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $filters = $request->only(['date_from', 'date_to', 'bike_id']);
        $rentals = $this->rentalRepository->historyAll($filters);
        $filename = 'alugueis_' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($rentals) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, ['ID', 'Bicicleta', 'Cliente', 'Início', 'Fim', 'Tempo Solicitado (min)', 'Duração Real (min)', 'Valor (R$)'], ';');

            foreach ($rentals as $rental) {
                fputcsv($handle, [
                    $rental->id,
                    $rental->bike->nome,
                    $rental->customer->nome,
                    $rental->start_time,
                    $rental->end_time,
                    $rental->tempo_solicitado,
                    $rental->total_minutes,
                    $rental->valor_total,
                ], ';');
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function formatBillingData(Rental $rental): array
    {
        return [
            'bike_nome' => $rental->bike->nome,
            'customer_nome' => $rental->customer->nome,
            'customer_telefone' => $rental->customer->telefone,
            'total_minutes' => $rental->total_minutes ?? 0,
            'total_seconds' => $rental->total_seconds ?? (($rental->total_minutes ?? 0) * 60),
            'valor_total' => (float) ($rental->valor_total ?? 0),
        ];
    }

    private function resolveRedirectRoute(?string $route): string
    {
        return in_array($route, ['admin.dashboard', 'employee.dashboard', 'admin.rentals.operations'], true)
            ? $route
            : 'employee.dashboard';
    }
}
