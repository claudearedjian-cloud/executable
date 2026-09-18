# Quiz Night

A self-hosted trivia night app for a community centre. One screen runs the game;
everyone else answers from their own phone. No accounts, no app store, no
build step.

```
node server/index.js
```

Then open **http://localhost:4173** — pick *Run the game* on the laptop that is
plugged into the projector, and *Join a game* on every phone.

Setting this up for the first time? **[INSTALL.md](INSTALL.md)** walks through
it step by step, including firewalls, the on-the-night checklist and
troubleshooting.

---

## How a night runs

1. **Create the game** on the host device. You get a four-letter code and a QR
   code on screen.
2. **Players join** by scanning the QR code or typing the code at the address
   shown. They enter a name and wait — nothing to install.
3. **Pick your rounds** — Geography, History, General Knowledge, Celebrities and
   Lebanon, in any combination — plus how many questions per round and how long
   each one gets.
4. **Start.** The question goes up on the big screen and on every phone at the
   same moment. Players tap one of four answers.
5. **Reveal.** The correct answer lights up, the vote distribution fills in, and
   a short fun fact appears for you to read out. Press `Space` to move on.
6. **Results.** A podium, the full scoreboard, and a CSV download for the
   newsletter.

With around 20 players the room is comfortable up to 60.

## Make it yours

The host screen has a **Branding** tab. From there you can set:

- the **organisation name** shown on every screen,
- a **tagline** (e.g. "Friday quiz, doors 7pm"),
- a **logo** (PNG/JPG up to ~300 KB) that replaces the default mark,
- an **accent colour** for buttons and highlights.

Branding is saved to `data/branding.json`, so it survives a restart and is picked
up by the next game automatically.

## Questions

125 questions, 25 in each round, four options each:

| Round             | Questions | Example                                                        |
| ----------------- | --------- | -------------------------------------------------------------- |
| Geography         | 25        | *What is the capital city of Australia?*                       |
| History           | 25        | *In which year did the Berlin Wall fall?*                      |
| General Knowledge | 25        | *How many hearts does an octopus have?*                        |
| Celebrities       | 25        | *A clue plus a visual tile — "King of Pop", "Queen of Pop"…*    |
| Lebanon           | 25        | *Which site holds the Roman temples of the Beqaa Valley?*      |

Every question carries a one-line `fact` that the host screen shows on the
reveal. Celebrities questions show a visual tile (an emoji by default, or a real
photo if you add an `image` path). They are plain data in
[`server/questions.js`](server/questions.js) — edit that file in any text
editor to swap in your own local questions and nothing else needs to change.

## Scoring

A correct answer is worth **100–1,000 points**, scaled by how quickly it came
in. A wrong answer or no answer scores nothing. Ties are broken on total
answering time, so the leaderboard never ends in a coin toss.

## Running it

Requires Node 18 or newer. There are **no runtime dependencies** — the server is
a single file built on Node's `http` module.

```bash
node server/index.js          # start on port 4173
npm run dev                   # same, reloading on change
npm test                      # run the test suite (needs `npm install` once)
```

The server prints the address players should type, including the machine's
LAN IP:

```
  Quiz Night is running

  Players join      →  http://192.168.1.42:4173
  Host screen       →  http://192.168.1.42:4173/host
```

| Variable    | Default              | What it does                            |
| ----------- | -------------------- | --------------------------------------- |
| `PORT`      | `4173`               | Port to listen on                       |
| `HOST`      | `0.0.0.0`            | Interface to bind                       |
| `ORG_NAME`  | `Community Centre`   | Name shown under the logo on every screen |

```bash
ORG_NAME="St Mary's Hall" PORT=8080 node server/index.js
```

## On the night

- **Everyone must be on the same network.** The easiest setup is the venue
  Wi-Fi with the host laptop on it too. Phones on mobile data will not reach a
  laptop on the local network.
- **The host link is the control room.** Keep the tab that created the game
  open — it holds the host key. Bookmark it if you like.
- **A player who locks their phone can come back.** Their seat is remembered in
  the browser, so reopening the same link drops them straight back in.
- **Space bar** reveals the answer and then advances to the next question, so
  you can run the whole night without touching the mouse.
- **Keep it awake.** Disable sleep on the host laptop, and turn off screen
  dimming on the projector.

## How it works

```
server/
  index.js       HTTP server, static files, SSE stream, JSON API
  game.js        Room state machine: lobby, question, reveal, results
  questions.js   The question bank
  branding.js    Org title / tagline / logo / accent, persisted to data/
public/
  index.html     Launcher — join a game or run one
  host.html      Host control screen
  play.html      Player screen, phone-first
  css/styles.css Design system
  js/
    api.js       Fetch wrapper, live stream client, toasts
    launcher.js  Launcher behaviour
    host.js      Host screen
    play.js      Player screen
    qr.js        QR encoder for the join code
tests/           Question bank, game engine, HTTP server, QR encoder
```

**Live sync.** The server owns the clock and the scores. Clients hold a
Server-Sent Events connection and receive the full room state whenever anything
changes; if a network blocks long-lived responses, the client transparently
falls back to polling. Countdowns animate locally from the server's deadline, so
the timer stays smooth without a round trip every tick.

**Fairness.** Answers are refused once the deadline passes, a locked answer
cannot be changed, and the correct option is not sent to any client until the
host reveals it — it is genuinely not on the wire.

**QR codes.** `public/js/qr.js` is a complete QR encoder (byte mode, error
correction level M, versions 1–10) so the join code renders with no third-party
script and no internet connection at the venue.

## Tests

```bash
npm test
```

57 tests covering:

- the question bank — 125 questions, 25 per round, four distinct options each, a
  valid answer index, no duplicates, answers spread across all four positions;
- the game engine — joining, seating, the full 125-question run, scoring by
  speed, streaks, tie-breaks, lock-in, late answers, permissions, reset;
- the HTTP server — a complete game played over the wire, host-only routes,
  the results CSV, the SSE stream, routing and path traversal;
- the QR encoder — every generated image is rasterised and read back by an
  independent decoder (`jsqr`) and must return the original text.

The two packages in `devDependencies` (`jsqr`, `qrcode`) exist only to check the
QR encoder. The app itself installs nothing.

## Licence

MIT.
