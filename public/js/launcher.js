'use strict';

(function () {
  const { qs, request, store } = window.QN;

  const tabJoin = document.getElementById('tabJoin');
  const tabHost = document.getElementById('tabHost');
  const paneJoin = document.getElementById('paneJoin');
  const paneHost = document.getElementById('paneHost');
  const joinForm = document.getElementById('joinForm');
  const codeInput = document.getElementById('joinCode');
  const nameInput = document.getElementById('joinName');
  const joinBtn = document.getElementById('joinBtn');
  const createBtn = document.getElementById('createBtn');
  const notice = document.getElementById('notice');
  const orgName = document.getElementById('orgName');

  function showNotice(message) {
    notice.textContent = message;
    notice.classList.add('is-visible');
  }

  function clearNotice() {
    notice.classList.remove('is-visible');
    notice.textContent = '';
  }

  function selectTab(which) {
    const joining = which === 'join';
    tabJoin.setAttribute('aria-selected', String(joining));
    tabHost.setAttribute('aria-selected', String(!joining));
    paneJoin.hidden = !joining;
    paneHost.hidden = joining;
    clearNotice();
    if (joining) codeInput.focus({ preventScroll: true });
  }

  tabJoin.addEventListener('click', () => selectTab('join'));
  tabHost.addEventListener('click', () => selectTab('host'));

  /* Code field: uppercase, and only letters and digits. */
  codeInput.addEventListener('input', () => {
    const cleaned = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned !== codeInput.value) codeInput.value = cleaned;
    clearNotice();
  });

  nameInput.addEventListener('input', clearNotice);

  /* --------------------------- joining --------------------------- */

  joinForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearNotice();

    const code = codeInput.value.trim().toUpperCase();
    const name = nameInput.value.trim();

    if (code.length < 4) {
      showNotice('Enter the four-letter code from the big screen.');
      codeInput.focus();
      return;
    }
    if (!name) {
      showNotice('Add your name so the host knows who you are.');
      nameInput.focus();
      return;
    }

    joinBtn.disabled = true;
    joinBtn.textContent = 'Joining…';

    try {
      const data = await request(`/api/rooms/${encodeURIComponent(code)}/join`, { method: 'POST', body: { name } });
      store.set(`qn:player:${code}`, { playerId: data.playerId, token: data.token, name });
      store.set('qn:last-name', name);
      window.location.href = `/play?code=${encodeURIComponent(code)}`;
    } catch (err) {
      showNotice(err.message);
      joinBtn.disabled = false;
      joinBtn.textContent = 'Join the game';
    }
  });

  /* ------------------------- hosting ---------------------------- */

  createBtn.addEventListener('click', async () => {
    clearNotice();
    createBtn.disabled = true;
    createBtn.textContent = 'Setting up…';

    try {
      const data = await request('/api/rooms', { method: 'POST', body: {} });
      store.set(`qn:host:${data.code}`, { hostKey: data.hostKey });
      window.location.href = `/host?code=${encodeURIComponent(data.code)}&key=${encodeURIComponent(data.hostKey)}`;
    } catch (err) {
      showNotice(err.message);
      createBtn.disabled = false;
      createBtn.textContent = 'Create a new game';
    }
  });

  /* --------------------- arriving from a link -------------------- */

  const urlCode = (qs.get('code') || '').toUpperCase();
  const urlKey = qs.get('key') || '';

  request('/api/meta')
    .then((meta) => {
      if (meta && meta.orgName) {
        orgName.textContent = meta.orgName;
        document.title = `Quiz Night — ${meta.orgName}`;
      }
    })
    .catch(() => {
      /* the default name in the markup is fine */
    });

  if (urlCode && urlKey) {
    // A host link: go straight through.
    window.location.replace(`/host?code=${encodeURIComponent(urlCode)}&key=${encodeURIComponent(urlKey)}`);
    return;
  }

  if (urlCode) {
    codeInput.value = urlCode;
    selectTab('join');
  } else {
    const remembered = store.get('qn:last-name');
    if (remembered) nameInput.value = remembered;
  }

  if (urlCode) nameInput.focus({ preventScroll: true });
  else codeInput.focus({ preventScroll: true });
})();
