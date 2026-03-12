<?php

namespace App\Listeners;

use App\Events\RentalEnded;
use App\Services\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendRentalEndedPushNotification implements ShouldQueue
{
    public function __construct(private readonly PushNotificationService $pushNotificationService) {}

    public function handle(RentalEnded $event): void
    {
        $rental = $event->rental;

        $totalMinutes = $rental->total_minutes ?? 0;
        $valorTotal = number_format((float) $rental->valor_total, 2, ',', '.');

        $this->pushNotificationService->sendToAdmins([
            'title' => 'Aluguel encerrado',
            'body' => "{$rental->bike->nome} — {$rental->customer->nome} · {$totalMinutes}min · R$ {$valorTotal}",
            'data' => ['url' => '/admin/dashboard'],
        ]);
    }
}
