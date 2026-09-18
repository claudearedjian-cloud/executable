'use strict';

(function () {
  const { qs, request, connect, store, toast, countdownRatio, secondsLeft, escapeHtml, applyBranding, setMedia } = window.QN;

  const code = (qs.get('code') || '').trim().toUpperCase();

  const views = {
    join: document.getElementById('viewJoin'),
    lobby: document.getElementById('viewLobby'),
    question: document.getElementById('viewQuestion'),
    reveal: document.getElementById('viewReveal'),
    finished: document.getElementById('viewFinished'),
    gone: document.getElementById('viewGone')
  };

  const el = {
    connChip: document.getElementById('connChip'),
    connText: document.getElementById('connText'),
    scorePill: document.getElementById('scorePill'),
    myScore: document.getElementById('myScore'),
    joinCode: document.getElementById('joinCode'),
    joinName: document.getElementById('joinName'),
    joinBtn: document.getElementById('joinBtn'),
    notice: document.getElementById('notice'),
    lobbyTitle: document.getElementById('lobbyTitle'),
    lobbySub: document.getElementById('lobbySub'),
    lobbyCount: document.getElementById('lobbyCount'),
    countdown: document.getElementById('pCountdown'),
    countdownFill: document.getElementById('pCountdownFill'),
    cat: document.getElementById('pCat'),
    catName: document.getElementById('pCatName'),
    counter: document.getElementById('pCounter'),
    timer: document.getElementById('pTimer'),
    question: document.getElementById('pQuestion'),
    answers: document.getElementById('pAnswers'),
    locked: document.getElementById('pLocked'),
    hero: document.getElementById('pHero'),
    verdict: document.getElementById('pVerdict'),
    points: document.getElementById('pPoints'),
    correctText: document.getElementById('pCorrectText'),
    fact: document.getElementById('pFact'),
    factBox: document.getElementById('pFactBox'),
    standings: document.getElementById('pStandings'),
    finalPlace: document.getElementById('finalPlace'),
    finalSummary: document.getElementById('finalSummary'),
    finalStandings: document.getElementById('finalStandings'),
    leaveBtn: document.getElementById('leaveBtn'),
    goneReason: document.getElementById('goneReason'),
    pMedia: document.getElementById('pMedia'),
    pRevealMedia: document.getElementById('pRevealMedia')
  };

  const CAT_COLOUR = { geography: 'var(--geo)', history: 'var(--his)', general: 'var(--gen)' };

  let session = code ? store.get(`qn:player:${code}`) : null;
  let state = null;
  let snapshotAt = Date.now();
  let stream = null;
  let ticker = null;
  let renderedQuestion = null; // which question number the DOM currently shows
  let submitting = false;

  /* ---------------------------- plumbing --------------------------- */

  function show(name) {
    for (const [key, node] of Object.entries(views)) node.classList.toggle('is-active', key === name);
  }

  function setConn(status) {
    const map = {
      live: ['chip-live', 'Live'],
      connecting: ['chip-live', 'Connecting'],
      reconnecting: ['chip-off', 'Reconnecting'],
      offline: ['chip-off', 'Offline']
    };
    const [cls, text] = map[status] || map.connecting;
    el.connChip.classList.toggle('chip-live', cls === 'chip-live');
    el.connChip.classList.toggle('chip-off', cls === 'chip-off');
    el.connText.textContent = text;
  }

  function failGone(reason) {
    if (reason) el.goneReason.textContent = reason;
    if (stream) stream.close();
    stopTicker();
    if (code) store.remove(`qn:player:${code}`);
    session = null;
    show('gone');
  }

  function showNotice(message) {
    el.notice.textContent = message;
    el.notice.classList.add('is-visible');
  }

  function vibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {
      /* not supported — harmless */
    }
  }

  /* ------------------------------ join ----------------------------- */

  if (code) el.joinCode.value = code;
  const remembered = store.get('qn:last-name');
  if (remembered) el.joinName.value = remembered;

  document.getElementById('joinForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const joinCode = el.joinCode.value.trim().toUpperCase();
    const name = el.joinName.value.trim();

    if (joinCode.length < 4) return showNotice('Enter the four-letter code from the big screen.');
    if (!name) return showNotice('Add your name so the host knows who you are.');

    el.joinBtn.disabled = true;
    el.joinBtn.textContent = 'Joining…';

    try {
      const data = await request(`/api/rooms/${encodeURIComponent(joinCode)}/join`, { method: 'POST', body: { name } });
      session = { playerId: data.playerId, token: data.token, name };
      store.set(`qn:player:${joinCode}`, session);
      store.set('qn:last-name', name);
      el.notice.classList.remove('is-visible');
      history.replaceState(null, '', `/play?code=${encodeURIComponent(joinCode)}`);
      startStream(joinCode);
    } catch (err) {
      showNotice(err.message);
      el.joinBtn.disabled = false;
      el.joinBtn.textContent = 'Join the game';
    }
  });

  el.leaveBtn.addEventListener('click', async () => {
    if (session && code) {
      try {
        await request(`/api/rooms/${encodeURIComponent(code)}/leave`, {
          method: 'POST',
          body: { playerId: session.playerId, token: session.token }
        });
      } catch {
        /* the room may already be gone */
      }
    }
    if (code) store.remove(`qn:player:${code}`);
    window.location.href = '/';
  });

  /* ---------------------------- answering -------------------------- */

  function renderAnswers(question, picked) {
    el.answers.innerHTML = question.options
      .map((text, i) => {
        const letter = String.fromCharCode(65 + i);
        const isPicked = picked === i;
        return `<button type="button" class="answer${isPicked ? ' is-picked' : ''}" data-index="${i}" ${
          picked !== null && picked !== undefined ? 'disabled' : ''
        }>
          <span class="letter">${letter}</span>
          <span class="text">${escapeHtml(text)}</span>
          ${isPicked ? '<span class="tag">Picked</span>' : ''}
        </button>`;
      })
      .join('');

    el.locked.classList.toggle('hidden', picked === null || picked === undefined);
  }

  el.answers.addEventListener('click', async (event) => {
    const button = event.target.closest('.answer');
    if (!button || !state || !state.question || submitting) return;
    if (!session) return failGone('Your place in this game expired. Ask the host for the code and join again.');

    const index = Number(button.dataset.index);
    const current = state.me && state.me.choice !== null && state.me.choice !== undefined ? state.me.choice : null;
    if (current !== null) return;

    // The reveal can land while the request below is in flight (timer runs
    // out, or the last other player answers). Capture the question now and
    // only redraw the answer grid if that same question is still live —
    // otherwise we would render against a null question and toast a crash.
    const clickedQuestion = state.question;

    submitting = true;
    vibrate(12);

    try {
      await request(`/api/rooms/${encodeURIComponent(code)}/answer`, {
        method: 'POST',
        body: { playerId: session.playerId, token: session.token, choice: index }
      });
      if (state.me) state.me.choice = index;
      if (state.phase === 'question' && state.question && state.question.number === clickedQuestion.number) {
        renderAnswers(clickedQuestion, index);
      }
    } catch (err) {
      toast(err.message);
    } finally {
      submitting = false;
    }
  });

  /* ---------------------------- rendering -------------------------- */

  function standingsHtml(list, limit, myId) {
    const rows = [];
    const slice = limit ? list.slice(0, limit) : list;
    for (const p of slice) {
      rows.push(rowHtml(p, p.id === myId));
    }
    if (limit && myId) {
      const mine = list.find((p) => p.id === myId);
      if (mine && mine.rank > limit) {
        rows.push('<div class="standing-row" aria-hidden="true"><span class="pos">…</span><span class="nm"></span><span class="sc"></span></div>');
        rows.push(rowHtml(mine, true));
      }
    }
    return rows.join('');
  }

  function rowHtml(p, highlight) {
    return `<div class="standing-row${p.rank <= 3 ? ' top' : ''}">
      <span class="pos">${p.rank}</span>
      <span class="nm">${escapeHtml(p.name)}${highlight ? '<span class="sub">you</span>' : ''}</span>
      <span class="sc mono">${p.score}</span>
    </div>`;
  }

  function renderLobby(s) {
    el.lobbyCount.textContent = String(s.playerCount);
    const finishedBefore = s.settings && s.settings.plannedTotal;
    el.lobbySub.textContent = `${finishedBefore} questions ready. Waiting for the host to start.`;
    el.lobbyTitle.textContent = session ? `You're in, ${session.name}` : "You're in";
    show('lobby');
  }

  function renderQuestion(s) {
    const q = s.question;
    el.cat.style.setProperty('--cat', CAT_COLOUR[q.category] || 'var(--brand)');
    el.catName.textContent = q.categoryName;
    el.counter.innerHTML = `${q.number} <span class="faint">/ ${q.total}</span>`;
    setMedia(el.pMedia, q);
    el.question.textContent = q.text;

    const picked = s.me && s.me.choice !== null && s.me.choice !== undefined ? s.me.choice : null;

    if (renderedQuestion !== q.number) {
      renderedQuestion = q.number;
      renderAnswers(q, picked);
    } else if (picked !== null) {
      // Our answer came back from the server — reflect the lock.
      const anyPicked = el.answers.querySelector('.answer.is-picked');
      if (!anyPicked) renderAnswers(q, picked);
    }

    show('question');
    startTicker();
  }

  function renderReveal(s) {
    const r = s.reveal;
    const myChoice = s.me ? s.me.choice : null;
    const answered = myChoice !== null && myChoice !== undefined;
    const correct = answered && myChoice === r.correctIndex;

    el.hero.className = `result-hero ${correct ? 'good' : 'bad'}`;
    if (!answered) {
      el.verdict.textContent = 'No answer';
      el.points.innerHTML = 'The clock beat you this time.';
    } else if (correct) {
      el.verdict.textContent = 'Correct';
      const pts = s.me.lastPoints || 0;
      el.points.innerHTML = `<strong>+${pts}</strong> point${pts === 1 ? '' : 's'}`;
      vibrate([18, 40, 18]);
    } else {
      el.verdict.textContent = 'Not quite';
      el.points.textContent = `The answer was ${r.options[r.correctIndex]}.`;
      vibrate(60);
    }

    setMedia(el.pRevealMedia, r);
    el.correctText.textContent = r.options[r.correctIndex];
    if (r.fact) {
      el.fact.textContent = r.fact;
      el.factBox.hidden = false;
    } else {
      el.factBox.hidden = true;
    }

    el.standings.innerHTML = standingsHtml(s.players, 5, s.me ? s.me.id : null);
    renderedQuestion = null;
    show('reveal');
  }

  function renderFinished(s) {
    const list = (s.finished && s.finished.standings) || s.players;
    const me = s.me ? list.find((p) => p.id === s.me.id) : null;
    const total = s.finished ? s.finished.total : 0;

    if (me) {
      el.finalPlace.textContent = me.rank === 1 ? 'First place 🏆' : `You finished ${me.rank}${ordinal(me.rank)}`;
      el.finalSummary.innerHTML = `<strong>${me.score}</strong> points from ${me.correct} correct answer${me.correct === 1 ? '' : 's'} out of ${total}`;
    } else {
      el.finalPlace.textContent = 'That’s the game';
      el.finalSummary.textContent = `${total} questions played.`;
    }

    el.finalStandings.innerHTML = standingsHtml(list, 0, s.me ? s.me.id : null);
    renderedQuestion = null;
    show('finished');
  }

  function ordinal(n) {
    const rem10 = n % 10;
    const rem100 = n % 100;
    if (rem10 === 1 && rem100 !== 11) return 'st';
    if (rem10 === 2 && rem100 !== 12) return 'nd';
    if (rem10 === 3 && rem100 !== 13) return 'rd';
    return 'th';
  }

  /* ----------------------------- ticker ---------------------------- */

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
    el.countdownFill.style.transform = `scaleX(${ratio})`;

    const secs = Math.max(0, Math.ceil(ratio * (q.durationMs / 1000)));
    el.timer.textContent = String(secs);

    el.countdown.classList.toggle('is-warn', ratio <= 0.5 && ratio > 0.22);
    el.countdown.classList.toggle('is-danger', ratio <= 0.22);
    el.timer.style.color = ratio <= 0.22 ? 'var(--bad)' : ratio <= 0.5 ? 'var(--gold)' : '';
  }

  /* ------------------------------ stream --------------------------- */

  function startStream(roomCode) {
    if (stream) stream.close();
    show('lobby');
    stream = connect({
      room: roomCode,
      playerId: session.playerId,
      token: session.token,
      onStatus: setConn,
      onState: (s) => {
        state = s;
        snapshotAt = Date.now();
        render(s);
      }
    });
  }

  function render(s) {
    const myScore = s.me ? s.me.score : 0;
    el.myScore.textContent = String(myScore);
    el.scorePill.hidden = s.phase === 'lobby';
    applyBranding(s.branding);

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
        renderedQuestion = null;
        renderLobby(s);
    }
  }

  /* ----------------------------- startup --------------------------- */

  if (!code) {
    window.location.replace('/');
    return;
  }

  if (!session || !session.playerId) {
    show('join');
  } else {
    // Check the seat is still valid before subscribing.
    request(`/api/rooms/${encodeURIComponent(code)}/state?playerId=${encodeURIComponent(session.playerId)}&token=${encodeURIComponent(session.token)}`)
      .then((s) => {
        if (!s.me) {
          store.remove(`qn:player:${code}`);
          session = null;
          show('join');
          showNotice('That code is for a different game, or your seat expired. Join again.');
          return;
        }
        startStream(code);
      })
      .catch((err) => {
        if (err.status === 404) return failGone(err.message);
        if (err.status === 403 || err.status === 409) {
          store.remove(`qn:player:${code}`);
          session = null;
          show('join');
          showNotice(err.message);
          return;
        }
        failGone(err.message);
      });
  }

  window.addEventListener('pagehide', () => {
    if (stream) stream.close();
    stopTicker();
  });
})();
