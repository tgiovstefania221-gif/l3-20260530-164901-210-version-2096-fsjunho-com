(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var active = 0;
      var timer = null;

      function show(index) {
        active = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === active);
        });
      }

      function start() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show((active + 1) % slides.length);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      if (slides.length > 1) {
        start();
      }
    }

    var searchInput = document.querySelector('[data-card-search]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var typeValue = typeFilter ? typeFilter.value.trim() : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesType = !typeValue || text.indexOf(typeValue.toLowerCase()) !== -1;
        card.classList.toggle('is-filtered-out', !(matchesQuery && matchesType));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilters);
    }

    var playerBox = document.querySelector('[data-player-box]');
    if (playerBox) {
      var video = playerBox.querySelector('[data-video]');
      var trigger = playerBox.querySelector('[data-play-trigger]');
      var attached = false;
      var hls = null;

      function attachSource() {
        if (!video || attached) {
          return;
        }

        var src = video.getAttribute('data-src');
        if (!src) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          attached = true;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          attached = true;
        } else {
          video.src = src;
          attached = true;
        }
      }

      function playVideo() {
        attachSource();
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener('click', playVideo);
      }

      video.addEventListener('play', function () {
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  });
})();
