<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class PushNotificationService
{
    /**
     * @param  array{title: string, body: string, icon?: string, badge?: string, data?: array<string, mixed>}  $payload
     */
    public function sendToAdmins(array $payload): void
    {
        $vapidSubject = config('services.vapid.subject');
        $vapidPublicKey = config('services.vapid.public_key');
        $vapidPrivateKey = config('services.vapid.private_key');

        if (! $vapidSubject || ! $vapidPublicKey || ! $vapidPrivateKey) {
            Log::warning('Push notifications skipped because VAPID configuration is incomplete.');

            return;
        }

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => $vapidSubject,
                'publicKey' => $vapidPublicKey,
                'privateKey' => $vapidPrivateKey,
            ],
        ]);

        $payload['icon'] ??= '/icons/icon-192.png';
        $payload['badge'] ??= '/icons/icon-192.png';

        try {
            $encodedPayload = json_encode($payload, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            Log::error('Push notification payload encoding failed.', [
                'error' => $exception->getMessage(),
            ]);

            return;
        }

        User::query()
            ->where('role', 'admin')
            ->with('pushSubscriptions')
            ->get()
            ->each(function (User $admin) use ($webPush, $encodedPayload): void {
                foreach ($admin->pushSubscriptions as $subscription) {
                    $webPush->queueNotification(
                        Subscription::create([
                            'endpoint' => $subscription->endpoint,
                            'publicKey' => $subscription->public_key,
                            'authToken' => $subscription->auth_token,
                            'contentEncoding' => $subscription->content_encoding,
                        ]),
                        $encodedPayload,
                    );
                }
            });

        foreach ($webPush->flush() as $report) {
            if ($report->isSubscriptionExpired()) {
                PushSubscription::query()
                    ->where('endpoint', $report->getEndpoint())
                    ->delete();

                continue;
            }

            if (! $report->isSuccess()) {
                Log::warning('Push notification delivery failed.', [
                    'endpoint' => $report->getEndpoint(),
                    'reason' => $report->getReason(),
                ]);
            }
        }
    }
}
