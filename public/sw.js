// PROTOCOL Dental Clinical Guide - High-Performance PWA Service Worker
const CACHE_NAME = 'protocol-pwa-v7';
const RUNTIME_CACHE = 'protocol-runtime-v7';

// Core assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/protocol-icon.svg',
  '/favicon.ico',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/protocol_circular_logo.png',
  '/brand_new_circular_logo.png',
  '/protocol_logo.png'
];

// Install Event: Pre-cache critical application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Some precache assets could not be cached immediately:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event: Clean up outdated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event: Intelligent caching strategy for HTML, Scripts, Styles, Images & Fonts
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle HTTP/HTTPS GET requests
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  const url = new URL(request.url);

  // CRITICAL: Completely bypass Firebase, Firestore WebChannel, Cloud Storage, and Google APIs
  // to ensure unhindered real-time synchronization across devices and PWA installations
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebasestorage.app') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.pathname.includes('/api/')
  ) {
    return;
  }

  // Strategy 1: HTML Navigations (Network-First with Cache Fallback)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          return caches.match('/');
        })
    );
    return;
  }

  // Strategy 1.5: Branding Logos and Versioned Assets (Network-First to prevent stale logos across devices)
  const isBrandingOrBusted =
    url.searchParams.has('v') ||
    /protocol_.*(logo|stamp|icon)/i.test(url.pathname) ||
    url.pathname.includes('circular_logo');

  if (isBrandingOrBusted) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Strategy 2: Google Fonts, Images, and Static Media (Cache-First with Background Fetch)
  const isFont = url.hostname.includes('fonts.gstatic.com') || url.hostname.includes('fonts.googleapis.com');
  const isImageOrMedia = /\.(png|jpg|jpeg|svg|webp|gif|ico|woff|woff2|ttf|eot)(\?.*)?$/i.test(url.pathname);

  if (isFont || isImageOrMedia) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch fresh copy in background if online
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        }).catch(() => {
          // If offline and requesting an image, return default fallback if available
          if (isImageOrMedia) {
            return caches.match('/favicon.svg');
          }
        });
      })
    );
    return;
  }

  // Strategy 3: Scripts & Styles (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

// ============================================================================
// Advanced Background Push Notifications & Interaction Engine
// ============================================================================

// 1. Push Event: Receive Web Push Notifications even when app is closed
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      try {
        data = { message: event.data.text() };
      } catch {
        data = { message: 'إشعار سريري جديد من تطبيق بروتوكول PROTOCOL' };
      }
    }
  } else {
    data = { message: 'إشعار سريري جديد من تطبيق بروتوكول PROTOCOL' };
  }

  // Determine category and customize title & actions
  const notifType = data.type || 'clinical_update';
  let defaultTitle = 'بروتوكول PROTOCOL | إشعار سريري 🔔';
  let targetUrl = data.url || '/';
  let actions = [
    { action: 'open', title: 'فتح التطبيق 📱' },
    { action: 'dismiss', title: 'إغلاق ✕' },
  ];

  if (notifType === 'drug_guide' || notifType === 'drug_addition') {
    defaultTitle = 'بروتوكول | إضافة دوائية سريرية جديدة 💊';
    targetUrl = data.url || '/?tab=prescriptions';
    actions = [
      { action: 'view_drug', title: 'دليل الأدوية 💊' },
      { action: 'dismiss', title: 'تجاهل ✕' },
    ];
  } else if (notifType === 'schedule_reminder' || notifType === 'clinic_slot') {
    defaultTitle = 'بروتوكول | تذكير جدول العيادات والمواعيد 📅';
    targetUrl = data.url || '/?tab=clinical_companion';
    actions = [
      { action: 'view_schedule', title: 'جدول العيادة 📅' },
      { action: 'dismiss', title: 'تجاهل ✕' },
    ];
  } else if (notifType === 'clinical_update') {
    defaultTitle = 'بروتوكول | تحديث بروتوكول سريري جديد 🩺';
    targetUrl = data.url || '/?tab=slides';
    actions = [
      { action: 'view_update', title: 'عرض البروتوكول 🩺' },
      { action: 'dismiss', title: 'تجاهل ✕' },
    ];
  }

  const title = data.title || defaultTitle;
  const body = data.message || data.body || 'لديك تحديث سريري جديد في تطبيق بروتوكول';
  const icon = data.icon || '/icon-192.png';
  const badge = data.badge || '/favicon.svg';
  const tag = data.tag || `protocol_push_${notifType}_${Date.now()}`;

  const options = {
    body,
    icon,
    badge,
    tag,
    renotify: true,
    requireInteraction: false,
    silent: false,
    vibrate: [250, 100, 250, 100, 250],
    data: {
      ...data,
      url: targetUrl,
      notifType,
      timestamp: Date.now(),
    },
    actions,
    dir: 'rtl',
    lang: 'ar',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. Notification Click Handling: Direct deep-linking to clinical sections
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  let targetUrl = event.notification.data?.url || '/';
  if (event.action === 'view_drug') {
    targetUrl = '/?tab=prescriptions';
  } else if (event.action === 'view_schedule') {
    targetUrl = '/?tab=clinical_companion';
  } else if (event.action === 'view_update') {
    targetUrl = '/?tab=slides';
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If an existing app window is open, focus it and broadcast event
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (client.postMessage) {
            client.postMessage({
              type: 'PROTOCOL_NOTIFICATION_CLICKED',
              payload: event.notification.data,
              action: event.action,
              targetUrl,
            });
          }
          if (client.navigate && client.url && !client.url.includes(targetUrl)) {
            return client.navigate(targetUrl);
          }
          return client;
        }
      }

      // 2. Otherwise open a new standalone window directly to the target section
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 3. Push Subscription Change Event: Re-subscribe if token rotates
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({ userVisibleOnly: true })
      .then((newSubscription) => {
        console.log('[SW] Push subscription regenerated successfully:', newSubscription.endpoint);
        // Inform active clients of the new subscription
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'PUSH_SUBSCRIPTION_ROTATED',
              endpoint: newSubscription.endpoint,
            });
          });
        });
      })
      .catch((err) => {
        console.warn('[SW] Push subscription regeneration failed:', err);
      })
  );
});

// 4. Client Message Event: Direct dispatch of background notifications from the app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_BACKGROUND_NOTIFICATION') {
    const { title, options } = event.data.payload || {};
    if (title && self.registration?.showNotification) {
      self.registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        dir: 'rtl',
        lang: 'ar',
        ...options,
      });
    }
  } else if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
