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
                "restaurant_id": review.restaurant,
                "name": review.name,
                "rating": review.rating,
                "comments": review.comment
          }
        };        
        QueueHelper.addReviewToQueue(data)
        .then(() => {
            QueueHelper.sendQueueToServer();
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
            const transaction2 = db.transaction('restaurant', 'readwrite');
            const record2 = transaction2.objectStore('restaurant').get('-1').then(r => {                
                if (!r) {
                    return;
                }
                const restaurant = r.data.filter(a => a.id == id.toString());
                if (restaurant) {
                    restaurant['is_favoreite'] = isFavorite.toString();
                }
                var restaurants = r.data.filter(a => a.id != id.toString());
                restaurants.push(restaurant);

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
            const store = transaction.objectStore('reviews');
            store.put({
                id: Date.now(),
                restaurant: review.restaurant,
                data: review
            });
            return transaction.complete;
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
        reviewDbPromise.then(db => {
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