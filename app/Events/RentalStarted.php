<?php

namespace App\Events;

use App\Models\Rental;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RentalStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Rental $rental) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('rentals'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'rental' => [
                'id' => $this->rental->id,
                'start_time' => $this->rental->start_time,
                'bike' => [
                    'id' => $this->rental->bike->id,
                    'nome' => $this->rental->bike->nome,
                ],
                'customer' => [
                    'id' => $this->rental->customer->id,
                    'nome' => $this->rental->customer->nome,
                ],
            ],
        ];
    }
}
