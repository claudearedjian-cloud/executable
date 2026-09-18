'use strict';

/**
 * Shared browser helpers: API calls, the live state stream and toasts.
 * Exposes a single global, `QN`.
 */
window.QN = (function () {
  /* ------------------------- storage ---------------------------- */

  const memory = new Map();
  const hasLS = (() => {
    try {
      const k = '__qn_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  })();

  const store = {
    get(key) {
      try {
        const raw = hasLS ? window.localStorage.getItem(key) : memory.get(key);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },
    set(key, value) {
      const raw = JSON.stringify(value);
      try {
        if (hasLS) window.localStorage.setItem(key, raw);
        else memory.set(key, raw);
      } catch {
        /* storage full or blocked — the session still works in memory */
      }
    },
    remove(key) {
      try {
        if (hasLS) window.localStorage.removeItem(key);
        else memory.delete(key);
      } catch {
        /* nothing to do */
      }
    }
  };

  /* --------------------------- http ----------------------------- */

  async function request(path, { method = 'GET', body, headers } = {}) {
    const init = { method, headers: { Accept: 'application/json', ...(headers || {}) } };
    if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(path, init);
    } catch {
      throw new Error('Cannot reach the game server. Check the venue Wi-Fi and try again.');
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      const message = (data && data.error) || `Request failed (${res.status}).`;
      const err = new Error(message);
      err.status = res.status;
      err.code = (data && data.code) || null;
      throw err;
    }
    return data;
  }

  /* --------------------- live state stream ---------------------- */

  /**
   * Subscribes to a room. Uses Server-Sent Events, and falls back to polling
   * if the connection cannot be established (some venue networks block
   * long-lived responses).
   */
  function connect({ room, playerId, token, hostKey, onState, onStatus }) {
    const params = new URLSearchParams();
    if (playerId) params.set('playerId', playerId);
    if (token) params.set('token', token);
    if (hostKey) params.set('hostKey', hostKey);
    const query = params.toString();

    const status = (s) => onStatus && onStatus(s);
    let lastRev = 0;
    const state = (s) => {
      if (!s) return;
      if (s.rev < lastRev) return; // ignore out-of-order frames
      lastRev = s.rev;
      onState && onState(s);
    };

    let source = null;
    let pollTimer = null;
    let failures = 0;
    let closed = false;
    let everConnected = false;
    const markLive = () => {
      everConnected = true;
      status('live');
    };

    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const startPolling = () => {
      if (pollTimer || closed) return;
      if (everConnected) status('reconnecting');
      pollTimer = setInterval(async () => {
        try {
          const s = await request(`/api/rooms/${room}/state?${query}`);
          failures = 0;
          markLive();
          state(s);
        } catch {
          status('offline');
        }
      }, 1400);
    };

    const closeStream = () => {
      if (source) {
        source.close();
        source = null;
      }
    };

    const openStream = () => {
      if (closed || typeof window.EventSource !== 'function') return startPolling();

      closeStream();
      status('connecting');
      source = new window.EventSource(`/api/rooms/${room}/stream?${query}`);

      source.addEventListener('state', (event) => {
        try {
          state(JSON.parse(event.data));
        } catch {
          /* malformed frame — the next one will correct it */
        }
        failures = 0;
        markLive();
      });

      source.onopen = () => {
        failures = 0;
        markLive();
      };

      source.onerror = () => {
        failures += 1;
        // Browsers reconnect on their own, but if it keeps failing the venue
        // network is almost certainly blocking it — switch to polling.
        if (failures >= 3) {
          closeStream();
          startPolling();
        } else {
          status('reconnecting');
        }
      };
    };

    openStream();

    // Always take one snapshot up front so a refresh is instant.
    request(`/api/rooms/${room}/state?${query}`)
      .then(state)
      .catch(() => {
        if (!source) status('offline');
      });

    return {
      close() {
        closed = true;
        closeStream();
        stopPolling();
      }
    };
  }

  /* --------------------------- toast ---------------------------- */

  let toastEl = null;
  let toastTimer = null;

  function toast(message, ms = 3600) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), ms);
  }

  /* ------------------------- utilities -------------------------- */

  const qs = new URLSearchParams(window.location.search);

  function countdownRatio(deadline, durationMs, serverTimeAtSnapshot, snapshotAt) {
    if (!deadline || !durationMs) return 0;
    const drift = Date.now() - (snapshotAt || Date.now());
    const serverNow = (serverTimeAtSnapshot || Date.now()) + drift;
    return Math.max(0, Math.min(1, (deadline - serverNow) / durationMs));
  }

  function secondsLeft(deadline, serverTimeAtSnapshot, snapshotAt) {
    const drift = Date.now() - (snapshotAt || Date.now());
    const serverNow = (serverTimeAtSnapshot || Date.now()) + drift;
    return Math.max(0, Math.ceil((deadline - serverNow) / 1000));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Applies organisation branding to the page: name, tagline, accent colour
   * and logo. Targets the shared ids used across launcher/host/play screens.
   */
  function applyBranding(b) {
    if (!b) return;
    if (b.accent) document.documentElement.style.setProperty('--brand', b.accent);

    const name = document.getElementById('orgName');
    if (name && b.orgName) name.textContent = b.orgName;

    const tag = document.getElementById('tagline');
    if (tag) {
      tag.textContent = b.tagline || '';
      tag.classList.toggle('hidden', !b.tagline);
    }

    const mark = document.getElementById('brandMark');
    if (mark) {
      if (b.logoUrl) {
        mark.classList.add('has-logo');
        mark.style.backgroundImage = `url("${b.logoUrl}")`;
      } else {
        mark.classList.remove('has-logo');
        mark.style.backgroundImage = '';
      }
    }
  }

  /** Renders a celebrity-style visual: a photo if one is set, else an emoji tile. */
  function mediaTileHtml(q) {
    if (!q) return '';
    if (q.image) return `<img class="media-img" src="${escapeHtml(q.image)}" alt="" />`;
    if (q.avatar) return `<span class="media-emoji">${escapeHtml(q.avatar)}</span>`;
    return '';
  }

  function setMedia(el, q) {
    const html = mediaTileHtml(q);
    if (html) {
      el.innerHTML = html;
      el.classList.remove('hidden');
    } else {
      el.innerHTML = '';
      el.classList.add('hidden');
    }
  }

  return { store, request, connect, toast, qs, countdownRatio, secondsLeft, escapeHtml, applyBranding, setMedia };
})();
