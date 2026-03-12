<?php

namespace App\Listeners;

use App\Events\RentalStarted;
use App\Services\PushNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendRentalStartedPushNotification implements ShouldQueue
{
    public function __construct(private readonly PushNotificationService $pushNotificationService) {}

    public function handle(RentalStarted $event): void
    {
        $rental = $event->rental;

        $this->pushNotificationService->sendToAdmins([
            'title' => 'Aluguel iniciado',
            'body' => "{$rental->bike->nome} — {$rental->customer->nome}",
            'data' => ['url' => '/admin/dashboard'],
        ]);
    }
}
