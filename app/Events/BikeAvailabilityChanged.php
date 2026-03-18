<?php

namespace App\Events;

use App\Models\Bike;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BikeAvailabilityChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Bike $bike) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('bikes'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'BikeAvailabilityChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'bike' => [
                'id' => $this->bike->id,
                'status' => $this->bike->status,
                'disponivel' => $this->bike->disponivel,
            ],
        ];
    }
}
