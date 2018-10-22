let restaurant;

document.addEventListener('DOMContentLoaded', (event) => {  
  fetchRestaurantFromURL();
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = () => {
  if (self.restaurant) { // restaurant already fetched!
    fillRestaurantHTMLReview();
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    console.log(error);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTMLReview();
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTMLReview = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  const imageType = '.jpg';
  const imageFile = DBHelper.imageUrlForRestaurantDetail(restaurant).replace(imageType, '');
  const image1x = `${imageFile}_1x${imageType}`;
  const image2x = `${imageFile}_2x${imageType}`;
  image.src = image1x;
  image.srcset = `${image1x} 600w, ${image2x} 1200w`;
  image.alt = restaurant.name;
};



/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

collectAndSubmitData = () => {
  data = {
    restaurant: self.restaurant.id,
    name: document.querySelector('#review-name').value,
    rating: document.querySelector('#review-rating').value,
    comment: document.querySelector('#review-experience').value
  };
  DBHelper.saveNewReview(data);
  // const destination = DBHelper.urlForRestaurant(self.restaurant);
  // window.location = destination;
}
