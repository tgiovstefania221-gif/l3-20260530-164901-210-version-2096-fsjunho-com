document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHeroCarousel();
    initFilters();
});

function initMobileNav() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-mobile-menu]");

    if (!toggle || !menu) {
        return;
    }

    toggle.addEventListener("click", function () {
        const expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        menu.classList.toggle("is-open", !expanded);
    });
}

function initHeroCarousel() {
    const hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const previous = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    }

    function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            show(dotIndex);
            schedule();
        });
    });

    if (previous) {
        previous.addEventListener("click", function () {
            show(index - 1);
            schedule();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(index + 1);
            schedule();
        });
    }

    if (slides.length > 0) {
        show(0);
        schedule();
    }
}

function initFilters() {
    const areas = Array.from(document.querySelectorAll("[data-filter-area]"));

    areas.forEach(function (area) {
        const input = area.querySelector("[data-filter-input]");
        const region = area.querySelector("[data-filter-region]");
        const type = area.querySelector("[data-filter-type]");
        const year = area.querySelector("[data-filter-year]");
        const category = area.querySelector("[data-filter-category]");
        const status = area.querySelector("[data-filter-status]");
        const cards = Array.from(area.querySelectorAll(".movie-card"));

        function cardText(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.category
            ].join(" ").toLowerCase();
        }

        function apply() {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            const regionValue = region ? region.value : "";
            const typeValue = type ? type.value : "";
            const yearValue = year ? year.value : "";
            const categoryValue = category ? category.value : "";
            let visible = 0;

            cards.forEach(function (card) {
                const matched =
                    (!keyword || cardText(card).includes(keyword)) &&
                    (!regionValue || card.dataset.region === regionValue) &&
                    (!typeValue || card.dataset.type === typeValue) &&
                    (!yearValue || card.dataset.year === yearValue) &&
                    (!categoryValue || card.dataset.category === categoryValue);

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = visible > 0 ? "当前匹配 " + visible + " 部" : "暂无匹配内容";
            }
        }

        [input, region, type, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    });
}

window.initializeMoviePlayer = function (streamUrl) {
    const video = document.getElementById("movieVideo");
    const cover = document.getElementById("playCover");
    let prepared = false;
    let hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            prepared = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            prepared = true;
            return;
        }

        video.src = streamUrl;
        prepared = true;
    }

    function start() {
        prepare();

        if (cover) {
            cover.classList.add("is-hidden");
        }

        const request = video.play();

        if (request && typeof request.catch === "function") {
            request.catch(function () {
                if (cover) {
                    cover.classList.remove("is-hidden");
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
};
