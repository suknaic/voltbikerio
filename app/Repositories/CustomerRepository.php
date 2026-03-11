<?php

namespace App\Repositories;

use App\Models\Customer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CustomerRepository
{
    public function all(): Collection
    {
        return Customer::query()->orderBy('nome')->get();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Customer::query()->orderBy('nome')->paginate($perPage);
    }

    public function findOrFail(int $id): Customer
    {
        return Customer::query()->findOrFail($id);
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }
}
