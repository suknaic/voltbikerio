<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Atualizar registros existentes com o telefone do cliente
        DB::statement('
            UPDATE rentals r
            INNER JOIN customers c ON r.customer_id = c.id
            SET r.telefone_cliente = c.telefone
            WHERE r.telefone_cliente IS NULL
        ');
    }

    public function down(): void
    {
        // Não é necessário reverter esta atualização
    }
};
