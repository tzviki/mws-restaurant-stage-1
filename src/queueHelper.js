import idb from 'idb';

window.reviewDbPromise = idb.open('tw-restaurant', 1, upgradeDb => {
    switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurant', {keyPath: 'id'});
        case 1:
        {
            const reviewsStore = upgradeDb.createObjectStore("reviews", {keyPath: "id"});
            reviewsStore.createIndex('restaurant', 'restaurant');
            upgradeDb.createObjectStore("queue", {
            keyPath: "id",
            autoIncrement: true
            });
        }
    }
});

class QueueHelper {
    static get REVIEWS_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/reviews`;
      }

    static saveNewReview(review) {
        QueueHelper.addReviewToDBCache(review);
        data = {
          url: this.REVIEWS_URL,
          method: 'POST',
          data: {
                "restaurant_id": review.restaurant_id,
                "name": review.name,
                "rating": review.rating,
                "comments": review.comments
          }
        };        
        QueueHelper.addReviewToQueue(data)
        .then(() => {
            QueueHelper.sendQueueToServer().then(() => {
                window.location = `./restaurant.html?id=${data.data.restaurant_id}`;
            });            
        });
      }

      static submitFavoriteChange(id, isFavorite) {
        var data = {
            url: `${DBHelper.DATABASE_URL}/${id}/?is_favorite=${isFavorite.toString()}`,
            method: 'PUT',
        };
        QueueHelper.updateRestaurntCache(id, isFavorite);
        QueueHelper.addReviewToQueue(data)
        .then(() => {
            QueueHelper.sendQueueToServer();
        });
      }

      static updateRestaurntCache(id, isFavorite) {
        reviewDbPromise.then(db => {
            const transaction = db.transaction('restaurant', 'readwrite');
            //Update the restaurant
            const record = transaction.objectStore('restaurant').get(id.toString()).then(r => {                
                if (!r) {
                    return;
                }
                const restaurant = r.data;
                r.data['is_favorite'] = isFavorite.toString();
                reviewDbPromise.then(db => {
                    const transaction = db.transaction("restaurant", "readwrite");
                    transaction.objectStore("restaurant")
                      .put({id: id.toString(), data: restaurant});
                    return transaction.complete;
                  });
            });

            //Update the restaurants collection
            const transaction2 = db.transaction('restaurant', 'readwrite');
            const record2 = transaction2.objectStore('restaurant').get('-1').then(r => {                
                if (!r) {
                    return;
                }
                const restaurant = r.data.filter(a => a.id == id.toString());
                if (restaurant.length && restaurant[0]) {
                    restaurant[0].is_favorite = isFavorite.toString();
                }
                var restaurants = r.data.filter(a => a.id != id.toString());
                restaurants.push(restaurant[0]);

                reviewDbPromise.then(db => {
                    const transaction = db.transaction("restaurant", "readwrite");
                    transaction.objectStore("restaurant")
                      .put({id: '-1', data: restaurants});
                    return transaction.complete;
                  });
            });
        });
      }
    
      static addReviewToDBCache(review) {
        reviewDbPromise.then(db => {
            const transaction = db.transaction('reviews', 'readwrite');
            const record = transaction.objectStore('reviews').get(review.restaurant_id.toString()).then(r => {
                if (!r) {
                    return transaction.complete;
                } else {
                    r.data.push(review);
                    reviewDbPromise.then(db => {
                        const transaction = db.transaction("reviews", "readwrite");
                        transaction.objectStore("reviews")
                          .put({id: r.id, data: r});
                        return transaction.complete;
                      });
                }
            });
        });
      }

      static addReviewToQueue(data) {
        return reviewDbPromise.then(db => {
            const transaction = db.transaction('queue', 'readwrite');
            const store = transaction.objectStore('queue');
            store.put({                
                data: data
            });
            return transaction.complete;
        });
      }
    
      static sendQueueToServer() {
        return reviewDbPromise.then(db => {
            const transaction = db.transaction('queue','readwrite');
            transaction.objectStore('queue').openCursor().then(c => {
                var data = c.value.data;
                QueueHelper.postToDB(data).then(c.delete().then(() => {
                    console.log('deleted');
                }));
            });
        });

      }
      static postToDB(data) {
        return fetch(data.url, {method: data.method, body: JSON.stringify(data.data)})
        .then(response => {
          console.log(response);
        });
      }
}

window.QueueHelper = QueueHelper;