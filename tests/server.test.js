'use strict';

/** End-to-end checks against the real HTTP server. */

const test = require('node:test');
const assert = require('node:assert/strict');

const http = require('node:http');
const { server } = require('../server/index');

let base;
let port;

/** fetch() normalises `..` away, so use a raw request to test path handling. */
function rawGet(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('the server starts', async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
  base = `http://127.0.0.1:${port}`;
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
});

test('static pages are served with a strict content security policy', async () => {
  for (const route of ['/', '/host', '/play', '/css/styles.css', '/js/api.js']) {
    const res = await fetch(`${base}${route}`);
    assert.equal(res.status, 200, `${route} should be served`);
    const csp = res.headers.get('content-security-policy');
    assert.ok(csp, `${route} should carry a CSP`);
    assert.ok(!csp.includes('unsafe-inline'), `${route}: CSP should not allow unsafe-inline`);
  }
});

test('extension-less routes serve the matching page, not a fallback', async () => {
  const checks = [
    ['/', 'launcher.js'],
    ['/host', 'host.js'],
    ['/play', 'play.js'],
    ['/host.html', 'host.js'],
    ['/play.html', 'play.js']
  ];
  for (const [route, marker] of checks) {
    const body = await (await fetch(`${base}${route}`)).text();
    assert.ok(body.includes(marker), `${route} should serve the page that loads ${marker}`);
  }

  const missing = await fetch(`${base}/no-such-page`);
  assert.equal(missing.status, 404, 'unknown routes should 404 rather than serve another page');
});

test('nothing outside the public directory can be read', async () => {
  const attempts = ['/../../etc/passwd', '/%2e%2e/%2e%2e/%2e%2e/etc/passwd', '/server/index.js', '/../package.json'];
  for (const path of attempts) {
    const res = await rawGet(path);
    assert.ok(!res.body.includes('root:x:0:0'), `${path}: served /etc/passwd`);
    assert.ok(!res.body.includes('node:http'), `${path}: served server source`);
    assert.ok(!res.body.includes('"dependencies"'), `${path}: served package.json`);
    // Either a refusal, or the launcher page as a harmless fallback.
    assert.ok(res.status === 403 || res.status === 404 || res.body.includes('Quiz Night'), `${path}: unexpected response`);
  }
});

test('a full game can be played over HTTP', async () => {
  // Host creates a room.
  const created = await (await fetch(`${base}/api/rooms`, { method: 'POST' })).json();
  const { code, hostKey } = created;
  assert.match(code, /^[A-Z0-9]{4}$/);
  assert.equal(created.state.phase, 'lobby');

  // Two players join.
  const join = async (name) =>
    (await (await fetch(`${base}/api/rooms/${code}/join`, { method: 'POST', body: JSON.stringify({ name }), headers: { 'Content-Type': 'application/json' } })).json());

  const alice = await join('Alice');
  assert.ok(alice.playerId && alice.token);
  assert.equal(alice.state.playerCount, 1, 'Alice is the only player so far');

  const bob = await join('Bob');
  assert.equal(bob.state.playerCount, 2);

  // A player without a token cannot answer as someone else.
  const spoof = await fetch(`${base}/api/rooms/${code}/answer`, {
    method: 'POST',
    body: JSON.stringify({ playerId: alice.playerId, token: 'wrong', choice: 0 }),
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(spoof.status, 409);

  // Host starts the game.
  const started = await fetch(`${base}/api/rooms/${code}/host/start`, {
    method: 'POST',
    body: JSON.stringify({ hostKey }),
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(started.status, 200);
  const startedBody = await started.json();
  assert.equal(startedBody.state.phase, 'question');

  // The answer is not revealed while the question is live.
  const live = await (await fetch(`${base}/api/rooms/${code}/state?hostKey=${hostKey}`)).json();
  assert.equal(live.question.options.length, 4);
  assert.equal(live.reveal, null);
  assert.equal('answer' in live.question, false);

  // Everyone answers; the question auto-reveals.
  const answer = async (player, choice) => {
    const res = await fetch(`${base}/api/rooms/${code}/answer`, {
      method: 'POST',
      body: JSON.stringify({ playerId: player.playerId, token: player.token, choice }),
      headers: { 'Content-Type': 'application/json' }
    });
    assert.equal(res.status, 200);
  };
  await answer(alice, 1);
  await answer(bob, 2);

  const revealed = await (await fetch(`${base}/api/rooms/${code}/state?hostKey=${hostKey}`)).json();
  assert.equal(revealed.phase, 'reveal');
  assert.ok(Number.isInteger(revealed.reveal.correctIndex));
  assert.equal(revealed.hostAnswers.length, 2);
  assert.ok(typeof revealed.reveal.fact === 'string');

  // Players see their own answer, and only their own.
  const aliceView = await (
    await fetch(`${base}/api/rooms/${code}/state?playerId=${alice.playerId}&token=${alice.token}`)
  ).json();
  assert.equal(aliceView.me.choice, 1);
  assert.equal(aliceView.hostAnswers, undefined, 'players must not receive the host-only answer list');

  // Host advances.
  await fetch(`${base}/api/rooms/${code}/host/next`, {
    method: 'POST',
    body: JSON.stringify({ hostKey }),
    headers: { 'Content-Type': 'application/json' }
  });
  const next = await (await fetch(`${base}/api/rooms/${code}/state?hostKey=${hostKey}`)).json();
  assert.equal(next.phase, 'question');
  assert.equal(next.question.number, 2);

  // Results CSV is host-only.
  const anonCsv = await fetch(`${base}/api/rooms/${code}/results.csv`);
  assert.equal(anonCsv.status, 403);
  const csv = await fetch(`${base}/api/rooms/${code}/results.csv?hostKey=${hostKey}`);
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  const csvText = await csv.text();
  assert.match(csvText, /rank,name,score,correct,best_streak/);
  assert.ok(csvText.includes('Alice'));
});

test('host actions require the host key', async () => {
  const { code } = await (await fetch(`${base}/api/rooms`, { method: 'POST' })).json();
  await fetch(`${base}/api/rooms/${code}/join`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Zoe' }),
    headers: { 'Content-Type': 'application/json' }
  });

  const res = await fetch(`${base}/api/rooms/${code}/host/start`, {
    method: 'POST',
    body: JSON.stringify({ hostKey: 'not-the-key' }),
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(res.status, 403);
  const body = await res.json();
  assert.match(body.error, /Not authorised/);
});

test('the live state is reachable at both /state and the bare room path', async () => {
  const { code, hostKey } = await (await fetch(`${base}/api/rooms`, { method: 'POST' })).json();
  for (const path of [`/api/rooms/${code}`, `/api/rooms/${code}/state`]) {
    const res = await fetch(`${base}${path}?hostKey=${hostKey}`);
    assert.equal(res.status, 200, `${path} should serve the state`);
    const body = await res.json();
    assert.equal(body.phase, 'lobby');
    assert.equal(body.host, true);
    assert.equal(body.code, code);
  }
});

test('an unknown room code gives a helpful message', async () => {
  const res = await fetch(`${base}/api/rooms/ZZZZ/join`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Alice' }),
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.match(body.error, /No game is running/);
});

test('blank names are rejected', async () => {
  const { code } = await (await fetch(`${base}/api/rooms`, { method: 'POST' })).json();
  const res = await fetch(`${base}/api/rooms/${code}/join`, {
    method: 'POST',
    body: JSON.stringify({ name: '   ' }),
    headers: { 'Content-Type': 'application/json' }
  });
  assert.equal(res.status, 400);
});

test('the live stream sends the current state immediately', async () => {
  const { code, hostKey } = await (await fetch(`${base}/api/rooms`, { method: 'POST' })).json();
  const controller = new AbortController();

  const res = await fetch(`${base}/api/rooms/${code}/stream?hostKey=${hostKey}`, { signal: controller.signal });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/event-stream/);

  const reader = res.body.getReader();
  const { value } = await reader.read();
  const text = new TextDecoder().decode(value);
  assert.match(text, /event: state/);
  assert.match(text, /"phase":"lobby"/);

  controller.abort();
  reader.cancel().catch(() => {});
});

test('shutting down', () => {
  server.close();
});
