<?php

use App\Models\PushSubscription;
use App\Models\User;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\postJson;

test('admin can store push subscription', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    actingAs($admin);

    $response = postJson(route('push-subscriptions.store'), [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-1',
        'public_key' => 'test-public-key',
        'auth_token' => 'test-auth-token',
        'content_encoding' => 'aes128gcm',
    ]);

    $response->assertCreated()->assertJson(['success' => true]);

    assertDatabaseHas('push_subscriptions', [
        'user_id' => $admin->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-1',
        'public_key' => 'test-public-key',
        'auth_token' => 'test-auth-token',
        'content_encoding' => 'aes128gcm',
    ]);
});

test('employee can not store push subscription', function () {
    $employee = User::factory()->create(['role' => 'employee']);

    actingAs($employee);

    $response = postJson(route('push-subscriptions.store'), [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-2',
        'public_key' => 'test-public-key',
        'auth_token' => 'test-auth-token',
        'content_encoding' => 'aes128gcm',
    ]);

    $response->assertForbidden();

    assertDatabaseMissing('push_subscriptions', [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/test-endpoint-2',
    ]);
});

test('storing a new endpoint removes stale subscriptions for the same admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    PushSubscription::query()->create([
        'user_id' => $admin->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/old-endpoint',
        'public_key' => 'old-public',
        'auth_token' => 'old-auth',
        'content_encoding' => 'aes128gcm',
    ]);

    actingAs($admin);

    $response = postJson(route('push-subscriptions.store'), [
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/new-endpoint',
        'public_key' => 'new-public',
        'auth_token' => 'new-auth',
        'content_encoding' => 'aes128gcm',
    ]);

    $response->assertCreated();

    expect(PushSubscription::query()->where('user_id', $admin->id)->count())->toBe(1);

    assertDatabaseHas('push_subscriptions', [
        'user_id' => $admin->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/new-endpoint',
    ]);

    assertDatabaseMissing('push_subscriptions', [
        'user_id' => $admin->id,
        'endpoint' => 'https://fcm.googleapis.com/fcm/send/old-endpoint',
    ]);
});
