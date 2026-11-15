(function () {
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
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
  }

  // ---------- lazy embeds (utterances) ----------
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

  // ---------- contact form ----------
  var form = document.getElementById('contact-form');
  if (form) {
    var status = form.querySelector('.form-status');
    var button = form.querySelector('button[type="submit"]');
    if (form.hasAttribute('data-disabled')) {
      button.disabled = true;
      status.textContent = '폼 준비 중입니다. 급하시면 LinkedIn으로 연락 주세요.';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.hasAttribute('data-disabled')) return;
      button.disabled = true;
      status.textContent = '보내는 중…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          status.textContent = '잘 받았습니다. 고맙습니다.';
        })
        .catch(function () {
          status.textContent = '전송에 실패했습니다. 잠시 후 다시 시도하거나 LinkedIn으로 연락 주세요.';
        })
        .finally(function () { button.disabled = false; });
    });
  }

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
