<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBikeRequest;
use App\Http\Requests\UpdateBikeRequest;
use App\Models\Bike;
use App\Repositories\BikeRepository;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BikeController extends Controller
{
    public function __construct(private readonly BikeRepository $bikeRepository) {}

    public function index(): Response
    {
        return Inertia::render('admin/bikes/index', [
            'bikes' => $this->bikeRepository->all(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/bikes/create');
    }

    public function store(StoreBikeRequest $request): RedirectResponse
    {
        $this->bikeRepository->create($request->validated());

        return redirect()->route('admin.bikes.index')->with('success', 'Bicicleta cadastrada com sucesso.');
    }

    public function edit(Bike $bike): Response
    {
        return Inertia::render('admin/bikes/edit', [
            'bike' => $bike,
        ]);
    }

    public function update(UpdateBikeRequest $request, Bike $bike): RedirectResponse
    {
        $this->bikeRepository->update($bike, $request->validated());

        return redirect()->route('admin.bikes.index')->with('success', 'Bicicleta atualizada com sucesso.');
    }

    public function destroy(Bike $bike): RedirectResponse
    {
        $this->bikeRepository->delete($bike);

        return redirect()->route('admin.bikes.index')->with('success', 'Bicicleta removida com sucesso.');
    }
}
