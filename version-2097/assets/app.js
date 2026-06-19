(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        function syncHeader() {
            if (!header) return;
            header.classList.toggle("is-scrolled", window.scrollY > 16);
        }
        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("open");
                toggle.textContent = menu.classList.contains("open") ? "×" : "☰";
            });
        }
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) return;
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) return;
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupFilters() {
        document.querySelectorAll(".catalog-filter").forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-tag]"));
            var activeTag = "";
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var haystack = [card.dataset.title, card.dataset.meta, card.dataset.tags].join(" ").toLowerCase();
                    var okText = !q || haystack.indexOf(q) !== -1;
                    var okTag = !activeTag || (card.dataset.tags || "").indexOf(activeTag) !== -1;
                    card.hidden = !(okText && okTag);
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeTag = activeTag === button.dataset.tag ? "" : button.dataset.tag;
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item.dataset.tag === activeTag && activeTag !== "");
                    });
                    apply();
                });
            });
        });
    }

    function cardTemplate(item) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-cover" href="' + item.link + '" aria-label="' + escapeHtml(item.title) + '">',
            '        <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '        <span class="movie-badge">' + escapeHtml(item.category) + '</span>',
            '    </a>',
            '    <div class="movie-body">',
            '        <h3><a href="' + item.link + '">' + escapeHtml(item.title) + '</a></h3>',
            '        <p>' + escapeHtml(item.oneLine) + '</p>',
            '        <div class="movie-meta"><span>' + escapeHtml(item.meta) + '</span></div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (ch) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[ch];
        });
    }

    function setupSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        if (!form || !input || !results || !window.SEARCH_MOVIES) return;
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render(query) {
            var q = query.trim().toLowerCase();
            var matches = q ? window.SEARCH_MOVIES.filter(function (item) {
                return item.search.indexOf(q) !== -1;
            }).slice(0, 80) : window.SEARCH_MOVIES.slice(0, 12);
            results.innerHTML = matches.map(cardTemplate).join("");
        }
        render(initial);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var q = input.value.trim();
            var url = new URL(window.location.href);
            if (q) {
                url.searchParams.set("q", q);
            } else {
                url.searchParams.delete("q");
            }
            history.replaceState(null, "", url.toString());
            render(q);
        });
        document.querySelectorAll("[data-search-chip]").forEach(function (chip) {
            chip.addEventListener("click", function () {
                input.value = chip.dataset.searchChip || chip.textContent;
                form.dispatchEvent(new Event("submit", { cancelable: true }));
            });
        });
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play]");
            var stream = player.getAttribute("data-stream");
            var loaded = false;
            var hls = null;
            function load() {
                if (loaded || !video || !stream) return;
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }
            function start() {
                load();
                if (button) {
                    button.classList.add("is-hidden");
                }
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }
            if (button) {
                button.addEventListener("click", start);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        start();
                    }
                });
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("is-hidden");
                    }
                });
            }
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupHeader();
        setupHero();
        setupFilters();
        setupSearchPage();
        setupPlayers();
    });
})();