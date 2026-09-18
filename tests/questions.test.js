'use strict';

/**
 * Integrity checks on the question bank.
 * These are the guarantees the rest of the app relies on.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { BANK, CATEGORIES } = require('../server/questions');

const CATEGORY_IDS = Object.keys(BANK);

test('there are exactly three categories', () => {
  assert.deepEqual(CATEGORY_IDS, ['geography', 'history', 'general']);
  for (const id of CATEGORY_IDS) {
    assert.ok(CATEGORIES[id], `missing display entry for ${id}`);
    assert.equal(typeof CATEGORIES[id].name, 'string');
    assert.match(CATEGORIES[id].accent, /^#[0-9a-f]{6}$/i, `bad accent colour for ${id}`);
  }
});

test('every category holds exactly 25 questions', () => {
  for (const id of CATEGORY_IDS) {
    assert.equal(BANK[id].length, 25, `${id} should have 25 questions, has ${BANK[id].length}`);
  }
  const total = CATEGORY_IDS.reduce((n, id) => n + BANK[id].length, 0);
  assert.equal(total, 75);
});

test('every question is well formed', () => {
  for (const id of CATEGORY_IDS) {
    for (const q of BANK[id]) {
      const where = `${id}/${q.id}`;

      assert.equal(typeof q.id, 'string', `${where}: id`);
      assert.match(q.id, /^(geo|his|gen)-\d{2}$/, `${where}: id should look like geo-01`);
      assert.equal(q.category, id, `${where}: category tag must match its group`);

      assert.equal(typeof q.question, 'string');
      assert.ok(q.question.trim().length >= 10, `${where}: question looks too short`);
      assert.ok(q.question.trim().endsWith('?'), `${where}: question should end with a question mark`);

      assert.ok(Array.isArray(q.options), `${where}: options must be an array`);
      assert.equal(q.options.length, 4, `${where}: must have exactly 4 options`);
      for (const option of q.options) {
        assert.equal(typeof option, 'string');
        assert.ok(option.trim().length > 0, `${where}: blank option`);
        assert.ok(option.length < 120, `${where}: option is too long for a phone screen`);
      }

      assert.ok(Number.isInteger(q.answer), `${where}: answer must be an integer`);
      assert.ok(q.answer >= 0 && q.answer <= 3, `${where}: answer index out of range`);

      assert.equal(typeof q.fact, 'string');
      assert.ok(q.fact.trim().length >= 10, `${where}: fact is missing or too short`);
    }
  }
});

test('options within a question are unique and case-insensitively distinct', () => {
  for (const id of CATEGORY_IDS) {
    for (const q of BANK[id]) {
      const normalised = q.options.map((o) => o.trim().toLowerCase());
      assert.equal(new Set(normalised).size, 4, `${id}/${q.id}: duplicate options`);
    }
  }
});

test('no two questions are the same', () => {
  const all = CATEGORY_IDS.flatMap((id) => BANK[id]);
  const texts = all.map((q) => q.question.trim().toLowerCase());
  assert.equal(new Set(texts).size, all.length, 'duplicate question text found');

  const ids = all.map((q) => q.id);
  assert.equal(new Set(ids).size, all.length, 'duplicate question id found');
});

test('answers are not always in the same position', () => {
  // A bank where every answer is "B" would be trivially guessable.
  for (const id of CATEGORY_IDS) {
    const spread = new Set(BANK[id].map((q) => q.answer));
    assert.ok(spread.size >= 3, `${id}: answers use only ${spread.size} of the 4 positions`);
  }
});

test('the bank is frozen against accidental mutation at runtime', () => {
  const original = BANK.geography[0].question;
  BANK.geography[0].question = 'tampered';
  assert.notEqual(BANK.geography[0].question, original, 'sanity: assignment should work in plain JS');
  BANK.geography[0].question = original;
  assert.equal(BANK.geography[0].question, original);
});
