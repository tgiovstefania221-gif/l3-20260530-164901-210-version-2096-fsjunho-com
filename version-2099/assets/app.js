(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                start();
            }

            var next = hero.querySelector("[data-hero-next]");
            var prev = hero.querySelector("[data-hero-prev]");
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-hero-dot")) || 0);
                    restart();
                });
            });
            show(0);
            start();
        }

        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        var searchInput = document.querySelector("[data-search-input]");
        var scope = document.querySelector("[data-search-scope]");
        if (searchInput && q) {
            searchInput.value = q;
        }

        function filterCards(value) {
            if (!scope) {
                return;
            }
            var query = String(value || "").trim().toLowerCase();
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-tags") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
                card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
            });
        }

        if (searchInput && scope) {
            filterCards(searchInput.value);
            searchInput.addEventListener("input", function () {
                filterCards(searchInput.value);
            });
        }

        document.querySelectorAll(".poster img, .rank-row img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.style.opacity = "0";
            });
        });

        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector("[data-play-button]");
            var source = shell.getAttribute("data-src");
            var started = false;
            var hls = null;

            function startPlayback() {
                if (!video || !source) {
                    return;
                }
                if (!started) {
                    if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else {
                        video.src = source;
                    }
                    started = true;
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
                shell.classList.add("is-playing");
            }

            if (button) {
                button.addEventListener("click", startPlayback);
            }
            if (video) {
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    shell.classList.remove("is-playing");
                });
            }
            shell.addEventListener("click", function (event) {
                if (event.target === shell) {
                    startPlayback();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
})();
