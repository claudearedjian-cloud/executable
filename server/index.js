'use strict';

/**
 * Quiz Night — a single self-contained Node server.
 *
 * Serves the host screen and the player screens, and keeps every phone in
 * step with the host using Server-Sent Events (with polling as a fallback).
 * Zero runtime dependencies: `node server/index.js` and you are running.
 */

const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { URL } = require('node:url');

const { Room, PHASE, GameError, randomCode } = require('./game');
const { CATEGORIES } = require('./questions');

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';
const ORG_NAME = process.env.ORG_NAME || 'Community Centre';
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Rooms and their subscribers                                         */
/* ------------------------------------------------------------------ */

/** @type {Map<string, Room>} */
const rooms = new Map();
/** @type {Map<string, Set<{res: http.ServerResponse, viewer: object}>>} */
const subscribers = new Map();
/** @type {Map<string, NodeJS.Timeout>} */
const timers = new Map();

function getRoom(code) {
  return rooms.get(String(code || '').trim().toUpperCase()) || null;
}

function createRoom() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const code = randomCode(4);
    if (!rooms.has(code)) {
      const room = new Room(code, { orgName: ORG_NAME });
      rooms.set(code, room);
      subscribers.set(code, new Set());
      return room;
    }
  }
  throw new GameError('Could not allocate a room code. Please try again.', 'busy');
}

function broadcast(room) {
  const subs = subscribers.get(room.code);
  if (!subs || subs.size === 0) return;
  for (const sub of [...subs]) {
    try {
      const payload = sub.viewer === 'host' ? room.hostState() : room.stateFor(sub.playerId, sub.token);
      sub.res.write(`id: ${room.rev}\nevent: state\ndata: ${JSON.stringify(payload)}\n\n`);
    } catch {
      subscribers.get(room.code)?.delete(sub);
    }
  }
}

/** Mutate a room, then push the new state to everyone watching. */
function mutate(room, fn) {
  const result = fn();
  broadcast(room);
  return result;
}

function scheduleExpiry(room) {
  const existing = timers.get(room.code);
  if (existing) clearTimeout(existing);

  if (room.phase !== PHASE.QUESTION || !room.deadline) return;
  const delay = Math.max(20, room.deadline - Date.now() + 60);
  const timer = setTimeout(() => {
    timers.delete(room.code);
    if (room.phase === PHASE.QUESTION) mutate(room, () => room.expire());
  }, delay);
  timer.unref?.();
  timers.set(room.code, timer);
}

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL_MS) {
      const subs = subscribers.get(code);
      for (const sub of subs || []) sub.res.end();
      subscribers.delete(code);
      const timer = timers.get(code);
      if (timer) clearTimeout(timer);
      timers.delete(code);
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000).unref();

/* ------------------------------------------------------------------ */
/* HTTP plumbing                                                       */
/* ------------------------------------------------------------------ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8'
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'"
};

function send(res, status, body, headers = {}) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  res.writeHead(status, { 'Content-Length': payload.length, ...SECURITY_HEADERS, ...headers });
  res.end(payload);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 64 * 1024) {
        reject(new GameError('Request too large.', 'too_large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new GameError('Malformed JSON body.', 'bad_request'));
      }
    });
    req.on('error', reject);
  });
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) return sendError(res, 404, 'Not found');
    const ext = path.extname(filePath).toLowerCase();
    const cache = ext === '.html' ? 'no-cache' : 'public, max-age=300';
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache });
  });
}

/**
 * Serves files from public/. Extension-less paths such as /host resolve to
 * /host.html so the links on the big screen stay short. Unknown paths get a
 * real 404 rather than a silent fallback, which would only hide mistakes.
 */
function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) return sendError(res, 403, 'Forbidden');

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return serveFile(res, filePath);
  if (!path.extname(filePath) && fs.existsSync(`${filePath}.html`)) return serveFile(res, `${filePath}.html`);
  return sendError(res, 404, 'Not found');
}

/* ------------------------------------------------------------------ */
/* Server-sent events                                                  */
/* ------------------------------------------------------------------ */

function openStream(req, res, room, viewer) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    ...SECURITY_HEADERS
  });
  res.write('retry: 2000\n\n');

  const client = { res, ...viewer };
  const subs = subscribers.get(room.code) || new Set();
  subs.add(client);
  subscribers.set(room.code, subs);

  const initial = viewer.viewer === 'host' ? room.hostState() : room.stateFor(viewer.playerId, viewer.token);
  res.write(`id: ${room.rev}\nevent: state\ndata: ${JSON.stringify(initial)}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      /* handled on close */
    }
  }, 15000);
  heartbeat.unref?.();

  const cleanup = () => {
    clearInterval(heartbeat);
    subscribers.get(room.code)?.delete(client);
  };
  req.on('close', cleanup);
  req.on('error', cleanup);
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'rooms', CODE, ...]
  const method = req.method || 'GET';

  if (parts[0] !== 'api') return sendError(res, 404, 'Not found');

  if (parts[1] === 'health') {
    return sendJson(res, 200, { ok: true, rooms: rooms.size, uptime: process.uptime() });
  }

  if (parts[1] === 'meta') {
    return sendJson(res, 200, {
      orgName: ORG_NAME,
      categories: Object.entries(CATEGORIES).map(([id, c]) => ({ id, name: c.name, accent: c.accent }))
    });
  }

  if (parts[1] === 'rooms' && parts.length === 2 && method === 'POST') {
    const room = createRoom();
    return sendJson(res, 201, { code: room.code, hostKey: room.hostKey, state: room.hostState() });
  }

  const code = String(parts[2] || '').trim().toUpperCase();
  const room = getRoom(code);
  if (!room) return sendError(res, 404, 'No game is running under that code. Check the code on the big screen.');

  const action = parts[3];

  try {
    /* ---------------- live state ---------------- */
    if ((!action || action === 'state') && method === 'GET') {
      const viewer = resolveViewer(req, room);
      if (viewer.viewer === 'unknown_room') return sendError(res, 403, viewer.reason);
      const state = viewer.viewer === 'host' ? room.hostState() : room.stateFor(viewer.playerId, viewer.token);
      return sendJson(res, 200, state);
    }

    if (action === 'stream' && method === 'GET') {
      const viewer = resolveViewer(req, room);
      if (viewer.viewer === 'unknown_room') return sendError(res, 403, viewer.reason);
      return openStream(req, res, room, viewer);
    }

    /* ---------------- players ---------------- */
    if (action === 'join' && method === 'POST') {
      const body = await readBody(req);
      const player = mutate(room, () => room.addPlayer(body.name));
      scheduleExpiry(room);
      return sendJson(res, 200, { playerId: player.id, token: player.token, state: room.stateFor(player.id, player.token) });
    }

    if (action === 'leave' && method === 'POST') {
      const body = await readBody(req);
      mutate(room, () => room.leave(body.playerId, body.token));
      return sendJson(res, 200, { ok: true });
    }

    if (action === 'answer' && method === 'POST') {
      const body = await readBody(req);
      const result = mutate(room, () => room.submitAnswer(body.playerId, body.token, body.choice));
      scheduleExpiry(room);
      return sendJson(res, 200, { ok: true, locked: result.locked });
    }

    /* ---------------- host controls ---------------- */
    if (action === 'host' && parts[4] && method === 'POST') {
      const body = await readBody(req);
      const hostKey = body.hostKey || req.headers['x-host-key'];
      room.assertHost(hostKey);
      room.touch();

      switch (parts[4]) {
        case 'settings':
          mutate(room, () => room.setSettings(body));
          return sendJson(res, 200, { ok: true, settings: room.settings, state: room.hostState() });
        case 'start':
          mutate(room, () => room.start());
          scheduleExpiry(room);
          return sendJson(res, 200, { ok: true, state: room.hostState() });
        case 'reveal':
          mutate(room, () => room.expire());
          scheduleExpiry(room);
          return sendJson(res, 200, { ok: true, state: room.hostState() });
        case 'next':
          mutate(room, () => room.next());
          scheduleExpiry(room);
          return sendJson(res, 200, { ok: true, state: room.hostState() });
        case 'reset':
          mutate(room, () => room.resetToLobby());
          scheduleExpiry(room);
          return sendJson(res, 200, { ok: true, state: room.hostState() });
        default:
          return sendError(res, 404, 'Unknown host action.');
      }
    }

    /* ---------------- results export ---------------- */
    if (action === 'results.csv' && method === 'GET') {
      const hostKey = url.searchParams.get('hostKey') || req.headers['x-host-key'];
      room.assertHost(hostKey);
      const rows = [['rank', 'name', 'score', 'correct', 'best_streak']];
      for (const p of room.standings()) rows.push([p.rank, csvCell(p.name), p.score, p.correct, p.bestStreak]);
      const csv = rows.map((r) => r.join(',')).join('\r\n') + '\r\n';
      return send(res, 200, csv, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="quiz-night-${room.code}.csv"`
      });
    }

    return sendError(res, 404, 'Not found');
  } catch (err) {
    if (err instanceof GameError) {
      const status = err.code === 'forbidden' ? 403 : err.code === 'unknown_player' ? 409 : 400;
      return sendError(res, status, err.message);
    }
    console.error('[quiz-night] unexpected error', err);
    return sendError(res, 500, 'Something went wrong on the server. Please try again.');
  }
}

function csvCell(value) {
  const s = String(value ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Work out who is asking: the host, a seated player, or an anonymous viewer. */
function resolveViewer(req, room) {
  const url = new URL(req.url, 'http://internal');
  const hostKey = url.searchParams.get('hostKey') || req.headers['x-host-key'];
  if (hostKey && hostKey === room.hostKey) return { viewer: 'host' };

  const playerId = url.searchParams.get('playerId');
  const token = url.searchParams.get('token');
  if (playerId) {
    const player = room.players.get(playerId);
    if (player && player.token === token) return { viewer: 'player', playerId, token };
    if (hostKey) return { viewer: 'unknown_room', reason: 'Invalid host key.' };
    return { viewer: 'unknown_room', reason: 'Your seat in this game has expired. Please join again.' };
  }

  if (hostKey) return { viewer: 'unknown_room', reason: 'Invalid host key.' };
  return { viewer: 'guest' };
}

/* ------------------------------------------------------------------ */
/* Server                                                              */
/* ------------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendError(res, 405, 'Method not allowed');
  return serveStatic(req, res, url.pathname);
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 70000;

/** Non-internal IPv4 addresses, so the startup banner can show a joinable URL. */
function lanAddresses() {
  const found = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const iface of list || []) {
      if (iface.family === 'IPv4' && !iface.internal) found.push(iface.address);
    }
  }
  return found;
}

if (require.main === module) {
  // A taken port is the most likely way for a first run to fail, and a raw
  // stack trace is no help to whoever is setting this up in the hall.
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error('');
      console.error(`  Port ${PORT} is already in use.`);
      console.error('  Quiz Night may already be running — check for another window or terminal.');
      console.error(`  Otherwise pick a different port:  PORT=4200 node server/index.js`);
      console.error('');
      process.exit(1);
    }
    if (err.code === 'EACCES') {
      console.error('');
      console.error(`  Not allowed to listen on port ${PORT}.`);
      console.error('  Ports below 1024 need administrator rights — try PORT=4173 instead.');
      console.error('');
      process.exit(1);
    }
    throw err;
  });

  server.listen(PORT, HOST, () => {
    const addresses = lanAddresses();
    console.log('');
    console.log('  Quiz Night is running');
    console.log('');
    if (addresses.length === 0) {
      console.log(`  This machine      →  http://localhost:${PORT}`);
      console.log('  No network found — connect to Wi-Fi so players can reach you.');
    } else {
      for (const address of addresses) {
        console.log(`  Players join      →  http://${address}:${PORT}`);
      }
      console.log(`  Host screen       →  http://${addresses[0]}:${PORT}/host`);
    }
    console.log('');
    console.log('  Share that address with the room. Everyone must be on the same Wi-Fi.');
    console.log('  Press Ctrl+C to stop.');
    console.log('');
  });
}

module.exports = { server, rooms, createRoom, getRoom };
