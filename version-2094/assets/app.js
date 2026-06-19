(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const show = (next) => {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => show(Number(dot.dataset.heroDot || 0)));
    });

    setInterval(() => show(index + 1), 5200);
  }

  const searchInput = document.querySelector('[data-card-search]');
  const cardList = document.querySelector('[data-card-list]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter-button]'));
  const categorySelect = document.querySelector('[data-category-select]');
  const yearSelect = document.querySelector('[data-year-select]');
  const emptyState = document.querySelector('[data-empty-state]');

  if (cardList) {
    const cards = Array.from(cardList.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    let activeFilter = 'all';

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const updateCards = () => {
      const query = normalize(searchInput ? searchInput.value : '');
      const selectedCategory = categorySelect ? categorySelect.value : 'all';
      const selectedYear = yearSelect ? yearSelect.value : 'all';
      let visible = 0;

      cards.forEach((card) => {
        const text = normalize(card.dataset.search);
        const categoryMatch = selectedCategory === 'all' || card.dataset.category === selectedCategory;
        const yearMatch = selectedYear === 'all' || card.dataset.year === selectedYear;
        const quickFilterMatch = activeFilter === 'all' || card.dataset.year === activeFilter || normalize(card.dataset.genre).includes(normalize(activeFilter));
        const queryMatch = !query || text.includes(query);
        const showCard = categoryMatch && yearMatch && quickFilterMatch && queryMatch;

        card.style.display = showCard ? '' : 'none';

        if (showCard) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', updateCards);
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', updateCards);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', updateCards);
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter || 'all';
        filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
        updateCards();
      });
    });

    updateCards();
  }

  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const playButton = player.querySelector('[data-play]');
    const section = player.closest('.player-section');
    const streamButtons = section ? Array.from(section.querySelectorAll('[data-stream]')) : [];
    let hlsInstance = null;

    if (!video) {
      return;
    }

    const resetVideo = () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      video.removeAttribute('src');
      video.load();
      player.classList.remove('is-playing');
      video.dataset.ready = '0';
    };

    const prepareVideo = () => {
      const url = video.dataset.url;

      if (!url || video.dataset.ready === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }

      video.dataset.ready = '1';
    };

    const play = () => {
      prepareVideo();
      player.classList.add('is-playing');
      const playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(() => {
          player.classList.remove('is-playing');
        });
      }
    };

    if (playButton) {
      playButton.addEventListener('click', play);
    }

    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0) {
        player.classList.remove('is-playing');
      }
    });

    streamButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const streamUrl = button.dataset.stream;

        if (!streamUrl) {
          return;
        }

        streamButtons.forEach((item) => item.classList.toggle('is-active', item === button));
        video.dataset.url = streamUrl;
        resetVideo();
        play();
      });
    });
  });
})();
