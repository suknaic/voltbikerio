import { useCallback, useEffect, useRef, useState } from 'react';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function getXsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function isPushSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator &&
        'PushManager' in window
    );
}

export type PushPermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

export type UsePushSubscriptionReturn = {
    permissionState: PushPermissionState;
    requestAndSubscribe: () => Promise<void>;
};

export function usePushSubscription(vapidPublicKey: string | null, isAdmin: boolean): UsePushSubscriptionReturn {
    const [permissionState, setPermissionState] = useState<PushPermissionState>('unsupported');
    const hasSubscribedRef = useRef(false);

    useEffect(() => {
        if (!isPushSupported() || !isAdmin || !vapidPublicKey) {
            return;
        }
        setPermissionState(Notification.permission as PushPermissionState);
    }, [isAdmin, vapidPublicKey]);

    // Silently re-subscribe if permission was already granted on a previous session.
    useEffect(() => {
        if (!isPushSupported() || !isAdmin || !vapidPublicKey) {
            return;
        }
        if (Notification.permission !== 'granted' || hasSubscribedRef.current) {
            return;
        }
        void sendSubscriptionToServer(vapidPublicKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin, vapidPublicKey]);

    async function sendSubscriptionToServer(publicKey: string): Promise<void> {
        if (hasSubscribedRef.current) {
            return;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            const json = subscription.toJSON();

            await fetch('/push-subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    public_key: json.keys?.p256dh ?? '',
                    auth_token: json.keys?.auth ?? '',
                    content_encoding: 'aes128gcm',
                }),
            });

            hasSubscribedRef.current = true;
        } catch {
            // Silently handle errors (permission revoked mid-flow, SW not ready, etc.)
        }
    }

    const requestAndSubscribe = useCallback(async (): Promise<void> => {
        if (!isPushSupported() || !vapidPublicKey) {
            return;
        }
        const permission = await Notification.requestPermission();
        setPermissionState(permission as PushPermissionState);

        if (permission !== 'granted') {
            return;
        }
        await sendSubscriptionToServer(vapidPublicKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vapidPublicKey]);

    return { permissionState, requestAndSubscribe };
}
