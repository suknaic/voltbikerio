<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/employees/index', [
            'employees' => User::where('role', 'employee')->latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/employees/create');
    }

    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        User::create([
            'name' => $request->validated()['name'],
            'email' => $request->validated()['email'],
            'password' => bcrypt($request->validated()['password']),
            'role' => 'employee',
        ]);

        return redirect()->route('admin.employees.index')->with('success', 'Funcionário criado com sucesso.');
    }

    public function edit(User $employee): Response
    {
        return Inertia::render('admin/employees/edit', [
            'employee' => $employee,
        ]);
    }

    public function update(UpdateEmployeeRequest $request, User $employee): RedirectResponse
    {
        $data = $request->validated();

        if ($request->filled('password')) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $employee->update($data);

        return redirect()->route('admin.employees.index')->with('success', 'Funcionário atualizado com sucesso.');
    }

    public function destroy(User $employee): RedirectResponse
    {
        $employee->delete();

        return redirect()->route('admin.employees.index')->with('success', 'Funcionário removido com sucesso.');
    }
}
