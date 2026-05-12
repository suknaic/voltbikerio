<?php

use App\Models\User;

test('admin can update an employee without changing email', function () {
  $admin = User::factory()->create(['role' => 'admin']);
  $employeeEmail = fake()->unique()->safeEmail();
  $employee = User::factory()->create([
    'role' => 'employee',
    'email' => $employeeEmail,
  ]);

  /** @var \Tests\TestCase $this */
  $response = $this
    ->actingAs($admin)
    ->patch(route('admin.employees.update', $employee), [
      'name' => 'Funcionario Atualizado',
      'email' => $employee->email,
      'password' => null,
      'password_confirmation' => null,
    ]);

  $response
    ->assertSessionHasNoErrors()
    ->assertRedirect(route('admin.employees.index'));

  expect($employee->refresh()->name)->toBe('Funcionario Atualizado');
  expect($employee->email)->toBe($employeeEmail);
});
