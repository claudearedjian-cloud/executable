'use strict';

/** Drives the Room state machine through a whole game. */

const test = require('node:test');
const assert = require('node:assert/strict');

const { Room, PHASE, GameError, pointsFor } = require('../server/game');

/** A room with a controllable clock so timing can be asserted exactly. */
function makeRoom(overrides = {}) {
  let now = 1_000_000;
  const room = new Room('TEST', {
    clock: () => now,
    settings: { categories: ['geography'], perCategory: 3, seconds: 20, shuffle: false },
    ...overrides
  });
  return { room, advance: (ms) => (now += ms), now: () => now };
}

test('players can join and are numbered in order', () => {
  const { room } = makeRoom();
  const a = room.addPlayer('Alice');
  const b = room.addPlayer('Bob');

  assert.equal(room.players.size, 2);
  assert.equal(a.seat, 1);
  assert.equal(b.seat, 2);
  assert.equal(room.publicState().playerCount, 2);
});

test('joining with the same name reuses the seat rather than duplicating', () => {
  const { room } = makeRoom();
  const first = room.addPlayer('Alice');
  const again = room.addPlayer('  alice  ');
  assert.equal(first.id, again.id);
  assert.equal(room.players.size, 1);
});

test('blank names and empty rooms are rejected', () => {
  const { room } = makeRoom();
  assert.throws(() => room.addPlayer('   '), GameError);
  assert.throws(() => room.start(), (err) => err.code === 'no_players');
});

test('starting a game builds the queue from the selected rounds', () => {
  const { room } = makeRoom({
    settings: { categories: ['geography', 'history'], perCategory: 5, seconds: 20, shuffle: false }
  });
  room.addPlayer('Alice');
  room.start();

  assert.equal(room.phase, PHASE.QUESTION);
  assert.equal(room.queue.length, 10);
  assert.equal(room.queue[0].category, 'geography');
  assert.equal(room.queue[9].category, 'history');
  assert.ok(room.deadline > 0);
});

test('a full game runs every question and finishes', () => {
  const { room } = makeRoom({
    settings: { categories: ['geography', 'history', 'general'], perCategory: 25, seconds: 20, shuffle: false }
  });
  room.addPlayer('Alice');
  room.start();
  assert.equal(room.queue.length, 75);

  let seen = 0;
  while (room.phase === PHASE.QUESTION) {
    room.expire();
    seen += 1;
    room.next();
  }

  assert.equal(seen, 75, 'all 75 questions should have been played');
  assert.equal(room.phase, PHASE.FINISHED);
  assert.equal(room.publicState().finished.total, 75);
});

test('correct answers score more the faster they are given', () => {
  const { room, advance } = makeRoom();
  const alice = room.addPlayer('Alice');
  const bob = room.addPlayer('Bob');
  room.start();

  const correct = room.currentQuestion().answer;

  advance(2000);
  room.submitAnswer(alice.id, alice.token, correct);
  advance(10000);
  room.submitAnswer(bob.id, bob.token, correct);

  // Bob's answer completes the field, which auto-reveals.
  assert.equal(room.phase, PHASE.REVEAL);

  const aliceScore = room.players.get(alice.id).score;
  const bobScore = room.players.get(bob.id).score;
  assert.ok(aliceScore > bobScore, `Alice (${aliceScore}) should outscore Bob (${bobScore})`);
  assert.ok(aliceScore <= 1000);
});

test('wrong answers score nothing and break a streak', () => {
  const { room, advance } = makeRoom();
  const alice = room.addPlayer('Alice');
  room.start();

  const correct = room.currentQuestion().answer;
  const wrong = (correct + 1) % 4;

  advance(1000);
  room.submitAnswer(alice.id, alice.token, wrong);
  room.expire();

  assert.equal(room.players.get(alice.id).score, 0);
  assert.equal(room.players.get(alice.id).streak, 0);
  assert.equal(room.lastReveal.correctCount, 0);
  assert.equal(room.lastReveal.counts[wrong], 1);
});

test('the reveal counts votes per option and exposes the correct index', () => {
  const { room, advance } = makeRoom();
  const players = [room.addPlayer('A'), room.addPlayer('B'), room.addPlayer('C'), room.addPlayer('D')];
  room.start();

  const correct = room.currentQuestion().answer;
  advance(1000);
  players.forEach((p, i) => room.submitAnswer(p.id, p.token, (correct + i) % 4));

  assert.equal(room.phase, PHASE.REVEAL, 'the last answer should auto-reveal');
  const counts = room.lastReveal.counts;
  assert.equal(counts.reduce((a, b) => a + b, 0), 4);
  assert.equal(counts[correct], 1);
  assert.equal(room.lastReveal.correctIndex, correct);
});

test('an answer cannot be changed once locked in', () => {
  const { room, advance } = makeRoom();
  const alice = room.addPlayer('Alice');
  const bob = room.addPlayer('Bob');
  room.start();
  advance(500);

  room.submitAnswer(alice.id, alice.token, 0);
  const second = room.submitAnswer(alice.id, alice.token, 3);

  assert.equal(second.changed, false);
  assert.equal(room.answers.get(alice.id).choice, 0);

  // A different player can still answer.
  const bobAnswer = room.submitAnswer(bob.id, bob.token, 1);
  assert.equal(bobAnswer.changed, true);
});

test('answers are refused outside the question phase and for unknown players', () => {
  const { room } = makeRoom();
  const alice = room.addPlayer('Alice');
  assert.throws(() => room.submitAnswer(alice.id, alice.token, 0), (err) => err.code === 'closed');

  room.start();
  assert.throws(() => room.submitAnswer('nope', 'nope', 0), (err) => err.code === 'unknown_player');
  assert.throws(() => room.submitAnswer(alice.id, 'wrong-token', 0), (err) => err.code === 'unknown_player');
  assert.throws(() => room.submitAnswer(alice.id, alice.token, 9), (err) => err.code === 'invalid_answer');
  assert.throws(() => room.submitAnswer(alice.id, alice.token, -1), (err) => err.code === 'invalid_answer');
});

test('the host key gates host-only actions', () => {
  const { room } = makeRoom();
  assert.doesNotThrow(() => room.assertHost(room.hostKey));
  assert.throws(() => room.assertHost('wrong'), (err) => err.code === 'forbidden');
  assert.throws(() => room.assertHost(undefined), (err) => err.code === 'forbidden');
});

test('a player who leaves is dropped from the standings and the answer count', () => {
  const { room, advance } = makeRoom();
  const alice = room.addPlayer('Alice');
  const bob = room.addPlayer('Bob');
  room.start();
  advance(1000);
  room.submitAnswer(alice.id, alice.token, 0);

  room.leave(bob.id, bob.token);

  const state = room.publicState();
  assert.equal(state.playerCount, 1);
  assert.deepEqual(state.players.map((p) => p.name), ['Alice']);

  // Alice's single answer is now the whole field, so it reveals immediately.
  assert.equal(room.phase, PHASE.REVEAL);
});

test('leaving releases the seat so the name can be reused', () => {
  const { room } = makeRoom();
  const alice = room.addPlayer('Alice');
  room.leave(alice.id, alice.token);
  const again = room.addPlayer('Alice');
  assert.equal(again.id, alice.id);
  assert.equal(room.publicState().playerCount, 1);
});

test('scores are tie-broken on total answering time', () => {
  const { room, advance } = makeRoom({
    settings: { categories: ['geography'], perCategory: 2, seconds: 20, shuffle: false }
  });
  const slow = room.addPlayer('Slow');
  const fast = room.addPlayer('Fast');
  room.start();

  const correct = room.currentQuestion().answer;
  advance(9000);
  room.submitAnswer(fast.id, fast.token, correct);
  advance(1000);
  room.submitAnswer(slow.id, slow.token, correct);

  const order = room.standings().map((p) => p.name);
  assert.deepEqual(order, ['Fast', 'Slow'], 'the quicker player should rank first on a points tie');
});

test('settings are clamped to sane ranges and reject nonsense', () => {
  const { room } = makeRoom();
  room.addPlayer('Alice');

  assert.equal(room.setSettings({ seconds: 1000 }).seconds, 90);
  assert.equal(room.setSettings({ seconds: 1 }).seconds, 5);
  assert.equal(room.setSettings({ perCategory: 99 }).perCategory, 25);
  assert.equal(room.setSettings({ perCategory: 0 }).perCategory, 1);

  const picked = room.setSettings({ categories: ['history', 'history', 'nonsense'] });
  assert.deepEqual(picked.categories, ['history']);

  assert.throws(() => room.setSettings({ categories: [] }), GameError);
  assert.throws(() => room.setSettings({ categories: ['nope'] }), GameError);
});

test('reset returns to the lobby with scores cleared but players kept', () => {
  const { room, advance } = makeRoom();
  const alice = room.addPlayer('Alice');
  room.start();
  advance(500);
  room.submitAnswer(alice.id, alice.token, room.currentQuestion().answer);
  assert.ok(alice.score > 0);

  // Play the remaining questions out to the end.
  let guard = 0;
  while (room.phase !== PHASE.FINISHED && guard < 10) {
    if (room.phase === PHASE.QUESTION) room.expire();
    room.next();
    guard += 1;
  }
  assert.equal(room.phase, PHASE.FINISHED);

  room.resetToLobby();
  assert.equal(room.phase, PHASE.LOBBY);
  assert.equal(room.players.get(alice.id).score, 0);
  assert.equal(room.players.get(alice.id).correct, 0);
  assert.equal(room.publicState().playerCount, 1);
});

test('the public state never leaks the answer while a question is live', () => {
  const { room } = makeRoom();
  room.addPlayer('Alice');
  room.start();

  const state = room.publicState();
  assert.equal(state.phase, PHASE.QUESTION);
  assert.ok(state.question);
  assert.equal(state.question.options.length, 4);
  assert.equal('answer' in state.question, false, 'the correct index must not be broadcast mid-question');
  assert.equal(state.reveal, null);
  assert.equal(JSON.stringify(state).includes('"fact"'), false, 'no fun fact before the reveal');
});

test('the host state adds per-player answers, and only on the reveal', () => {
  const { room, advance } = makeRoom();
  const alice = room.addPlayer('Alice');
  const bob = room.addPlayer('Bob');
  room.start();
  advance(1000);
  room.submitAnswer(alice.id, alice.token, room.currentQuestion().answer);
  room.submitAnswer(bob.id, bob.token, 0);

  assert.equal(room.phase, PHASE.REVEAL);
  const host = room.hostState();
  assert.equal(host.host, true);
  assert.equal(host.hostAnswers.length, 2);
  assert.ok(host.hostAnswers.every((a) => typeof a.correct === 'boolean'));
});

test('stateFor tells a player their own answer without telling anyone else', () => {
  const { room, advance } = makeRoom();
  const alice = room.addPlayer('Alice');
  room.start();
  advance(1000);
  room.submitAnswer(alice.id, alice.token, 2);

  const mine = room.stateFor(alice.id, alice.token);
  assert.equal(mine.me.choice, 2);
  assert.equal(mine.me.name, 'Alice');

  const guest = room.stateFor('someone-else', 'nope');
  assert.equal(guest.me, undefined);
});

test('every revision increments so clients can order updates', () => {
  const { room } = makeRoom();
  const before = room.rev;
  room.addPlayer('Alice');
  const afterJoin = room.rev;
  room.start();
  assert.ok(afterJoin > before);
  assert.ok(room.rev > afterJoin);
});

test('pointsFor stays inside its range', () => {
  assert.equal(pointsFor(0, 20000), 1000);
  assert.equal(pointsFor(10000, 20000), 500);
  assert.equal(pointsFor(20000, 20000), 100, 'the floor applies at the deadline');
  assert.equal(pointsFor(-5, 20000), 1000, 'negative elapsed time is clamped');
  assert.equal(pointsFor(NaN, 20000), 100);
});
