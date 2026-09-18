'use strict';

/**
 * Minimal QR Code encoder — byte mode, error correction level M, versions 1–10.
 *
 * Versions 1–10 at level M hold up to 213 bytes, which comfortably covers any
 * join URL. Keeping this in the app means the host screen works with no
 * network access and no third-party script.
 *
 * Implements ISO/IEC 18004: data encoding, Reed–Solomon error correction over
 * GF(256), block interleaving, function pattern placement, all eight data
 * masks and the four penalty rules used to pick between them.
 */
window.QR = (function () {
  /* --------------------- Galois field arithmetic ------------------- */

  function rsMultiply(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i -= 1) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xff;
  }

  function rsDivisor(degree) {
    const result = new Uint8Array(degree);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i += 1) {
      for (let j = 0; j < degree; j += 1) {
        result[j] = rsMultiply(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = rsMultiply(root, 0x02);
    }
    return result;
  }

  function rsRemainder(data, divisor) {
    const result = new Array(divisor.length).fill(0);
    for (const byte of data) {
      const factor = byte ^ result.shift();
      result.push(0);
      for (let i = 0; i < divisor.length; i += 1) result[i] ^= rsMultiply(divisor[i], factor);
    }
    return result;
  }

  /* ------------------------- capacity tables ----------------------- */

  /* Error-correction level M. Index is the version number. */
  const EC_CODEWORDS_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
  const EC_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
  const MAX_VERSION = 10;

  /* Raw data modules available, before error-correction overhead. */
  function rawCodewords(version) {
    let bits = (16 * version + 128) * version + 64;
    if (version >= 2) {
      const numAlign = Math.floor(version / 7) + 2;
      bits -= (25 * numAlign - 10) * numAlign - 55;
      if (version >= 7) bits -= 36;
    }
    return Math.floor(bits / 8);
  }

  function dataCodewords(version) {
    return rawCodewords(version) - EC_CODEWORDS_PER_BLOCK[version] * EC_BLOCKS[version];
  }

  /* Bytes of payload a given version can carry in byte mode at level M. */
  function byteCapacity(version) {
    const countBits = version < 10 ? 8 : 16;
    return Math.floor((dataCodewords(version) * 8 - 4 - countBits) / 8);
  }

  function alignmentPositions(version) {
    if (version === 1) return [];
    const numAlign = Math.floor(version / 7) + 2;
    const step = Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    const result = [6];
    for (let pos = version * 4 + 10; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  /* ---------------------------- encoding --------------------------- */

  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(String(text)));

    let version = 1;
    while (version <= MAX_VERSION && byteCapacity(version) < bytes.length) version += 1;
    if (version > MAX_VERSION) throw new Error('Text is too long to encode as a QR code.');

    const size = version * 4 + 17;
    const modules = [];
    const isFunction = [];
    for (let i = 0; i < size; i += 1) {
      modules.push(new Array(size).fill(false));
      isFunction.push(new Array(size).fill(false));
    }

    const setFn = (x, y, dark) => {
      modules[y][x] = dark;
      isFunction[y][x] = true;
    };

    /* --- bit buffer --- */
    const bits = [];
    const appendBits = (value, length) => {
      for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
    };

    appendBits(0b0100, 4); // byte mode
    appendBits(bytes.length, version < 10 ? 8 : 16);
    for (const b of bytes) appendBits(b, 8);

    const capacityBits = dataCodewords(version) * 8;
    appendBits(0, Math.min(4, capacityBits - bits.length)); // terminator
    appendBits(0, (8 - (bits.length % 8)) % 8); // byte align

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j];
      codewords.push(byte);
    }
    for (let pad = 0xec; codewords.length < capacityBits / 8; pad ^= 0xec ^ 0x11) codewords.push(pad);

    /* --- error correction blocks and interleaving --- */
    const numBlocks = EC_BLOCKS[version];
    const ecLen = EC_CODEWORDS_PER_BLOCK[version];
    const rawTotal = rawCodewords(version);
    const numShort = numBlocks - (rawTotal % numBlocks);
    const shortLen = Math.floor(rawTotal / numBlocks);

    const blocks = [];
    const divisor = rsDivisor(ecLen);
    let cursor = 0;
    for (let i = 0; i < numBlocks; i += 1) {
      const dataLen = shortLen - ecLen + (i < numShort ? 0 : 1);
      const data = codewords.slice(cursor, cursor + dataLen);
      cursor += dataLen;
      const ecc = rsRemainder(data, divisor);
      const block = data.concat(ecc);
      if (i < numShort) block.splice(dataLen, 0, 0);
      blocks.push(block);
    }

    const interleaved = [];
    for (let i = 0; i < blocks[0].length; i += 1) {
      for (let j = 0; j < blocks.length; j += 1) {
        if (i !== shortLen - ecLen || j >= numShort) interleaved.push(blocks[j][i]);
      }
    }

    /* --- function patterns --- */
    for (let i = 0; i < size; i += 1) {
      setFn(6, i, i % 2 === 0);
      setFn(i, 6, i % 2 === 0);
    }

    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy += 1) {
        for (let dx = -4; dx <= 4; dx += 1) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) setFn(x, y, dist !== 2 && dist !== 4);
        }
      }
    };
    finder(3, 3);
    finder(size - 4, 3);
    finder(3, size - 4);

    const align = alignmentPositions(version);
    for (const ay of align) {
      for (const ax of align) {
        const overlapsFinder = (ax === 6 && ay === 6) || (ax === 6 && ay === align[align.length - 1]) || (ax === align[align.length - 1] && ay === 6);
        if (overlapsFinder) continue;
        for (let dy = -2; dy <= 2; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) setFn(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }

    /* Version information (versions 7 and up). */
    if (version >= 7) {
      let rem = version;
      for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      const versionBits = (version << 12) | rem;
      for (let i = 0; i < 18; i += 1) {
        const bit = ((versionBits >>> i) & 1) === 1;
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFn(a, b, bit);
        setFn(b, a, bit);
      }
    }

    /* Format information. Level M is encoded as 00. */
    const drawFormat = (mask) => {
      const data = (0b00 << 3) | mask;
      let rem = data;
      for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      const formatBits = ((data << 10) | rem) ^ 0x5412;
      const bit = (i) => ((formatBits >>> i) & 1) === 1;

      for (let i = 0; i <= 5; i += 1) setFn(8, i, bit(i));
      setFn(8, 7, bit(6));
      setFn(8, 8, bit(7));
      setFn(7, 8, bit(8));
      for (let i = 9; i < 15; i += 1) setFn(14 - i, 8, bit(i));

      for (let i = 0; i < 8; i += 1) setFn(size - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i += 1) setFn(8, size - 15 + i, bit(i));
      setFn(8, size - 8, true); // the always-dark module
    };
    drawFormat(0);

    /* --- payload placement --- */
    let bitIndex = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert += 1) {
        for (let j = 0; j < 2; j += 1) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!isFunction[y][x] && bitIndex < interleaved.length * 8) {
            modules[y][x] = ((interleaved[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) === 1;
            bitIndex += 1;
          }
        }
      }
    }

    /* --- masking --- */
    const maskFns = [
      (x, y) => (x + y) % 2 === 0,
      (x, y) => y % 2 === 0,
      (x, y) => x % 3 === 0,
      (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
      (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
      (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
      (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
    ];

    const applyMask = (fn) => {
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          if (!isFunction[y][x] && fn(x, y)) modules[y][x] = !modules[y][x];
        }
      }
    };

    /**
     * ISO/IEC 18004 mask evaluation, rules N1–N4.
     * The mask scoring only decides which of the eight masks reads best, so it
     * never changes what the code says — but it does change how reliably a
     * camera picks it up.
     */
    const penalty = () => {
      let score = 0;

      // N1 (runs of 5+ same-colour modules) and N3 (finder-like 1:1:3:1:1:4
      // patterns) in a single pass over each row and each column.
      const scanLine = (get) => {
        for (let a = 0; a < size; a += 1) {
          let last = null;
          let run = 0;
          let window = 0;

          for (let b = 0; b < size; b += 1) {
            const dark = get(a, b);

            if (dark === last) {
              run += 1;
            } else {
              if (run >= 5) score += 3 + (run - 5);
              last = dark;
              run = 1;
            }

            window = ((window << 1) & 0x7ff) | (dark ? 1 : 0);
            // 10111010000 or 00001011101
            if (b >= 10 && (window === 0x5d0 || window === 0x05d)) score += 40;
          }
          if (run >= 5) score += 3 + (run - 5);
        }
      };

      scanLine((y, x) => modules[y][x]); // rows
      scanLine((x, y) => modules[y][x]); // columns

      // N2: 2x2 blocks of one colour.
      for (let y = 0; y < size - 1; y += 1) {
        for (let x = 0; x < size - 1; x += 1) {
          const colour = modules[y][x];
          if (colour === modules[y][x + 1] && colour === modules[y + 1][x] && colour === modules[y + 1][x + 1]) score += 3;
        }
      }

      // N4: how far the dark-module proportion sits from 50%.
      let dark = 0;
      for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) if (modules[y][x]) dark += 1;
      const total = size * size;
      const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      score += k * 10;

      return score;
    };

    let bestMask = 0;
    let bestScore = Infinity;
    for (let mask = 0; mask < 8; mask += 1) {
      applyMask(maskFns[mask]);
      drawFormat(mask);
      const score = penalty();
      if (score < bestScore) {
        bestScore = score;
        bestMask = mask;
      }
      applyMask(maskFns[mask]); // undo
    }
    applyMask(maskFns[bestMask]);
    drawFormat(bestMask);

    return { modules, size, version, mask: bestMask };
  }

  /** Renders the matrix as a compact SVG string. */
  function toSvg(matrix, options = {}) {
    const { size } = matrix;
    const margin = options.margin === undefined ? 0 : options.margin;
    const dark = options.dark || '#000000';
    const light = options.light || '#ffffff';
    const dim = size + margin * 2;

    // Merge horizontal runs into single rectangles to keep the file small.
    const rects = [];
    for (let y = 0; y < size; y += 1) {
      let x = 0;
      while (x < size) {
        if (!matrix.modules[y][x]) {
          x += 1;
          continue;
        }
        const start = x;
        while (x < size && matrix.modules[y][x]) x += 1;
        rects.push(`<rect x="${start + margin}" y="${y + margin}" width="${x - start}" height="1"/>`);
      }
    }

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges" role="img">` +
      `<rect width="${dim}" height="${dim}" fill="${light}"/>` +
      `<g fill="${dark}">${rects.join('')}</g>` +
      `</svg>`
    );
  }

  return { encode, toSvg, byteCapacity, dataCodewords, MAX_VERSION };
})();
