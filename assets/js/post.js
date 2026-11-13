/* Posts: maths (KaTeX), the citation engine, and <details> notes opened as a pop-up. */
(function () {
  var body = document.querySelector('.blog-post');
  if (!body) return;

  // 1. Maths: $…$, $$…$$, \(…\), \[…\] (kramdown turns $$ into \( \) / \[ \]). Posts from the editor arrive with
  // their maths already rendered (data-prerendered), so nothing to do there.
  if (window.renderMathInElement && !body.querySelector('[data-prerendered]')) {
    renderMathInElement(body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false }
      ],
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      throwOnError: false
    });
  }

  // 2. Citations: <cite-ref data-id data-bib> (from {% include cite.html id="…" %}) → [n], numbered in order of first use.
  var registry = [];
  function field(bib, name) {
    var m = bib.match(new RegExp(name + '\\s*=\\s*\\{([^}]+)\\}', 'i'));
    return m ? m[1] : '';
  }
  function refText(r) {
    return r.firstAuthor + ' et al., <em>' + r.title + '</em>' + (r.journal ? ', ' + r.journal : '') + (r.year ? ', ' + r.year : '');
  }
  document.querySelectorAll('cite-ref').forEach(function (el) {
    var id = el.getAttribute('data-id');
    var idx = registry.findIndex(function (r) { return r.id === id; });
    if (idx === -1) {
      var bib = el.getAttribute('data-bib') || '';
      var author = field(bib, 'author') || 'Unknown';
      registry.push({
        id: id, title: field(bib, 'title') || 'No title', journal: field(bib, 'journal'), year: field(bib, 'year'),
        firstAuthor: author.split(' and ')[0].split(',')[0].trim()
      });
      idx = registry.length - 1;
    }
    var sup = document.createElement('sup');
    sup.className = 'cite';
    sup.innerHTML = '<a href="#ref-' + id + '" class="internal-cite" data-ref-id="' + id + '">[' + (idx + 1) + ']</a>';
    el.replaceWith(sup);
  });
  var refs = document.getElementById('references-list');
  if (refs && registry.length) {
    refs.innerHTML = '<h2>References</h2><ol>' + registry.map(function (r) {
      return '<li id="ref-' + r.id + '">' + refText(r) + '</li>';
    }).join('') + '</ol>';
  }

  // 3. <details> notes open in a pop-up, with their own references.
  var overlay = document.getElementById('details-overlay');
  var popTitle = document.getElementById('details-popup-title');
  var popBody = document.getElementById('details-popup-body');
  var popRefs = document.getElementById('popup-references-container');
  var popList = document.getElementById('popup-references-list');
  var lastFocus = null;

  function open(el) {
    var summary = el.querySelector('summary');
    var clone = el.cloneNode(true);
    var s = clone.querySelector('summary');
    if (s) s.remove();
    popTitle.textContent = summary ? summary.innerText : 'Details';
    popBody.innerHTML = clone.innerHTML;

    var ids = Array.from(new Set(Array.from(popBody.querySelectorAll('.internal-cite')).map(function (l) {
      return l.getAttribute('data-ref-id');
    })));
    popList.innerHTML = ids.map(function (id) {
      var i = registry.findIndex(function (r) { return r.id === id; });
      return i === -1 ? '' : '<li value="' + (i + 1) + '">' + refText(registry[i]) + '</li>';
    }).join('');
    popRefs.hidden = ids.length === 0;

    lastFocus = document.activeElement;
    overlay.hidden = false;
    overlay.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    overlay.querySelector('[data-close]').focus();
  }
  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.post-body details').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('a') && !e.target.closest('summary')) return;
      e.preventDefault();
      open(el);
    });
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay || e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });
})();
