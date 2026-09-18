'use strict';

(function () {
  const { qs, request, connect, store, toast, countdownRatio, escapeHtml } = window.QN;

  const code = (qs.get('code') || '').trim().toUpperCase();
  const urlKey = qs.get('key') || '';
  const saved = code ? store.get(`qn:host:${code}`) : null;
  const hostKey = urlKey || (saved && saved.hostKey) || '';

  const views = {
    lobby: document.getElementById('viewLobby'),
    question: document.getElementById('viewQuestion'),
    reveal: document.getElementById('viewReveal'),
    finished: document.getElementById('viewFinished'),
    error: document.getElementById('viewError')
  };

  const el = {
    orgName: document.getElementById('orgName'),
    phaseChip: document.getElementById('phaseChip'),
    playerCount: document.getElementById('playerCount'),
    connChip: document.getElementById('connChip'),
    connText: document.getElementById('connText'),
    joinUrl: document.getElementById('joinUrl'),
    bigCode: document.getElementById('bigCode'),
    qr: document.getElementById('qr'),
    copyLink: document.getElementById('copyLink'),
    copyCode: document.getElementById('copyCode'),
    catPicker: document.getElementById('catPicker'),
    perCategory: document.getElementById('perCategory'),
    totalHint: document.getElementById('totalHint'),
    seconds: document.getElementById('seconds'),
    shuffle: document.getElementById('shuffle'),
    roster: document.getElementById('roster'),
    rosterCount: document.getElementById('rosterCount'),
    startBtn: document.getElementById('startBtn'),
    qCat: document.getElementById('qCat'),
    qCatName: document.getElementById('qCatName'),
    qCounter: document.getElementById('qCounter'),
    answeredChip: document.getElementById('answeredChip'),
    ring: document.getElementById('ring'),
    ringFill: document.getElementById('ringFill'),
    ringNum: document.getElementById('ringNum'),
    qCard: document.getElementById('qCard'),
    qText: document.getElementById('qText'),
    qOptions: document.getElementById('qOptions'),
    revealBtn: document.getElementById('revealBtn'),
    rCat: document.getElementById('rCat'),
    rCatName: document.getElementById('rCatName'),
    rCounter: document.getElementById('rCounter'),
    rSummaryChip: document.getElementById('rSummaryChip'),
    statCorrect: document.getElementById('statCorrect'),
    statAnswered: document.getElementById('statAnswered'),
    statFastest: document.getElementById('statFastest'),
    statLeader: document.getElementById('statLeader'),
    rQuestion: document.getElementById('rQuestion'),
    rOptions: document.getElementById('rOptions'),
    rFactBox: document.getElementById('rFactBox'),
    rFact: document.getElementById('rFact'),
    rStandings: document.getElementById('rStandings'),
    nextBtn: document.getElementById('nextBtn'),
    podium: document.getElementById('podium'),
    finalStandings: document.getElementById('finalStandings'),
    finalCount: document.getElementById('finalCount'),
    csvLink: document.getElementById('csvLink'),
    newGameBtn: document.getElementById('newGameBtn'),
    againBtn: document.getElementById('againBtn'),
    errorReason: document.getElementById('errorReason')
  };

  const RING_CIRCUMFERENCE = 2 * Math.PI * 44;
  const CAT_COLOUR = { geography: 'var(--geo)', history: 'var(--his)', general: 'var(--gen)' };
  const LETTERS = ['A', 'B', 'C', 'D'];

  let meta = { categories: [] };
  let state = null;
  let snapshotAt = Date.now();
  let stream = null;
  let ticker = null;
  let busy = false;

  /* --------------------------- plumbing --------------------------- */

  function show(name) {
    for (const [key, node] of Object.entries(views)) node.classList.toggle('is-active', key === name);
  }

  function fail(reason) {
    el.errorReason.textContent = reason;
    show('error');
  }

  function setConn(status) {
    const live = status === 'live' || status === 'connecting';
    el.connChip.classList.toggle('chip-live', live);
    el.connChip.classList.toggle('chip-off', !live);
    el.connText.textContent = { live: 'Live', connecting: 'Connecting', reconnecting: 'Reconnecting', offline: 'Offline' }[status] || 'Connecting';
  }

  async function host(action, body) {
    if (busy) return null;
    busy = true;
    try {
      return await request(`/api/rooms/${encodeURIComponent(code)}/host/${action}`, {
        method: 'POST',
        body: { ...body, hostKey }
      });
    } catch (err) {
      toast(err.message);
      return null;
    } finally {
      busy = false;
    }
  }

  /* ------------------------ lobby: identity ------------------------ */

  const joinUrl = `${window.location.origin}/?code=${code}`;
  el.joinUrl.textContent = joinUrl;
  el.bigCode.textContent = code || '····';

  try {
    const matrix = window.QR.encode(joinUrl);
    el.qr.innerHTML = window.QR.toSvg(matrix, { margin: 1, dark: '#0b1020', light: '#ffffff' });
  } catch {
    el.qr.hidden = true;
  }

  async function copyText(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      toast(`${label} copied`);
    } catch {
      toast(value);
    }
  }

  el.copyLink.addEventListener('click', () => copyText(joinUrl, 'Invite link'));
  el.copyCode.addEventListener('click', () => copyText(code, 'Game code'));

  /* ------------------------ lobby: settings ------------------------ */

  function buildCatPicker() {
    el.catPicker.innerHTML = meta.categories
      .map(
        (c) => `<button type="button" class="cat-option" data-cat="${c.id}" aria-pressed="false">
          <span class="swatch"></span>
          <span class="cat-name">${escapeHtml(c.name)}</span>
          <span class="cat-count">25 available</span>
        </button>`
      )
      .join('');

    // Custom properties are set through the CSSOM so the strict CSP holds.
    for (const c of meta.categories) {
      const node = el.catPicker.querySelector(`[data-cat="${c.id}"]`);
      if (node) node.style.setProperty('--cat', c.accent);
    }
  }

  function syncControls(settings) {
    if (!settings) return;
    if (document.activeElement !== el.perCategory) el.perCategory.value = String(settings.perCategory);
    if (document.activeElement !== el.seconds) el.seconds.value = String(settings.seconds);
    el.shuffle.setAttribute('aria-checked', String(Boolean(settings.shuffle)));

    for (const node of el.catPicker.querySelectorAll('.cat-option')) {
      node.setAttribute('aria-pressed', String(settings.categories.includes(node.dataset.cat)));
    }

    el.totalHint.textContent = `${settings.plannedTotal} question${settings.plannedTotal === 1 ? '' : 's'} in total`;
  }

  el.catPicker.addEventListener('click', (event) => {
    const node = event.target.closest('.cat-option');
    if (!node || !state) return;
    const current = state.settings.categories.slice();
    const id = node.dataset.cat;
    const next = current.includes(id) ? current.filter((c) => c !== id) : current.concat(id);
    if (next.length === 0) return toast('Keep at least one round.');
    host('settings', { categories: next });
  });

  el.perCategory.addEventListener('change', () => host('settings', { perCategory: Number(el.perCategory.value) }));
  el.seconds.addEventListener('change', () => host('settings', { seconds: Number(el.seconds.value) }));
  el.shuffle.addEventListener('click', () => host('settings', { shuffle: el.shuffle.getAttribute('aria-checked') !== 'true' }));

  /* --------------------------- rendering --------------------------- */

  function renderRoster(players) {
    el.rosterCount.textContent = `${players.length} / 60`;
    if (players.length === 0) {
      el.roster.innerHTML = '<p class="empty-note">Nobody yet — share the code above.</p>';
      return;
    }
    el.roster.innerHTML = players.map((p) => `<span class="player-chip">${escapeHtml(p.name)}</span>`).join('');
  }

  function renderLobby(s) {
    syncControls(s.settings);
    renderRoster(s.players);
    const ready = s.playerCount > 0;
    el.startBtn.disabled = !ready;
    el.startBtn.textContent = ready ? `Start the game — ${s.playerCount} player${s.playerCount === 1 ? '' : 's'}` : 'Waiting for players…';
    show('lobby');
  }

  function renderQuestionShell(q) {
    el.qCat.style.setProperty('--cat', CAT_COLOUR[q.category] || 'var(--brand)');
    el.qCatName.textContent = q.categoryName;
    el.qCounter.innerHTML = `${q.number} <span class="faint">/ ${q.total}</span>`;
    el.qCard.style.setProperty('--cat', CAT_COLOUR[q.category] || 'var(--brand)');
    el.qText.textContent = q.text;
  }

  function renderOptions(container, options, mode, reveal) {
    container.innerHTML = options
      .map((text, i) => {
        let cls = 'host-opt';
        let votes = '';
        if (mode === 'reveal') {
          const count = reveal ? reveal.counts[i] : 0;
          const max = Math.max(1, reveal ? reveal.counts.reduce((a, b) => a + b, 0) : 1);
          const pct = Math.round((count / max) * 100);
          if (i === reveal.correctIndex) cls += ' is-correct';
          else if (count > 0) cls += ' is-wrong';
          votes = `<span class="votes">${count} vote${count === 1 ? '' : 's'}</span>`;
          return `<div class="${cls}">
            <span class="bar" data-pct="${pct}"></span>
            <span class="letter">${LETTERS[i]}</span>
            <span class="text">${escapeHtml(text)}</span>
            ${votes}
          </div>`;
        }
        return `<div class="${cls}">
          <span class="letter">${LETTERS[i]}</span>
          <span class="text">${escapeHtml(text)}</span>
        </div>`;
      })
      .join('');

    // Let the layout settle, then animate the bars out.
    if (mode === 'reveal') {
      requestAnimationFrame(() => {
        for (const bar of container.querySelectorAll('.bar')) bar.style.width = `${bar.dataset.pct}%`;
      });
    }
  }

  function standingsHtml(list, limit) {
    const slice = limit ? list.slice(0, limit) : list;
    return slice
      .map(
        (p) => `<div class="standing-row${p.rank <= 3 ? ' top' : ''}">
          <span class="pos">${p.rank}</span>
          <span class="nm">${escapeHtml(p.name)}${p.streak > 1 ? `<span class="sub">${p.streak} in a row</span>` : ''}</span>
          <span class="sc mono">${p.score}</span>
        </div>`
      )
      .join('');
  }

  function renderQuestion(s) {
    const q = s.question;
    renderQuestionShell(q);
    renderOptions(el.qOptions, q.options, 'question');
    el.answeredChip.textContent = `${q.answeredCount} answered`;
    show('question');
    startTicker();
  }

  function renderReveal(s) {
    const r = s.reveal;
    el.rCat.style.setProperty('--cat', CAT_COLOUR[r.category] || 'var(--brand)');
    el.rCatName.textContent = r.categoryName;
    el.rCounter.innerHTML = `${r.number} <span class="faint">/ ${r.total}</span>`;
    el.rSummaryChip.textContent = `${r.correctCount} of ${r.answered} correct`;

    el.statCorrect.textContent = String(r.correctCount);
    el.statAnswered.textContent = String(r.answered);
    el.statFastest.textContent = r.fastest.length ? `${(r.fastest[0].ms / 1000).toFixed(1)}s` : '—';
    el.statLeader.textContent = s.players.length ? String(s.players[0].score) : '0';

    el.rQuestion.textContent = r.question;
    renderOptions(el.rOptions, r.options, 'reveal', r);

    if (r.fact) {
      el.rFact.textContent = r.fact;
      el.rFactBox.hidden = false;
    } else {
      el.rFactBox.hidden = true;
    }

    el.rStandings.innerHTML = standingsHtml(s.players, 8);
    el.nextBtn.textContent = r.number >= r.total ? 'See final results' : 'Next question';
    show('reveal');
  }

  function renderFinished(s) {
    const list = (s.finished && s.finished.standings) || s.players;
    const top = list.slice(0, 3);
    const places = ['first', 'second', 'third'];
    const labels = ['Winner', 'Second', 'Third'];

    el.podium.innerHTML = top
      .map(
        (p, i) => `<div class="podium-card ${places[i]}">
          <div class="place">${labels[i]}</div>
          <div class="nm">${escapeHtml(p.name)}</div>
          <div class="sc mono">${p.score} points · ${p.correct} correct</div>
        </div>`
      )
      .join('');

    el.finalStandings.innerHTML = standingsHtml(list, 0);
    el.finalCount.textContent = `${list.length} player${list.length === 1 ? '' : 's'}`;
    el.csvLink.href = `/api/rooms/${encodeURIComponent(code)}/results.csv?hostKey=${encodeURIComponent(hostKey)}`;
    show('finished');
  }

  function render(s) {
    el.playerCount.textContent = `${s.playerCount} player${s.playerCount === 1 ? '' : 's'}`;
    if (s.orgName) el.orgName.textContent = s.orgName;

    const phaseLabels = { lobby: 'Lobby', question: 'Question', reveal: 'Answer', finished: 'Results' };
    el.phaseChip.textContent = phaseLabels[s.phase] || 'Lobby';

    switch (s.phase) {
      case 'question':
        renderQuestion(s);
        break;
      case 'reveal':
        stopTicker();
        renderReveal(s);
        break;
      case 'finished':
        stopTicker();
        renderFinished(s);
        break;
      default:
        stopTicker();
        renderLobby(s);
    }
  }

  /* ---------------------------- ticker ----------------------------- */

  function startTicker() {
    if (ticker) return;
    ticker = window.setInterval(tick, 100);
  }

  function stopTicker() {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  }

  function tick() {
    if (!state || !state.question) return;
    const q = state.question;
    const ratio = countdownRatio(q.deadline, q.durationMs, state.serverTime, snapshotAt);

    el.ringFill.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
    const secs = Math.max(0, Math.ceil(ratio * (q.durationMs / 1000)));
    el.ringNum.textContent = String(secs);
    el.ring.classList.toggle('is-warn', ratio <= 0.5 && ratio > 0.22);
    el.ring.classList.toggle('is-danger', ratio <= 0.22);
  }

  /* ---------------------------- controls --------------------------- */

  el.startBtn.addEventListener('click', () => host('start'));
  el.revealBtn.addEventListener('click', () => host('reveal'));
  el.nextBtn.addEventListener('click', () => host('next'));
  el.againBtn.addEventListener('click', () => host('start'));
  el.newGameBtn.addEventListener('click', () => host('reset'));

  document.addEventListener('keydown', (event) => {
    if (!state || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
    if (event.key === ' ' || event.key === 'Enter') {
      if (state.phase === 'question') {
        event.preventDefault();
        host('reveal');
      } else if (state.phase === 'reveal') {
        event.preventDefault();
        host('next');
      }
    }
  });

  /* ----------------------------- startup --------------------------- */

  if (!code || !hostKey) {
    fail('This link is missing the game code or the host key. Create a new game from the start page.');
  } else {
    request('/api/meta')
      .then((m) => {
        meta = m;
        buildCatPicker();
        if (state) syncControls(state.settings);
      })
      .catch(() => {
        buildCatPicker();
      });

    stream = connect({
      room: code,
      hostKey,
      onStatus: (status) => {
        setConn(status);
        if (status === 'offline' && !views.error.classList.contains('is-active')) {
          // Only surface a hard failure; transient drops are handled quietly.
        }
      },
      onState: (s) => {
        state = s;
        snapshotAt = Date.now();
        render(s);
      }
    });

    // A bad key is rejected by the snapshot request with a 403.
    request(`/api/rooms/${encodeURIComponent(code)}/state?hostKey=${encodeURIComponent(hostKey)}`).catch((err) => {
      if (err.status === 403 || err.status === 404) {
        if (stream) stream.close();
        fail(err.message || 'That game is no longer running.');
      }
    });
  }

  window.addEventListener('pagehide', () => {
    if (stream) stream.close();
    stopTicker();
  });
})();
