if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(r => {
            console.log('SW!');
        })
        .catch(error => {
            console.log('SW Failed :' + error);
        });
}