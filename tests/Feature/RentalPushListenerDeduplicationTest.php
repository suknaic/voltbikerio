<?php

use App\Events\RentalEnded;
use App\Events\RentalStarted;
use App\Listeners\SendRentalEndedPushNotification;
use App\Listeners\SendRentalStartedPushNotification;
use App\Models\Rental;
use Illuminate\Events\CallQueuedListener;
use Illuminate\Support\Facades\Queue;

test('rental started queues push listener only once', function () {
  Queue::fake();

  $rental = Rental::factory()->create();

  event(new RentalStarted($rental));

  Queue::assertPushed(
    CallQueuedListener::class,
    fn(CallQueuedListener $job): bool => $job->class === SendRentalStartedPushNotification::class,
  );

  Queue::assertPushedTimes(CallQueuedListener::class, 1);
});

test('rental ended queues push listener only once', function () {
  Queue::fake();

  $rental = Rental::factory()->create();

  event(new RentalEnded($rental));

  Queue::assertPushed(
    CallQueuedListener::class,
    fn(CallQueuedListener $job): bool => $job->class === SendRentalEndedPushNotification::class,
  );

  Queue::assertPushedTimes(CallQueuedListener::class, 1);
});
