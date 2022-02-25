const CACHE_NAME = 'w2w-static-cache-v1';

const FILES_TO_CACHE = [
	'/offline.html'
];

self.addEventListener('install', event => {
	console.log('[ServiceWorker] Installed');

	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log('[ServiceWorker] Pre-caching offline page');
			return cache.addAll(FILES_TO_CACHE);
		})
	);

	self.skipWaiting();
});

self.addEventListener('activate', event => {
	console.log('[ServiceWorker] Activated');
	event.waitUntil(
		caches.keys().then(keyList => Promise.all(keyList.map(key => {
			if (key !== CACHE_NAME) {
				console.log('[ServiceWorker] Removing old cache', key);
				return caches.delete(key);
			}
		})))
	);

	self.clients.claim();
});

self.addEventListener('fetch', event => {
	console.log('[ServiceWorker] Fetch', event.request.url);
	if (event.request.mode !== 'navigate') return;
	event.respondWith(
		fetch(event.request)
			.catch(() => caches.open(CACHE_NAME)
				.then(cache => cache.match('offline.html')))
	);
});
