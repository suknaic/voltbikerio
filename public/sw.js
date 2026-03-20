const CACHE_NAME = 'bike-rental-v1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name)),
            ),
        ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only cache GET requests for static assets
    if (event.request.method !== 'GET') {
        return;
    }

    const url = new URL(event.request.url);

    // Skip API/Inertia requests - always network first
    if (url.pathname.startsWith('/api') || event.request.headers.get('X-Inertia')) {
        return;
    }

    // For static assets (JS, CSS, images) - cache first
    if (url.pathname.match(/\.(js|css|png|jpg|svg|ico|woff2?)$/)) {
        event.respondWith(
            caches.match(event.request).then(
                (cached) => cached || fetch(event.request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                }),
            ),
        );
        return;
    }

    // Network first for HTML
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request)),
    );
});

// --- Web Push Notifications ---

self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    let data;
    try {
        data = event.data.json();
    } catch {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // App is open and visible — Pusher/Echo in-app notification handles it.
            const hasVisibleClient = clientList.some((c) => c.visibilityState === 'visible');
            if (hasVisibleClient) {
                return;
            }

            // App is closed or in background — show OS notification.
            return self.registration.showNotification(data.title ?? 'VoltBikeRio', {
                body: data.body ?? '',
                icon: data.icon ?? '/icons/icon-192.png',
                badge: data.badge ?? '/icons/icon-192.png',
                data: data.data ?? {},
                requireInteraction: false,
            });
        }),
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url ?? '/admin/dashboard';

    event.waitUntil(
        clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if ('focus' in client) {
                        return client.navigate(targetUrl).then((c) => c?.focus());
                    }
                }

                return clients.openWindow?.(targetUrl);
            }),
    );
});
