/* =====================================================================
   Terminal / IDE portfolio — file switching + terminal typing.
   Progressive enhancement: all content lives in the DOM. JS only
   (1) shows one pane at a time and (2) animates the hero terminal.
   Reduced-motion + no-JS both fall back to fully-visible content.
   ===================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var tablist = document.getElementById('filetree');
  var tabs = tablist
    ? Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'))
    : [];
  var panes = Array.prototype.slice.call(document.querySelectorAll('.pane'));
  var editor = document.getElementById('editor');

  var openName = document.getElementById('openName');
  var openIcon = document.getElementById('openIcon');
  var sbFile = document.getElementById('sb-file');
  var sbLang = document.getElementById('sb-lang');
  var liveVerb = document.getElementById('liveVerb');
  var termFile = document.getElementById('termFile');

  function paneById(id) {
    for (var i = 0; i < panes.length; i++) {
      if (panes[i].id === id) return panes[i];
    }
    return null;
  }

  function activate(tab, setFocus) {
    if (!tab) return;
    for (var i = 0; i < tabs.length; i++) {
      var sel = tabs[i] === tab;
      tabs[i].setAttribute('aria-selected', sel ? 'true' : 'false');
      tabs[i].tabIndex = sel ? 0 : -1;
    }

    var id = tab.getAttribute('aria-controls');
    for (var j = 0; j < panes.length; j++) {
      panes[j].classList.toggle('is-active', panes[j].id === id);
    }

    var file = tab.getAttribute('data-file') || '';
    var lang = tab.getAttribute('data-lang') || '';
    var verb = tab.getAttribute('data-verb') || 'cat';
    var icon = tab.getAttribute('data-icon') || '';

    if (openName) openName.textContent = file;
    if (openIcon) openIcon.className = icon + ' open-tab__icon';
    if (sbFile) sbFile.textContent = file;
    if (sbLang) sbLang.textContent = lang;
    if (liveVerb) liveVerb.textContent = verb;
    if (termFile) termFile.textContent = file;

    // reset scroll of the editor region to the top of the new file
    var pane = paneById(id);
    if (pane) pane.scrollTop = 0;
    if (editor) editor.scrollTop = 0;

    if (setFocus && typeof tab.focus === 'function') tab.focus();
  }

  // wire each tab: click + roving-tabindex keyboard model
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { activate(tab, false); });

    tab.addEventListener('keydown', function (e) {
      var idx = tabs.indexOf(tab);
      var n = tabs.length;
      var next = null;
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight': next = tabs[(idx + 1) % n]; break;
        case 'ArrowUp':
        case 'ArrowLeft':  next = tabs[(idx - 1 + n) % n]; break;
        case 'Home':       next = tabs[0]; break;
        case 'End':        next = tabs[n - 1]; break;
        default: return;
      }
      e.preventDefault();
      activate(next, true);
    });
  });

  // ensure the initially-selected tab/pane are in sync
  var initial = tablist ? tablist.querySelector('[aria-selected="true"]') : null;
  if (!initial && tabs.length) initial = tabs[0];
  if (initial) activate(initial, false);

  /* ---------------------------------------------------------------
     Terminal hero: type the command, then reveal output lines.
  --------------------------------------------------------------- */
  function runTerminal() {
    var cmd = document.getElementById('termCmd');
    var caret = document.getElementById('cmdCaret');
    var out = Array.prototype.slice.call(
      document.querySelectorAll('#termOut .out-line'));

    function revealAll() {
      out.forEach(function (l) { l.classList.add('revealed'); });
    }

    if (!cmd) { revealAll(); return; }

    var full = cmd.getAttribute('data-cmd') || cmd.textContent;

    // failsafe: whatever happens, the full text + output appear
    var failsafe = setTimeout(function () {
      cmd.textContent = full;
      revealAll();
    }, 6000);

    if (reduce) {
      cmd.textContent = full;
      revealAll();
      clearTimeout(failsafe);
      return;
    }

    cmd.textContent = '';
    if (caret) caret.style.display = 'inline';

    var i = 0;
    (function type() {
      cmd.textContent = full.slice(0, i);
      if (i < full.length) {
        i++;
        setTimeout(type, 40 + Math.random() * 45);
      } else {
        // hand off: hide the command caret, reveal stdout line by line
        if (caret) caret.style.display = 'none';
        out.forEach(function (l, k) {
          setTimeout(function () { l.classList.add('revealed'); }, 95 * k);
        });
        setTimeout(function () { clearTimeout(failsafe); },
          95 * out.length + 300);
      }
    })();
  }

  runTerminal();
})();
