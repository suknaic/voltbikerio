<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Repositories\CustomerRepository;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function __construct(private readonly CustomerRepository $customerRepository) {}

    public function index(): Response
    {
        return Inertia::render('employee/customers/index', [
            'customers' => $this->customerRepository->paginate(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('employee/customers/create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $this->customerRepository->create($request->validated());

        return redirect()->route('customers.index')->with('success', 'Cliente cadastrado com sucesso.');
    }
}
