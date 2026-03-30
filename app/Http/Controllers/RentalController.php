<?php

namespace App\Http\Controllers;

use App\Http\Requests\StartRentalRequest;
use App\Models\Rental;
use App\Repositories\BikeRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\RentalRepository;
use App\Services\RentalService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $filters = $request->only(['date_from', 'date_to', 'bike_id', 'customer_name']);

        $dateFrom = $filters['date_from'] ?? now()->startOfMonth()->toDateString();
        $dateTo = $filters['date_to'] ?? now()->toDateString();
        $bikeId = isset($filters['bike_id']) ? (int) $filters['bike_id'] : null;
        $customerName = $filters['customer_name'] ?? null;

        return Inertia::render('admin/rentals/history', [
            'rentals' => $this->rentalRepository->history($filters),
            'bikes' => $this->bikeRepository->all(),
            'summary' => $this->rentalRepository->reportSummary($dateFrom, $dateTo, $bikeId, $customerName),
            'filters' => $filters,
        ]);
    }

    public function export(Request $request, string $format): StreamedResponse
    {
        $filters = $request->only(['date_from', 'date_to', 'bike_id', 'customer_name']);
        $rentals = $this->rentalRepository->historyAll($filters);
        $format = strtolower($format);

        return match ($format) {
            'csv' => $this->streamCsv($rentals),
            'excel' => $this->streamExcel($rentals),
            'pdf' => $this->streamPdf($rentals),
            default => abort(404),
        };
    }

    private function streamCsv(Collection $rentals): StreamedResponse
    {
        $filename = 'alugueis_' . now()->format('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($rentals): void {
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

    private function streamExcel(Collection $rentals): StreamedResponse
    {
        $filename = 'alugueis_' . now()->format('Y-m-d') . '.xls';
        $rows = $rentals->map(function (Rental $rental): string {
            $columns = [
                $rental->id,
                $rental->bike->nome,
                $rental->customer->nome,
                $rental->start_time,
                $rental->end_time,
                $rental->tempo_solicitado,
                $rental->total_minutes,
                $rental->valor_total,
            ];

            $escaped = array_map(static fn($value): string => '<td>' . e((string) ($value ?? '')) . '</td>', $columns);

            return '<tr>' . implode('', $escaped) . '</tr>';
        })->implode('');

        $table = '<table border="1"><thead><tr>'
            . '<th>ID</th><th>Bicicleta</th><th>Cliente</th><th>Início</th><th>Fim</th><th>Tempo Solicitado (min)</th><th>Duração Real (min)</th><th>Valor (R$)</th>'
            . '</tr></thead><tbody>' . $rows . '</tbody></table>';

        return response()->streamDownload(fn() => print $table, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
        ]);
    }

    private function streamPdf(Collection $rentals): StreamedResponse
    {
        $filename = 'alugueis_' . now()->format('Y-m-d') . '.pdf';
        $pdf = new \FPDF('P', 'mm', 'A4');
        $pdf->SetCompression(false);
        $pdf->AddPage();
        $pdf->SetMargins(10, 10, 10);

        $pdf->SetFont('Arial', 'B', 14);
        $pdf->Cell(0, 10, 'Relatorio de Alugueis', 0, 1, 'C');
        $pdf->Ln(2);

        $headers = [
            ['label' => 'ID', 'width' => 12],
            ['label' => 'Bicicleta', 'width' => 32],
            ['label' => 'Cliente', 'width' => 32],
            ['label' => 'Inicio', 'width' => 35],
            ['label' => 'Fim', 'width' => 35],
            ['label' => 'Tempo (min)', 'width' => 24],
            ['label' => 'Valor (R$)', 'width' => 22],
        ];

        $pdf->SetFont('Arial', 'B', 9);
        foreach ($headers as $header) {
            $pdf->Cell($header['width'], 8, $header['label'], 1, 0, 'L');
        }
        $pdf->Ln();

        $pdf->SetFont('Arial', '', 8);
        foreach ($rentals as $rental) {
            $pdf->Cell($headers[0]['width'], 7, (string) $rental->id, 1);
            $pdf->Cell($headers[1]['width'], 7, mb_strimwidth($rental->bike->nome, 0, 28, '...'), 1);
            $pdf->Cell($headers[2]['width'], 7, mb_strimwidth($rental->customer->nome, 0, 28, '...'), 1);
            $pdf->Cell($headers[3]['width'], 7, $this->formatDateForPdf($rental->start_time), 1);
            $pdf->Cell($headers[4]['width'], 7, $this->formatDateForPdf($rental->end_time), 1);
            $pdf->Cell(
                $headers[5]['width'],
                7,
                $rental->total_minutes !== null ? (string) $rental->total_minutes : '-',
                1,
                0,
                'R'
            );
            $pdf->Cell(
                $headers[6]['width'],
                7,
                $rental->valor_total ? number_format((float) $rental->valor_total, 2, ',', '.') : '-',
                1,
                0,
                'R'
            );
            $pdf->Ln();
        }

        $content = $pdf->Output('S');

        return response()->streamDownload(fn() => print $content, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }

    private function formatDateForPdf(?string $timestamp): string
    {
        if (! $timestamp) {
            return '-';
        }

        return Carbon::parse($timestamp)->format('d/m/Y H:i');
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
