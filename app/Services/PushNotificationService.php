<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class PushNotificationService
{
    /**
     * @param  array{title: string, body: string, icon?: string, badge?: string, data?: array<string, mixed>}  $payload
     */
    public function sendToAdmins(array $payload): void
    {
        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('services.vapid.subject'),
                'publicKey' => config('services.vapid.public_key'),
                'privateKey' => config('services.vapid.private_key'),
            ],
        ]);

        $payload['icon'] ??= '/icons/icon-192.png';
        $payload['badge'] ??= '/icons/icon-192.png';

        $encodedPayload = json_encode($payload);

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
            }
        }
    }
}
