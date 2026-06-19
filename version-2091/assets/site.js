(function () {
  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));

    panels.forEach(function (panel) {
      var container = panel.closest('.container') || document;
      var searchInput = panel.querySelector('[data-search-input]');
      var yearFilter = panel.querySelector('[data-year-filter]');
      var typeFilter = panel.querySelector('[data-type-filter]');
      var categoryFilter = panel.querySelector('[data-category-filter]');
      var result = container.querySelector('[data-filter-result]');
      var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));

      function apply() {
        var keyword = normalize(searchInput && searchInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var type = normalize(typeFilter && typeFilter.value);
        var category = normalize(categoryFilter && categoryFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (type && cardType.indexOf(type) === -1) {
            matched = false;
          }

          if (category && cardCategory !== category) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = '当前显示 ' + visible + ' 部影片。';
        }
      }

      [searchInput, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
