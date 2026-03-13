<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bikes', function (Blueprint $table) {
            $table->dropColumn('preco_por_minuto');
            $table->string('foto_url')->nullable();
            $table->boolean('disponivel')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bikes', function (Blueprint $table) {
            $table->decimal('preco_por_minuto', 8, 2)->default(0);
            $table->dropColumn('foto_url');
            $table->dropColumn('disponivel');
        });
    }
};
