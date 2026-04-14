(function () {
    // Current Script Tag
    var currentScript = document.currentScript;
    var siteId = currentScript ? currentScript.getAttribute('data-site-id') : null;
    var zoneId = currentScript ? currentScript.getAttribute('data-zone-id') : null;

    // Check Config
    if (!zoneId) {
        console.error('MrPop.io: Missing data-zone-id attribute');
        return;
    }

    var apiUrl = 'https://api.mrpop.io'; // Change this in production
    // var apiUrl = 'http://localhost:5000/api'; // Dev URL

    // Prevent Multiple Clicks
    if (window.mrpop_loaded) return;
    window.mrpop_loaded = true;

    document.addEventListener('click', function (e) {
        if (window.mrpop_clicked) return;

        // Fetch Ad
        fetch(apiUrl + '/ads/serve?zoneId=' + zoneId)
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.targetUrl) {
                    window.mrpop_clicked = true;

                    // Create Popunder
                    var win = window.open(data.targetUrl, '_blank');
                    if (win) {
                        win.blur();
                        window.focus();

                        // Track Impression
                        new Image().src = data.trackUrl;
                    } else {
                        // Fallback logic for blocked popups
                        console.log('MrPop.io: Pop-up blocked');
                    }
                }
            })
            .catch(function (err) {
                console.error('MrPop.io Error:', err);
            });
    }, { once: true });
})();
