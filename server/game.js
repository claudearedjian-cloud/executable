'use strict';

/**
 * Game engine for Quiz Night.
 *
 * A Room owns the whole state machine for one trivia night: the lobby, the
 * question queue, the timer deadline, submitted answers and the scoreboard.
 * It deliberately contains no timers and no I/O so it can be driven
 * deterministically from tests — the HTTP layer schedules `expire()` for it.
 */

const crypto = require('node:crypto');
const { BANK, CATEGORIES } = require('./questions');
const branding = require('./branding');

const PHASE = {
  LOBBY: 'lobby',
  QUESTION: 'question',
  REVEAL: 'reveal',
  FINISHED: 'finished'
};

const DEFAULT_SETTINGS = {
  categories: ['geography', 'history', 'general', 'celebrities', 'lebanon'],
  perCategory: 25,
  seconds: 20,
  shuffle: true
};

const MAX_PLAYERS = 60;
const MAX_NAME_LENGTH = 24;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Characters chosen to be unambiguous when shouted across a hall. */
const CODE_ALPHABET = 'ACDEFGHJKLMNPQRTUVWXY3479';

function randomCode(length = 4) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

function randomToken() {
  return crypto.randomBytes(18).toString('base64url');
}

function cleanName(input) {
  return String(input == null ? '' : input)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .trim();
}

/** Fisher-Yates shuffle returning a new array; leaves the input untouched. */
function shuffled(items, rng = Math.random) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function pointsFor(answerMs, durationMs) {
  if (!Number.isFinite(answerMs) || !Number.isFinite(durationMs) || durationMs <= 0) return 100;
  const remaining = Math.max(0, Math.min(1, (durationMs - answerMs) / durationMs));
  return Math.max(100, Math.round(1000 * remaining));
}

class GameError extends Error {
  constructor(message, code = 'invalid') {
    super(message);
    this.name = 'GameError';
    this.code = code;
  }
}

/* ------------------------------------------------------------------ */
/* Room                                                                */
/* ------------------------------------------------------------------ */

class Room {
  constructor(code, options = {}) {
    this.code = code;
    this.hostKey = randomToken();
    this.orgName = options.orgName || 'Community Centre';
    this.clock = options.clock || (() => Date.now());

    this.players = new Map();
    this.joinOrder = 0;

    this.settings = { ...DEFAULT_SETTINGS, ...(options.settings || {}) };
    this.phase = PHASE.LOBBY;
    this.queue = [];
    this.cursor = 0;
    this.questionStartedAt = 0;
    this.deadline = 0;

    this.answers = new Map();
    this.lastReveal = null;

    this.rev = 0;
    this.createdAt = this.clock();
    this.lastActivity = this.createdAt;
  }

  /* ------------------------------ identity ---------------------- */

  assertHost(hostKey) {
    if (!hostKey || hostKey !== this.hostKey) throw new GameError('Not authorised to host this room.', 'forbidden');
  }

  get #activeCount() {
    let n = 0;
    for (const p of this.players.values()) if (!p.left) n += 1;
    return n;
  }

  findPlayer(playerId, token) {
    const player = this.players.get(playerId);
    if (!player || player.token !== token) throw new GameError('Unknown player. Ask the host for the code and join again.', 'unknown_player');
    if (player.left) throw new GameError('This seat was released. Join again with your name.', 'unknown_player');
    return player;
  }

  /* ------------------------------ lobby ------------------------- */

  addPlayer(rawName) {
    this.touch();
    if (this.phase === PHASE.FINISHED) throw new GameError('This game has finished. The host can start a new round.', 'finished');
    const name = cleanName(rawName);
    if (name.length < 1) throw new GameError('Please enter your name to join.', 'invalid_name');

    // Reuse a seat if someone already joined with this exact name.
    for (const existing of this.players.values()) {
      if (existing.name.toLowerCase() === name.toLowerCase()) {
        existing.left = false;
        existing.joinedAt = this.clock();
        this.bump();
        return existing;
      }
    }

    if (this.#activeCount >= MAX_PLAYERS) throw new GameError('This room is full.', 'room_full');

    const player = {
      id: randomToken(),
      token: randomToken(),
      name,
      score: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      correctMs: 0,
      joinedAt: this.clock(),
      seat: (this.joinOrder += 1),
      left: false
    };
    this.players.set(player.id, player);
    this.bump();
    return player;
  }

  leave(playerId, token) {
    this.touch();
    const player = this.findPlayer(playerId, token);
    player.left = true;
    this.answers.delete(player.id);
    this.maybeAutoReveal();
    this.bump();
    return true;
  }

  setSettings(patch) {
    this.touch();
    const next = { ...this.settings };

    if (patch.categories !== undefined) {
      const requested = Array.isArray(patch.categories) ? patch.categories : [];
      const known = requested.filter((c) => Object.prototype.hasOwnProperty.call(BANK, c));
      const unique = [...new Set(known)];
      if (unique.length === 0) throw new GameError('Pick at least one category.', 'invalid_settings');
      next.categories = unique;
    }

    if (patch.perCategory !== undefined) {
      const n = Number(patch.perCategory);
      if (!Number.isFinite(n)) throw new GameError('Invalid question count.', 'invalid_settings');
      next.perCategory = Math.max(1, Math.min(25, Math.floor(n)));
    }

    if (patch.seconds !== undefined) {
      const n = Number(patch.seconds);
      if (!Number.isFinite(n)) throw new GameError('Invalid timer length.', 'invalid_settings');
      next.seconds = Math.max(5, Math.min(90, Math.floor(n)));
    }

    if (patch.shuffle !== undefined) next.shuffle = Boolean(patch.shuffle);

    this.settings = next;
    this.bump();
    return next;
  }

  /* ------------------------------ flow -------------------------- */

  buildQueue() {
    const { categories, perCategory, shuffle } = this.settings;
    const queue = [];
    for (const cat of categories) {
      const pool = BANK[cat] || [];
      const picked = shuffle ? shuffled(pool).slice(0, perCategory) : pool.slice(0, perCategory);
      for (const q of picked) queue.push({ ...q, category: cat, categoryName: CATEGORIES[cat].name });
    }
    return queue;
  }

  start() {
    this.touch();
    if (this.#activeCount < 1) throw new GameError('Wait for at least one player to join.', 'no_players');

    this.queue = this.buildQueue();
    if (this.queue.length === 0) throw new GameError('No questions available.', 'no_questions');

    for (const p of this.players.values()) {
      p.score = 0;
      p.correct = 0;
      p.streak = 0;
      p.bestStreak = 0;
      p.correctMs = 0;
      p.left = false;
    }

    this.cursor = 0;
    this.lastReveal = null;
    this.beginQuestion();
    return this.currentQuestion();
  }

  beginQuestion() {
    this.answers = new Map();
    this.phase = PHASE.QUESTION;
    this.questionStartedAt = this.clock();
    this.deadline = this.questionStartedAt + this.settings.seconds * 1000;
    this.bump();
  }

  currentQuestion() {
    return this.queue[this.cursor] || null;
  }

  durationMs() {
    return this.settings.seconds * 1000;
  }

  /**
   * Once every player still in the game has answered there is nothing left to
   * wait for, so stop making the room sit through the rest of the timer.
   */
  maybeAutoReveal() {
    if (this.phase !== PHASE.QUESTION) return false;
    const active = this.#activeCount;
    if (active === 0 || this.answers.size < active) return false;
    this.reveal();
    return true;
  }

  submitAnswer(playerId, token, choice) {
    this.touch();
    const player = this.findPlayer(playerId, token);
    if (this.phase !== PHASE.QUESTION) throw new GameError('Answers are closed for this question.', 'closed');

    const index = Number(choice);
    if (!Number.isInteger(index) || index < 0 || index > 3) throw new GameError('Pick one of the four answers.', 'invalid_answer');

    if (this.answers.has(player.id)) return { locked: true, changed: false, player };

    const now = this.clock();
    const elapsed = Math.max(0, Math.min(this.durationMs(), now - this.questionStartedAt));
    this.answers.set(player.id, { choice: index, ms: elapsed, name: player.name });
    this.bump();
    this.maybeAutoReveal();

    return { locked: true, changed: true, player };
  }

  /** Called by the scheduler when the deadline passes, or manually to end early. */
  expire() {
    if (this.phase !== PHASE.QUESTION) return false;
    this.touch();
    this.reveal();
    return true;
  }

  reveal() {
    if (this.phase !== PHASE.QUESTION) return;
    this.touch();
    const question = this.currentQuestion();
    const counts = [0, 0, 0, 0];
    const entries = [];

    for (const [playerId, answer] of this.answers) {
      counts[answer.choice] += 1;
      const player = this.players.get(playerId);
      if (!player) continue;
      if (answer.choice === question.answer) {
        const points = pointsFor(answer.ms, this.durationMs());
        player.score += points;
        player.correct += 1;
        player.correctMs += answer.ms;
        player.streak += 1;
        player.bestStreak = Math.max(player.bestStreak, player.streak);
        entries.push({ playerId, name: player.name, points, ms: answer.ms, correct: true });
      } else {
        player.streak = 0;
        entries.push({ playerId, name: player.name, points: 0, ms: answer.ms, correct: false });
      }
    }

    // No answer at all also breaks a streak.
    for (const player of this.players.values()) {
      if (!player.left && !this.answers.has(player.id)) player.streak = 0;
    }

    entries.sort((a, b) => b.points - a.points || a.ms - b.ms);

    this.phase = PHASE.REVEAL;
    this.deadline = 0;
    this.lastReveal = {
      number: this.cursor + 1,
      total: this.queue.length,
      category: question.category,
      categoryName: question.categoryName,
      question: question.question,
      options: question.options,
      avatar: question.avatar || null,
      image: question.image || null,
      correctIndex: question.answer,
      fact: question.fact,
      counts,
      answered: this.answers.size,
      correctCount: entries.filter((e) => e.correct).length,
      fastest: entries.filter((e) => e.correct).slice(0, 5)
    };
    this.bump();
  }

  next() {
    this.touch();
    if (this.phase !== PHASE.REVEAL) throw new GameError('There is no reveal to advance from.', 'invalid_phase');
    this.cursor += 1;
    if (this.cursor >= this.queue.length) {
      this.phase = PHASE.FINISHED;
      this.deadline = 0;
      this.lastReveal = null;
      this.bump();
      return null;
    }
    this.beginQuestion();
    return this.currentQuestion();
  }

  resetToLobby() {
    this.touch();
    for (const p of this.players.values()) {
      p.score = 0;
      p.correct = 0;
      p.streak = 0;
      p.bestStreak = 0;
      p.correctMs = 0;
    }
    this.phase = PHASE.LOBBY;
    this.queue = [];
    this.cursor = 0;
    this.answers = new Map();
    this.lastReveal = null;
    this.deadline = 0;
    this.bump();
    return true;
  }

  /* ------------------------------ projection -------------------- */

  bump() {
    this.rev += 1;
  }

  touch() {
    this.lastActivity = this.clock();
  }

  standings() {
    return [...this.players.values()]
      .filter((p) => !p.left)
      .sort((a, b) => b.score - a.score || a.correctMs - b.correctMs || a.seat - b.seat)
      .map((p, i) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        correct: p.correct,
        streak: p.streak,
        bestStreak: p.bestStreak,
        answered: this.answers.has(p.id),
        rank: i + 1
      }));
  }

  /** State broadcast to every connected client. */
  publicState() {
    const activeCount = this.#activeCount;
    const q = this.currentQuestion();

    const brand = branding.toPublic();
    return {
      rev: this.rev,
      code: this.code,
      orgName: brand.orgName || this.orgName,
      branding: brand,
      phase: this.phase,
      serverTime: this.clock(),
      settings: {
        categories: this.settings.categories,
        categoryNames: this.settings.categories.map((c) => CATEGORIES[c].name),
        perCategory: this.settings.perCategory,
        seconds: this.settings.seconds,
        shuffle: this.settings.shuffle,
        plannedTotal: this.settings.categories.length * Math.min(this.settings.perCategory, (BANK[this.settings.categories[0]] || []).length)
      },
      playerCount: activeCount,
      players: this.standings(),
      question:
        this.phase === PHASE.QUESTION && q
          ? {
              number: this.cursor + 1,
              total: this.queue.length,
              category: q.category,
              categoryName: q.categoryName,
              text: q.question,
              options: q.options,
              avatar: q.avatar || null,
              image: q.image || null,
              answeredCount: this.answers.size,
              deadline: this.deadline,
              durationMs: this.durationMs()
            }
          : null,
      reveal: this.phase === PHASE.REVEAL ? this.lastReveal : null,
      finished: this.phase === PHASE.FINISHED ? { total: this.queue.length, standings: this.standings() } : null
    };
  }

  /** Public state plus whatever this specific player is allowed to see. */
  stateFor(playerId, token) {
    const state = this.publicState();
    if (!playerId) return state;
    const player = this.players.get(playerId);
    if (!player || (token && player.token !== token)) return state;

    const mine = this.answers.get(playerId);
    state.me = {
      id: player.id,
      name: player.name,
      score: player.score,
      rank: this.standings().find((s) => s.id === player.id)?.rank ?? null,
      correct: player.correct,
      streak: player.streak,
      bestStreak: player.bestStreak,
      choice: mine ? mine.choice : null,
      lastPoints: this.phase === PHASE.REVEAL && mine ? (mine.choice === (this.lastReveal?.correctIndex ?? -1) ? pointsFor(mine.ms, this.durationMs()) : 0) : null
    };
    return state;
  }

  /** Extra detail only the host screen receives. */
  hostState() {
    const state = this.publicState();
    state.host = true;
    if (this.phase === PHASE.REVEAL && this.lastReveal) {
      state.hostAnswers = [...this.answers.entries()].map(([playerId, a]) => ({
        playerId,
        name: a.name,
        choice: a.choice,
        ms: a.ms,
        correct: a.choice === this.lastReveal.correctIndex
      }));
    }
    return state;
  }
}

module.exports = { Room, PHASE, DEFAULT_SETTINGS, GameError, randomCode, cleanName, pointsFor, shuffled, MAX_PLAYERS };
