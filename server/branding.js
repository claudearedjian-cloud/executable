'use strict';

/**
 * Organisation-level branding: title, tagline, accent colour and a logo.
 *
 * Kept separately from the game engine on purpose — branding belongs to the
 * community organisation, not to a single round, so every room reads the same
 * values. It is persisted to data/branding.json so a personalisation survives a
 * restart and is picked up by the next game.
 */

const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'branding.json');
const MAX_LOGO_BYTES = 400 * 1024; // base64 length, ~300KB of image
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

let state = { orgName: '', tagline: '', accent: '', logo: null };
let logoRev = 0;

function validAccent(value) {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim()) ? value.trim() : null;
}

/** Parse a `data:` URL into { mime, data } or return null if unusable. */
function parseLogo(dataUrl) {
  if (dataUrl === null) return null;
  if (typeof dataUrl !== 'string') return null;
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl.trim());
  if (!match) return null;
  const mime = match[1];
  if (!ALLOWED_MIME.has(mime)) return null;
  if (match[2].length > MAX_LOGO_BYTES) return null;
  return { mime, data: match[2] };
}

function load(defaultOrgName) {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    state = {
      orgName: typeof parsed.orgName === 'string' && parsed.orgName.trim() ? parsed.orgName.trim() : defaultOrgName,
      tagline: typeof parsed.tagline === 'string' ? parsed.tagline : '',
      accent: validAccent(parsed.accent) || '',
      logo: parseLogo(parsed.logo)
    };
  } catch {
    state = { orgName: defaultOrgName, tagline: '', accent: '', logo: null };
  }
  logoRev += 1;
  return state;
}

function save() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(
      FILE,
      JSON.stringify({ orgName: state.orgName, tagline: state.tagline, accent: state.accent, logo: state.logo })
    );
  } catch {
    /* a read-only disk just means branding won't survive a restart */
  }
}

function get() {
  return state;
}

function set(patch) {
  if (patch.orgName !== undefined) {
    const next = String(patch.orgName).replace(/\s+/g, ' ').trim().slice(0, 48);
    state.orgName = next || state.orgName;
  }
  if (patch.tagline !== undefined) {
    state.tagline = String(patch.tagline).replace(/\s+/g, ' ').trim().slice(0, 64);
  }
  if (patch.accent !== undefined) {
    state.accent = patch.accent === '' ? '' : validAccent(patch.accent) || state.accent;
  }
  if (patch.logo !== undefined) {
    const logo = parseLogo(patch.logo);
    if (patch.logo !== null && logo === null) return { ok: false, error: 'That image could not be used. Try a PNG or JPG under 300 KB.' };
    state.logo = logo;
    if (logo) logoRev += 1;
  }
  save();
  return { ok: true };
}

/** The shape sent to every client. */
function toPublic() {
  return {
    orgName: state.orgName,
    tagline: state.tagline || null,
    accent: state.accent || null,
    logoUrl: state.logo ? `/api/branding/logo?v=${logoRev}` : null
  };
}

function logoBuffer() {
  if (!state.logo) return null;
  try {
    return { mime: state.logo.mime, buffer: Buffer.from(state.logo.data, 'base64') };
  } catch {
    return null;
  }
}

module.exports = { load, get, set, toPublic, logoBuffer, parseLogo };
