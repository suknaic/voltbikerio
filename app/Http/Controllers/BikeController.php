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
            'preco_por_minuto' => \App\Models\Setting::get('preco_por_minuto', '0.25'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/bikes/create');
    }

    public function store(StoreBikeRequest $request): RedirectResponse
    {
        $data = collect($request->validated())->except('foto')->toArray();

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('bikes', 'public');
            $data['foto_url'] = $path;
        }

        $this->bikeRepository->create($data);

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
        $data = collect($request->validated())->except('foto')->toArray();

        if ($request->hasFile('foto')) {
            if ($bike->foto_url && \Storage::disk('public')->exists($bike->foto_url)) {
                \Storage::disk('public')->delete($bike->foto_url);
            }

            $path = $request->file('foto')->store('bikes', 'public');
            $data['foto_url'] = $path;
        }

        $this->bikeRepository->update($bike, $data);

        return redirect()->route('admin.bikes.index')->with('success', 'Bicicleta atualizada com sucesso.');
    }

    public function destroy(Bike $bike): RedirectResponse
    {
        if ($bike->foto_url && \Storage::disk('public')->exists($bike->foto_url)) {
            \Storage::disk('public')->delete($bike->foto_url);
        }

        $this->bikeRepository->delete($bike);

        return redirect()->route('admin.bikes.index')->with('success', 'Bicicleta removida com sucesso.');
    }

    public function toggleStatus(Bike $bike): RedirectResponse
    {
        $bike->disponivel = ! $bike->disponivel;
        $bike->save();

        return redirect()->route('admin.bikes.index');
    }
}
