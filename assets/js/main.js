(function () {
  var root = document.documentElement;

  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // ---------- theme toggle ----------
  var toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncEmbeds(next);
    });
  }

  function syncEmbeds(theme) {
    var u = document.querySelector('.utterances-frame');
    if (u) u.contentWindow.postMessage({ type: 'set-theme', theme: theme === 'dark' ? 'github-dark' : 'github-light' }, 'https://utteranc.es');
    var g = document.querySelector('iframe.giscus-frame');
    if (g) g.contentWindow.postMessage({ giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } } }, 'https://giscus.app');
  }

  // ---------- lazy embeds (utterances / giscus) ----------
  function loadWhenVisible(el, fn) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) return fn();
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); fn(); }
    }, { rootMargin: '400px' });
    io.observe(el);
  }

  var comments = document.getElementById('comments');
  loadWhenVisible(comments, function () {
    var s = document.createElement('script');
    s.src = 'https://utteranc.es/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('repo', comments.dataset.repo);
    s.setAttribute('issue-term', comments.dataset.term);
    s.setAttribute('theme', currentTheme() === 'dark' ? 'github-dark' : 'github-light');
    comments.appendChild(s);
  });

  var gb = document.getElementById('guestbook');
  loadWhenVisible(gb, function () {
    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    var attrs = {
      'data-repo': gb.dataset.repo,
      'data-repo-id': gb.dataset.repoId,
      'data-category': gb.dataset.category,
      'data-category-id': gb.dataset.categoryId,
      'data-mapping': 'specific',
      'data-term': 'guestbook',
      'data-strict': '1',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': currentTheme() === 'dark' ? 'dark' : 'light',
      'data-lang': 'ko',
      'data-loading': 'lazy'
    };
    Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    gb.appendChild(s);
  });

  // ---------- table of contents ----------
  var toc = document.querySelector('.toc');
  var content = document.getElementById('post-content');
  if (toc && content) {
    var hasH1 = content.querySelector('h1[id]');
    var heads = content.querySelectorAll(hasH1 ? 'h1[id], h2[id]' : 'h2[id], h3[id]');
    if (heads.length >= 3) {
      var ol = toc.querySelector('ol');
      var links = [];
      heads.forEach(function (h) {
        var li = document.createElement('li');
        li.className = (hasH1 ? h.tagName === 'H2' : h.tagName === 'H3') ? 'h3' : 'h2';
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        li.appendChild(a);
        ol.appendChild(li);
        links.push(a);
      });
      toc.hidden = false;
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
          });
        }, { rootMargin: '0px 0px -75% 0px' });
        heads.forEach(function (h) { obs.observe(h); });
      }
    }
  }

  // ---------- posts filter ----------
  var search = document.getElementById('post-search');
  if (search) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('#archive .post-row'));
    var years = document.querySelectorAll('#archive .year');
    var chips = document.querySelectorAll('.chip');
    var empty = document.getElementById('post-empty');
    var group = '';

    function apply() {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (r) {
        var ok = (!group || r.dataset.group === group) && (!q || r.dataset.search.indexOf(q) !== -1);
        r.hidden = !ok;
        if (ok) shown++;
      });
      years.forEach(function (y) { y.hidden = !y.querySelector('.post-row:not([hidden])'); });
      empty.hidden = shown !== 0;
    }

    search.addEventListener('input', apply);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        group = c.dataset.group;
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        apply();
      });
    });
    var params = new URLSearchParams(location.search);
    if (params.get('q')) { search.value = params.get('q'); apply(); }
  }
})();
