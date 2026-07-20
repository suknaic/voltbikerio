<?php

use App\Http\Controllers\BikeController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\VehicleCategoryController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    // Redirect /dashboard based on role
    Route::get('dashboard', function () {
        /** @var User $user */
        $user = Auth::user();

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
        Route::get('rentals/operations', [DashboardController::class, 'rentalOperations'])->name('rentals.operations');
        Route::get('categories', [VehicleCategoryController::class, 'index'])->name('categories.index');
        Route::get('categories/create', [VehicleCategoryController::class, 'create'])->name('categories.create');
        Route::post('categories', [VehicleCategoryController::class, 'store'])->name('categories.store');
        Route::get('categories/{category}/edit', [VehicleCategoryController::class, 'edit'])->name('categories.edit');
        Route::patch('categories/{category}', [VehicleCategoryController::class, 'update'])->name('categories.update');
        Route::resource('bikes', BikeController::class)->except(['show']);
        Route::patch('bikes/{bike}/toggle-status', [BikeController::class, 'toggleStatus'])->name('bikes.toggle-status');
        Route::patch('bikes/{bike}/force-available', [BikeController::class, 'forceAvailable'])->name('bikes.force-available');
        Route::get('rentals/history', [RentalController::class, 'history'])->name('rentals.history');
        Route::get('rentals/export/{format}', [RentalController::class, 'export'])->name('rentals.export');
        Route::resource('employees', EmployeeController::class);
    });

    // Employee routes
    Route::middleware('role:employee,admin')->prefix('employee')->name('employee.')->group(function (): void {
        Route::get('dashboard', [DashboardController::class, 'employee'])->name('dashboard');
        Route::get('rentals', [RentalController::class, 'index'])->name('rentals.index');
        Route::get('rentals/history', [RentalController::class, 'employeeHistory'])->name('rentals.history');
        Route::post('rentals', [RentalController::class, 'store'])->name('rentals.store');
        Route::get('rentals/{rental}/billing', [RentalController::class, 'billing'])->name('rentals.billing');
        Route::patch('rentals/{rental}/end', [RentalController::class, 'end'])->name('rentals.end');
    });

    // Customer routes (employee + admin)
    Route::middleware('role:employee,admin')->prefix('customers')->name('customers.')->group(function (): void {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
        Route::get('/create', [CustomerController::class, 'create'])->name('create');
        Route::post('/', [CustomerController::class, 'store'])->name('store');
        Route::get('/find-by-phone', [CustomerController::class, 'findByPhone'])->name('find-by-phone');
    });
});

require __DIR__ . '/settings.php';
