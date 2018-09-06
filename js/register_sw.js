if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('js/sw.js')
        .then(r => {
            console.log('SW!');
        })
        .catch(error => {
            console.log('SW Failed :' + error);
        });
}