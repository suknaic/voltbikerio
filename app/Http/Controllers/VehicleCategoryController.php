<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVehicleCategoryRequest;
use App\Http\Requests\UpdateVehicleCategoryRequest;
use App\Models\VehicleCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class VehicleCategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => VehicleCategory::query()
                ->withCount('bikes')
                ->orderBy('ordem')
                ->orderBy('nome')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/create');
    }

    public function store(StoreVehicleCategoryRequest $request): RedirectResponse
    {
        VehicleCategory::create($request->validated());

        return redirect()->route('admin.categories.index')->with('success', 'Categoria cadastrada com sucesso.');
    }

    public function edit(VehicleCategory $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => $category->loadCount('bikes'),
        ]);
    }

    public function update(UpdateVehicleCategoryRequest $request, VehicleCategory $category): RedirectResponse
    {
        $category->update($request->validated());

        return redirect()->route('admin.categories.index')->with('success', 'Categoria atualizada com sucesso.');
    }
}
