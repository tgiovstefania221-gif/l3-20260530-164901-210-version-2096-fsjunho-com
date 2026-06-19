(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var header = $('[data-header]');
    var menuButton = $('[data-menu-toggle]');
    var mobilePanel = $('[data-mobile-panel]');

    function syncHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = $all('[data-hero-slide]');
    var dots = $all('[data-hero-dot]');
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === heroIndex);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function setupCardToolbar(toolbar) {
        var section = toolbar.closest('section') || document;
        var grid = $('[data-card-grid]', section);
        if (!grid) {
            return;
        }
        var cards = $all('.movie-card', grid);
        var buttons = $all('[data-filter-tag]', toolbar);
        var searchInput = $('[data-card-search]', toolbar);
        var sortSelect = $('[data-card-sort]', toolbar);
        var activeTag = 'all';

        function applyCards() {
            var query = normalize(searchInput && searchInput.value);
            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var tags = normalize(card.getAttribute('data-tags'));
                var tagMatch = activeTag === 'all' || tags.indexOf(normalize(activeTag)) !== -1;
                var queryMatch = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1;
                card.classList.toggle('is-hidden-card', !(tagMatch && queryMatch));
            });
        }

        function sortCards(mode) {
            var sorted = cards.slice();
            sorted.sort(function (a, b) {
                if (mode === 'views') {
                    return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                }
                if (mode === 'year') {
                    return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                }
                if (mode === 'title') {
                    return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
                }
                return cards.indexOf(a) - cards.indexOf(b);
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeTag = button.getAttribute('data-filter-tag') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                applyCards();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', applyCards);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                sortCards(sortSelect.value);
                applyCards();
            });
        }
    }

    $all('[data-category-toolbar]').forEach(setupCardToolbar);

    function escapeHtml(value) {
        return (value || '').toString().replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    var searchResults = $('[data-search-results]');
    var searchStatus = $('[data-search-status]');
    var searchForm = $('[data-search-form]');
    var searchInput = $('[data-search-input]');

    function renderSearch(query) {
        if (!searchResults || !window.siteSearchIndex) {
            return;
        }
        var q = normalize(query);
        searchResults.innerHTML = '';
        if (!q) {
            if (searchStatus) {
                searchStatus.textContent = '输入关键词开始搜索';
            }
            return;
        }
        var matches = window.siteSearchIndex.filter(function (item) {
            return normalize([item.title, item.region, item.genre, item.tags, item.category].join(' ')).indexOf(q) !== -1;
        }).slice(0, 96);
        if (searchStatus) {
            searchStatus.textContent = matches.length ? '搜索结果：' + escapeHtml(query) : '未找到相关影片';
        }
        searchResults.innerHTML = matches.map(function (item) {
            return '<article class="movie-card">' +
                '<a href="' + escapeHtml(item.url) + '" class="movie-link">' +
                '<div class="card-poster">' +
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="card-badge">' + escapeHtml(item.category) + '</span>' +
                '</div>' +
                '<div class="card-body">' +
                '<h3>' + escapeHtml(item.title) + '</h3>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.views) + '</span></div>' +
                '</div>' +
                '</a>' +
                '</article>';
        }).join('');
    }

    if (searchForm && searchInput) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;
        renderSearch(initialQuery);
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = searchInput.value.trim();
            var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
            history.replaceState(null, '', url);
            renderSearch(query);
        });
    }
})();
