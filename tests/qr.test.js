'use strict';

/**
 * Validation for the in-app QR encoder.
 *
 * The strongest check is a round trip: encode a URL, rasterise it, then hand
 * the image to an independent decoder (jsQR) and read the text back. Anything
 * wrong in the Reed–Solomon maths, the block interleaving or the module
 * placement shows up as an undecodable image.
 *
 * `jsqr` and `qrcode` are dev dependencies only — the shipped app has none.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const jsQR = require('jsqr');
const QRCode = require('qrcode');

// public/js/qr.js is a browser script; run it against a stub window.
const source = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'qr.js'), 'utf8');
const sandbox = { window: {}, TextEncoder, console };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const QR = sandbox.window.QR;

const SCALE = 4;
const QUIET = 4; // modules of white border the spec asks for

/** Renders a matrix into the RGBA buffer a decoder expects. */
function rasterise(encoded) {
  const { modules, size } = encoded;
  const dim = (size + QUIET * 2) * SCALE;
  const data = new Uint8ClampedArray(dim * dim * 4).fill(255);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!modules[y][x]) continue;
      for (let sy = 0; sy < SCALE; sy += 1) {
        for (let sx = 0; sx < SCALE; sx += 1) {
          const px = ((y + QUIET) * SCALE + sy) * dim + ((x + QUIET) * SCALE + sx);
          data[px * 4] = 0;
          data[px * 4 + 1] = 0;
          data[px * 4 + 2] = 0;
          data[px * 4 + 3] = 255;
        }
      }
    }
  }
  return { data, width: dim, height: dim };
}

function decode(text) {
  const encoded = QR.encode(text);
  const image = rasterise(encoded);
  const found = jsQR(image.data, image.width, image.height);
  return { encoded, found };
}

const SAMPLES = [
  'http://localhost:4173/?code=ABCD',
  'https://quiz.example.org/?code=QRTV',
  'https://some-really-long-sandbox-hostname-01a0b357.e2b.app/play?code=MKQP',
  'Hello, world!',
  'a'.repeat(26), // version 2
  'a'.repeat(63), // version 5
  'a'.repeat(107), // version 7 — first version with version-information blocks
  'a'.repeat(153), // version 9
  'a'.repeat(181), // version 10
  'a'.repeat(213), // the largest payload the encoder supports
  'Café résumé 日本語 — UTF-8 payload',
  'https://centre.test/join?code=WXYZ&from=qr&night=friday'
];

test('the encoder exposes the expected surface', () => {
  assert.equal(typeof QR.encode, 'function');
  assert.equal(typeof QR.toSvg, 'function');
  assert.equal(QR.MAX_VERSION, 10);
});

for (const sample of SAMPLES) {
  test(`an independent decoder reads back a ${Buffer.byteLength(sample)}-byte payload`, () => {
    const { encoded, found } = decode(sample);
    assert.ok(found, 'the generated image did not decode at all');
    assert.equal(found.data, sample, 'decoded text differs from the input');
    assert.equal(found.version, encoded.version, 'decoder disagrees on the version');
    assert.deepEqual(
      found.chunks.map((c) => c.type),
      ['byte'],
      'expected a single byte-mode segment'
    );
  });
}

test('picks the smallest version that fits the payload', () => {
  assert.equal(QR.encode('http://x.io/?code=AB').version, 2);
  assert.equal(QR.encode('a'.repeat(62)).version, 4);
  assert.equal(QR.encode('a'.repeat(63)).version, 5);
  assert.equal(QR.encode('a'.repeat(213)).version, 10);
});

test('refuses payloads beyond version 10 capacity', () => {
  assert.throws(() => QR.encode('a'.repeat(214)), /too long/);
});

test('module grid size matches the reference encoder for every sample', () => {
  for (const sample of SAMPLES) {
    const mine = QR.encode(sample);
    const ref = QRCode.create([{ data: sample, mode: 'byte' }], { errorCorrectionLevel: 'M' });
    assert.equal(mine.size, ref.modules.size, `size differs for ${JSON.stringify(sample.slice(0, 24))}`);
  }
});

test('matches the reference encoder bit for bit where both pick the same mask', () => {
  let compared = 0;
  for (const sample of SAMPLES) {
    const mine = QR.encode(sample);
    const ref = QRCode.create([{ data: sample, mode: 'byte' }], { errorCorrectionLevel: 'M' });
    if (mine.mask !== ref.maskPattern) continue;

    compared += 1;
    const flat = [];
    for (let y = 0; y < mine.size; y += 1) for (let x = 0; x < mine.size; x += 1) flat.push(mine.modules[y][x] ? 1 : 0);
    assert.deepEqual(flat, Array.from(ref.modules.data), `pattern differs for ${JSON.stringify(sample.slice(0, 24))}`);
  }
  assert.ok(compared >= 3, `expected several exact matches, only compared ${compared}`);
});

test('renders a well-formed SVG', () => {
  const svg = QR.toSvg(QR.encode('https://quiz.test/?code=ABCD'), { margin: 2, dark: '#000', light: '#fff' });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 \d+ \d+"/);
  assert.ok(svg.includes('<rect'), 'expected at least one module rectangle');
  assert.ok(svg.endsWith('</svg>'));
});
