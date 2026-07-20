<?php

namespace App\Http\Controllers;

use App\Events\BikeAvailabilityChanged;
use App\Http\Requests\StoreBikeRequest;
use App\Http\Requests\UpdateBikeRequest;
use App\Models\Bike;
use App\Models\VehicleCategory;
use App\Repositories\BikeRepository;
use App\Services\RentalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class BikeController extends Controller
{
    public function __construct(
        private readonly BikeRepository $bikeRepository,
        private readonly RentalService $rentalService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/bikes/index', [
            'bikes' => $this->bikeRepository->all(),
            'categories' => VehicleCategory::query()->withCount('bikes')->orderBy('ordem')->orderBy('nome')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/bikes/create', [
            'categories' => VehicleCategory::query()->orderBy('ordem')->orderBy('nome')->get(),
        ]);
    }

    public function store(StoreBikeRequest $request): RedirectResponse
    {
        $data = collect($request->validated())->except('foto')->toArray();

        if ($request->hasFile('foto')) {
            File::ensureDirectoryExists(public_path('assets/upload/foto/bike'));
            $file = $request->file('foto');
            $filename = uniqid('bike_').'.'.$file->getClientOriginalExtension();
            $file->move(public_path('assets/upload/foto/bike'), $filename);
            $data['foto_url'] = 'assets/upload/foto/bike/'.$filename;
        }

        $this->bikeRepository->create($data);

        return redirect()->route('admin.bikes.index')->with('success', 'Bicicleta cadastrada com sucesso.');
    }

    public function edit(Bike $bike): Response
    {
        return Inertia::render('admin/bikes/edit', [
            'bike' => $bike,
            'categories' => VehicleCategory::query()->orderBy('ordem')->orderBy('nome')->get(),
        ]);
    }

    public function update(UpdateBikeRequest $request, Bike $bike): RedirectResponse
    {
        $data = collect($request->validated())->except('foto')->toArray();

        if ($request->hasFile('foto')) {
            // Delete old photo if exists
            if ($bike->foto_url && file_exists(public_path($bike->foto_url))) {
                unlink(public_path($bike->foto_url));
            }

            File::ensureDirectoryExists(public_path('assets/upload/foto/bike'));
            $file = $request->file('foto');
            $filename = uniqid('bike_').'.'.$file->getClientOriginalExtension();
            $file->move(public_path('assets/upload/foto/bike'), $filename);
            $data['foto_url'] = 'assets/upload/foto/bike/'.$filename;
        }

        $this->bikeRepository->update($bike, $data);

        return redirect()->route('admin.bikes.index')->with('success', 'Bicicleta atualizada com sucesso.');
    }

    public function destroy(Bike $bike): RedirectResponse
    {
        if ($bike->rentals()->whereNull('end_time')->exists()) {
            return redirect()->route('admin.bikes.index')
                ->with('error', 'Não é possível excluir veículo com aluguel ativo.');
        }

        if ($bike->foto_url && file_exists(public_path($bike->foto_url))) {
            unlink(public_path($bike->foto_url));
        }

        $this->bikeRepository->delete($bike);

        return redirect()->route('admin.bikes.index')->with('success', 'Bicicleta removida com sucesso.');
    }

    public function forceAvailable(Bike $bike): RedirectResponse
    {
        $activeRental = $bike->rentals()->whereNull('end_time')->first();

        if ($activeRental) {
            $this->rentalService->endRental($activeRental);
        }

        $this->bikeRepository->markAsAvailable($bike);
        BikeAvailabilityChanged::dispatch($bike->fresh());

        return redirect()->route('admin.bikes.index')->with('success', 'Veículo disponibilizado com sucesso.');
    }

    public function toggleStatus(Bike $bike): RedirectResponse
    {
        $bike->disponivel = ! $bike->disponivel;
        $bike->save();
        BikeAvailabilityChanged::dispatch($bike);

        return redirect()->route('admin.bikes.index');
    }
}
