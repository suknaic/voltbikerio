<?php

use App\Http\Controllers\BikeController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\RentalController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    // Redirect /dashboard based on role
    Route::get('dashboard', function () {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        return $user->isAdmin()
            ? redirect()->route('admin.dashboard')
            : redirect()->route('employee.dashboard');
    })->name('dashboard');

    // Push subscriptions (authorization enforced in StorePushSubscriptionRequest)
    Route::post('push-subscriptions', [PushSubscriptionController::class, 'store'])
        ->name('push-subscriptions.store');
    Route::delete('push-subscriptions', [PushSubscriptionController::class, 'destroy'])
        ->name('push-subscriptions.destroy');

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function (): void {
        Route::get('dashboard', [DashboardController::class, 'admin'])->name('dashboard');
        Route::resource('bikes', BikeController::class)->except(['show']);
        Route::patch('bikes/{bike}/toggle-status', [BikeController::class, 'toggleStatus'])->name('bikes.toggle-status');
        Route::get('rentals/history', [RentalController::class, 'history'])->name('rentals.history');
        Route::get('settings', [\App\Http\Controllers\SettingController::class, 'edit'])->name('settings.edit');
        Route::patch('settings', [\App\Http\Controllers\SettingController::class, 'update'])->name('settings.update');
        Route::resource('employees', \App\Http\Controllers\EmployeeController::class);
    });

    // Employee routes
    Route::middleware('role:employee,admin')->prefix('employee')->name('employee.')->group(function (): void {
        Route::get('dashboard', [DashboardController::class, 'employee'])->name('dashboard');
        Route::get('rentals', [RentalController::class, 'index'])->name('rentals.index');
        Route::post('rentals', [RentalController::class, 'store'])->name('rentals.store');
        Route::get('rentals/{rental}/billing', [RentalController::class, 'billing'])->name('rentals.billing');
        Route::patch('rentals/{rental}/end', [RentalController::class, 'end'])->name('rentals.end');
    });

    // Customer routes (employee + admin)
    Route::middleware('role:employee,admin')->prefix('customers')->name('customers.')->group(function (): void {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
        Route::get('/create', [CustomerController::class, 'create'])->name('create');
        Route::post('/', [CustomerController::class, 'store'])->name('store');
    });
});

require __DIR__ . '/settings.php';
