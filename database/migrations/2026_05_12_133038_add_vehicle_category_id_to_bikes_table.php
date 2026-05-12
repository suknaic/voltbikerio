<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bikes', function (Blueprint $table) {
            $table->foreignId('vehicle_category_id')
                ->nullable()
                ->after('id')
                ->constrained('vehicle_categories')
                ->nullOnDelete();
        });

        $defaultCategoryId = DB::table('vehicle_categories')->insertGetId([
            'nome' => 'Bicicleta',
            'preco_por_minuto' => 0.25,
            'ativo' => true,
            'ordem' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('bikes')->update(['vehicle_category_id' => $defaultCategoryId]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bikes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('vehicle_category_id');
        });
    }
};
