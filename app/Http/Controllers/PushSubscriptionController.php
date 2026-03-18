<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePushSubscriptionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PushSubscriptionController extends Controller
{
    public function store(StorePushSubscriptionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Remove stale subscriptions so each user only has one active subscription.
        // This prevents duplicate push notifications when a browser regenerates its
        // push endpoint (e.g. after a service worker update or browser reinstall).
        $request->user()->pushSubscriptions()
            ->where('endpoint', '!=', $validated['endpoint'])
            ->delete();

        $request->user()->pushSubscriptions()->updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'public_key' => $validated['public_key'],
                'auth_token' => $validated['auth_token'],
                'content_encoding' => $validated['content_encoding'] ?? 'aes128gcm',
            ],
        );

        return response()->json(['success' => true], 201);
    }

    public function destroy(Request $request): Response
    {
        $request->user()
            ->pushSubscriptions()
            ->where('endpoint', $request->input('endpoint'))
            ->delete();

        return response()->noContent();
    }
}
