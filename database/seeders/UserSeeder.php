<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Gerente',
            'email' => 'admin@bikeshop.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Funcionário',
            'email' => 'employee@bikeshop.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
        ]);
    }
}
