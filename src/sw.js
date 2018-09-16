import idb from 'idb';

var cacheId = 'udct-rest-001';
var cachesAdd = ['/', 'index.html', 'restaurant.html', 'css/styles.css',
                 'js/dbhelper.js', 'js/main.js', 'js/restaurant_info.js'];
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheId).then(c => {
            return c.addAll(cachesAdd)
            .catch(error => {
                console.log('Cache failed' + error);
            });
        })
    );
});

self.addEventListener('fetch', e => {
    let cacheRequest = e.request;
    let urlRequest = new URL(e.request.url);
    if (e.request.url.includes('restaurant.html')) {
        const urlCache = 'restaurant.html';
        cacheRequest = new Request(urlCache);
    }

    e.respondWith(
        caches.match(cacheRequest).then(response => {
            return (
                response || fetch(e.request)
                .then(fetchResponse => {
                    return caches.open(cacheId).then(c => {
                        c.put(e.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                })
                .catch(error => {
                    return new Response('Internet outage, oops', {
                        status: 404,
                        statusText: 'four oh four'
                    });
                })
            );           
        })
    );
});