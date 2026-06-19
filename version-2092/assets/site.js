(function () {
  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = q('[data-menu-toggle]');
  var mobileNav = q('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = qa('[data-hero-slide]');
  var dots = qa('[data-hero-dot]');
  var activeSlide = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === activeSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === activeSlide);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var searchModal = q('[data-search-modal]');
  var searchInput = q('[data-global-search]');
  var searchResults = q('[data-search-results]');
  function openSearch() {
    if (!searchModal) {
      return;
    }
    searchModal.classList.add('is-open');
    setTimeout(function () {
      if (searchInput) {
        searchInput.focus();
      }
    }, 60);
  }
  function closeSearch() {
    if (searchModal) {
      searchModal.classList.remove('is-open');
    }
  }
  qa('[data-search-open]').forEach(function (button) {
    button.addEventListener('click', openSearch);
  });
  qa('[data-search-close]').forEach(function (button) {
    button.addEventListener('click', closeSearch);
  });
  if (searchModal) {
    searchModal.addEventListener('click', function (event) {
      if (event.target === searchModal) {
        closeSearch();
      }
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  function safeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function rootPrefix() {
    return /\/movie\//.test(window.location.pathname) ? '../' : './';
  }

  function renderSearch(query) {
    if (!searchResults) {
      return;
    }
    var source = window.SEARCH_INDEX || [];
    var value = String(query || '').trim().toLowerCase();
    if (!value) {
      searchResults.innerHTML = '<div class="empty-state">输入片名、题材或地区即可搜索</div>';
      return;
    }
    var prefix = rootPrefix();
    var results = source.filter(function (item) {
      return item.text.indexOf(value) !== -1;
    }).slice(0, 24);
    if (!results.length) {
      searchResults.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
      return;
    }
    searchResults.innerHTML = results.map(function (item) {
      return '<a class="search-result" href="' + prefix + item.url + '">' +
        '<img src="' + prefix + item.img + '" alt="' + safeHtml(item.title) + '">' +
        '<span><strong>' + safeHtml(item.title) + '</strong><em class="pill">' + safeHtml(item.category) + '</em></span>' +
        '</a>';
    }).join('');
  }
  if (searchInput) {
    renderSearch('');
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  var pageSearch = q('[data-page-search]');
  var yearFilter = q('[data-filter-year]');
  var regionFilter = q('[data-filter-region]');
  var genreFilter = q('[data-filter-genre]');
  var cards = qa('[data-movie-card]');
  function filterCards() {
    if (!cards.length) {
      return;
    }
    var keyword = pageSearch ? pageSearch.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var region = regionFilter ? regionFilter.value : '';
    var genre = genreFilter ? genreFilter.value : '';
    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var ok = true;
      if (keyword && text.indexOf(keyword) === -1) {
        ok = false;
      }
      if (year && card.getAttribute('data-year') !== year) {
        ok = false;
      }
      if (region && card.getAttribute('data-region') !== region) {
        ok = false;
      }
      if (genre && (card.getAttribute('data-genre') || '').indexOf(genre) === -1) {
        ok = false;
      }
      card.style.display = ok ? '' : 'none';
    });
  }
  [pageSearch, yearFilter, regionFilter, genreFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });
})();

function initPlayer(streamSrc) {
  var video = document.getElementById('playerVideo');
  var overlay = document.getElementById('playOverlay');
  if (!video || !streamSrc) {
    return;
  }
  var started = false;
  var hlsInstance = null;
  function startPlayback() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamSrc;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(streamSrc);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = streamSrc;
    }
    video.play().catch(function () {});
  }
  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
}
