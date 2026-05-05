<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Atualizar registros existentes com o telefone do cliente
        $rentals = DB::table('rentals')->whereNull('telefone_cliente')->get();

        foreach ($rentals as $rental) {
            $customer = DB::table('customers')->where('id', $rental->customer_id)->first();

            if ($customer) {
                DB::table('rentals')->where('id', $rental->id)->update([
                    'telefone_cliente' => $customer->telefone,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Não é necessário reverter esta atualização
    }
};
