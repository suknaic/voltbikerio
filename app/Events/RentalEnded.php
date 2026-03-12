<?php

namespace App\Events;

use App\Models\Rental;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RentalEnded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Rental $rental) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('rentals'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'RentalEnded';
    }

    public function broadcastWith(): array
    {
        return [
            'rental' => [
                'id' => $this->rental->id,
                'end_time' => $this->rental->end_time,
                'total_minutes' => $this->rental->total_minutes,
                'valor_total' => $this->rental->valor_total,
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
