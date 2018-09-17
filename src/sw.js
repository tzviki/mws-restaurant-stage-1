import idb from 'idb';

var cacheId = 'udct-rest-001';
var cachesAdd = ['/', 'index.html', 'restaurant.html', 'css/styles.css',
                 'js/dbhelper.js', 'js/main.js', 'js/restaurant_info.js'];

const dbPromise = idb.open('tw-restaurant', 1, upgradeDb => {
    switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurant', {keyPath: 'id'});
    }
});

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

    //Handle db responses
    if (urlRequest.pathname.startsWith('/restaurants')) {
        const pathname = urlRequest.pathname;
        const urlParam = pathname.replace('/restaurants', '');
        const id = urlParam ? urlParam.replace('/','') : '-1';
        e.respondWith(
            dbPromise.then(db => {
                return db.transaction('restaurant').objectStore('restaurant').get(id);
            }).then(data => {
                return(
                    (data && data.data) || 
                    fetch(e.request)
                        .then(response => response.json())
                        .then(jsonResponse => {
                            return dbPromise.then(db => {
                                const transaction = db.transaction('restaurant', 'readwrite');
                                transaction.objectStore('restaurant').put({
                                    id: id,
                                    data: jsonResponse
                                });
                                return jsonResponse;
                            });
                        })
                );
            })
            .then(actualResponse => {
                return new Response(JSON.stringify(actualResponse));
            })
            .catch(error => {
                return new Response(`Error: ${error}`, {status: 500});
            })
        );

    //handle HTML responses
    } else {
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
    }
});