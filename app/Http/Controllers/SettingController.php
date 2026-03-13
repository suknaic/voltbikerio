<?php

namespace App\Http\Controllers;

use App\Http\Requests\SettingUpdateRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/settings', [
            'preco_por_minuto' => Setting::get('preco_por_minuto', '0.25'),
        ]);
    }

    public function update(SettingUpdateRequest $request): RedirectResponse
    {
        Setting::set('preco_por_minuto', $request->validated()['preco_por_minuto']);

        return redirect()->back()->with('success', 'Preço atualizado com sucesso.');
    }
}
