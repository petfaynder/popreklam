(function () {
    // Current Script Tag
    var currentScript = document.currentScript;
    var siteId = currentScript ? currentScript.getAttribute('data-site-id') : null;
    var zoneId = currentScript ? currentScript.getAttribute('data-zone-id') : null;

    // Check Config
    if (!zoneId) {
        console.error('PopReklam: Missing data-zone-id attribute');
        return;
    }

    var apiUrl = 'https://api.popreklam.com'; // Change this in production
    // var apiUrl = 'http://localhost:5000/api'; // Dev URL

    // Prevent Multiple Clicks
    if (window.popreklam_loaded) return;
    window.popreklam_loaded = true;

    document.addEventListener('click', function (e) {
        if (window.popreklam_clicked) return;

        // Fetch Ad
        fetch(apiUrl + '/ads/serve?zoneId=' + zoneId)
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.targetUrl) {
                    window.popreklam_clicked = true;

                    // Create Popunder
                    var win = window.open(data.targetUrl, '_blank');
                    if (win) {
                        win.blur();
                        window.focus();

                        // Track Impression
                        new Image().src = data.trackUrl;
                    } else {
                        // Fallback logic for blocked popups
                        console.log('PopReklam: Pop-up blocked');
                    }
                }
            })
            .catch(function (err) {
                console.error('PopReklam Error:', err);
            });
    }, { once: true });
})();
