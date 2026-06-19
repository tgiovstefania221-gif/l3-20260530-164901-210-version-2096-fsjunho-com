(function () {
    function setupPlayer(container) {
        var video = container.querySelector('video');
        var button = container.querySelector('.play-overlay');
        var stream = container.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function load() {
            if (ready || !video || !stream) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            load();
            video.controls = true;
            if (button) {
                button.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 && button) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
