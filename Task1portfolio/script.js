/* Portfolio interactivity: theme toggle + localStorage note persistence + simple nav UX */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Elements (guarded)
  const themeToggleBtn = $('#themeToggle');
  const themeIcon = $('#themeIcon');
  const yearEl = $('#year');
  const noteForm = $('#noteForm');
  const visitorName = $('#visitorName');
  const visitorMessage = $('#visitorMessage');
  const clearNoteBtn = $('#clearNote');
  const savedStatus = $('#savedStatus');
  const notePreview = $('#notePreview');

  const STORAGE_KEYS = {
    theme: 'portfolio_theme',
    note: 'portfolio_visitor_note',
  };

  const theme = {
    get() {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    set(next) {
      document.documentElement.dataset.theme = next;
      localStorage.setItem(STORAGE_KEYS.theme, next);
      if (themeIcon) themeIcon.textContent = next === 'dark' ? '🌙' : '☀️';
    },
    toggle() {
      const current = theme.get();
      theme.set(current === 'dark' ? 'light' : 'dark');
    },
  };

  function setStatus(msg, kind = 'info') {
    if (!savedStatus) return;
    savedStatus.textContent = msg;
    savedStatus.dataset.kind = kind;
  }

  function renderNotePreview(note) {
    if (!notePreview) return;

    if (!note || (!note.name && !note.message)) {
      notePreview.innerHTML = '<div class="muted">No note saved yet.</div>';
      return;
    }

    const safeName = escapeHtml(note.name || '');
    const safeMessage = escapeHtml(note.message || '');

    const who = safeName ? `<strong>${safeName}</strong>` : '<strong>Visitor</strong>';
    notePreview.innerHTML = `
      <div class="notePreview__who">${who}</div>
      <div class="notePreview__message">${safeMessage.replace(/\n/g, '<br/>')}</div>
    `;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#39;',
    }[c]));
  }

  function loadSavedNote() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.note);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveNote(note) {
    localStorage.setItem(STORAGE_KEYS.note, JSON.stringify(note));
  }

  function updateFormFromSavedNote() {
    const note = loadSavedNote();
    if (!note) {
      if (visitorName) visitorName.value = '';
      if (visitorMessage) visitorMessage.value = '';
      renderNotePreview(null);
      return;
    }

    if (visitorName) visitorName.value = note.name || '';
    if (visitorMessage) visitorMessage.value = note.message || '';
    renderNotePreview(note);
  }

  function handleSave(e) {
    if (!noteForm) return;
    e.preventDefault();

    const name = visitorName ? visitorName.value.trim() : '';
    const message = visitorMessage ? visitorMessage.value.trim() : '';

    // Minimal validation
    if (!name && !message) {
      setStatus('Please enter your name or a message before saving.', 'error');
      return;
    }

    saveNote({ name, message, savedAt: new Date().toISOString() });
    renderNotePreview({ name, message });
    setStatus('Saved locally ✅', 'success');

    // Optional: clear form after save if you prefer persistence-only
    // (kept as-is to avoid surprising the visitor)
  }

  function handleClear() {
    if (visitorName) visitorName.value = '';
    if (visitorMessage) visitorMessage.value = '';

    localStorage.removeItem(STORAGE_KEYS.note);
    renderNotePreview(null);
    setStatus('Cleared.', 'info');
  }

  function initTheme() {
    // Ensure dataset exists
    const current = theme.get();
    document.documentElement.dataset.theme = current;
    if (themeIcon) themeIcon.textContent = current === 'dark' ? '🌙' : '☀️';
  }

  function initYear() {
    if (!yearEl) return;
    yearEl.textContent = String(new Date().getFullYear());
  }

  function initNavMenu() {
    const toggleBtn = themeToggleBtn ? null : null; // no-op placeholder to avoid linter confusion

    const navToggle = $('.nav__toggle');
    const navMenu = $('#navMenu');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const expanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!expanded));
        navMenu.classList.toggle('nav__menu--open');
      });
    }

    // Close menu when a nav link is clicked
    const links = $$('.nav__link[href^="#"]');
    links.forEach((a) => {
      a.addEventListener('click', () => {
        if (navToggle && navMenu) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('nav__menu--open');
        }
      });
    });

    // Simple scrollspy: highlight active section
    const sectionEls = $$('section[data-section]');
    if (!sectionEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((en) => en.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.id;
        const active = $(`.nav__link[data-nav="${id}"]`);
        $$('.nav__link').forEach((lnk) => lnk.classList.toggle('nav__link--active', lnk === active));
      },
      { root: null, rootMargin: '-20% 0px -70% 0px', threshold: [0.05, 0.1, 0.2] }
    );

    sectionEls.forEach((s) => observer.observe(s));
  }

  // Init
  initYear();
  initTheme();
  updateFormFromSavedNote();

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', theme.toggle);
  if (noteForm) noteForm.addEventListener('submit', handleSave);
  if (clearNoteBtn) clearNoteBtn.addEventListener('click', handleClear);

  initNavMenu();
})();

