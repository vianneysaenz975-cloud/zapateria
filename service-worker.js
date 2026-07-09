// =====================================================
// SERVICE WORKER - HORMA Sneaker Culture
// =====================================================

const CACHE_NAME = 'horma-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/icon-192.png',
    // Si tienes más archivos, agrégalos aquí
    // '/style.css',
    // '/script.js',
    // '/icon-512.png'
];

// =====================================================
// INSTALACIÓN
// =====================================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// =====================================================
// ACTIVACIÓN
// =====================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Cache antiguo eliminado:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    );
});

// =====================================================
// INTERCEPTAR SOLICITUDES (OFFLINE)
// =====================================================
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si está en cache, devolverlo
                if (response) {
                    return response;
                }

                // Si no, hacer la solicitud a la red
                return fetch(event.request).then((response) => {
                    // Si la respuesta no es válida, devolverla así
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clonar la respuesta para guardarla en cache
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch(() => {
                    // Si falla la red y no está en cache, mostrar página offline
                    // (opcional: puedes crear un offline.html)
                    return new Response('⚠️ Sin conexión a internet', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});

// =====================================================
// NOTIFICACIONES PUSH (opcional)
// =====================================================
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            { action: 'explore', title: 'Ver tienda', icon: '👟' },
            { action: 'close', title: 'Cerrar', icon: '❌' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('👟 HORMA', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
