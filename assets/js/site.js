(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  if (slides.length) {
    var current = 0;
    var activate = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    window.setInterval(function () {
      activate((current + 1) % slides.length);
    }, 5200);
  }

  var filter = document.querySelector('[data-filter-panel]');
  if (filter) {
    var q = filter.querySelector('[data-filter-q]');
    var year = filter.querySelector('[data-filter-year]');
    var region = filter.querySelector('[data-filter-region]');
    var genre = filter.querySelector('[data-filter-genre]');
    var reset = filter.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.querySelector('.empty-state');
    var queryText = new URLSearchParams(window.location.search).get('q');
    if (queryText && q) {
      q.value = queryText;
    }
    var apply = function () {
      var text = q ? q.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      var g = genre ? genre.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var hay = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre, card.dataset.category].join(' ').toLowerCase();
        var ok = true;
        if (text && hay.indexOf(text) === -1) ok = false;
        if (y && card.dataset.year !== y) ok = false;
        if (r && card.dataset.region !== r) ok = false;
        if (g && card.dataset.genre.indexOf(g) === -1) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) shown += 1;
      });
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    };
    [q, year, region, genre].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (q) q.value = '';
        if (year) year.value = '';
        if (region) region.value = '';
        if (genre) genre.value = '';
        apply();
      });
    }
    apply();
  }
})();

function initPlayer(stream) {
  var video = document.getElementById('movieVideo');
  var cover = document.getElementById('playCover');
  if (!video || !cover || !stream) return;
  var loaded = false;
  var attach = function () {
    if (loaded) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
    loaded = true;
  };
  var play = function () {
    attach();
    cover.classList.add('is-hidden');
    video.controls = true;
    var result = video.play();
    if (result && result.catch) {
      result.catch(function () {});
    }
  };
  cover.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) play();
  });
}
