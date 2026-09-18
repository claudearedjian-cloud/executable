# Installing Quiz Night

A step-by-step setup for the laptop that runs the game. Budget about ten minutes,
and do it once on the actual machine you'll use in the hall.

---

## What you need

- The laptop or mini-PC that connects to the projector
- Node.js 18 or newer (the app has no other dependencies)
- The venue Wi-Fi, with the laptop on it

No database, no accounts, no internet connection at the venue.

---

## Step 1 — Install Node.js

1. Go to **https://nodejs.org** and download the **LTS** version.
2. Run the installer. Accept every default — you do not need to change anything.
3. Open a terminal and check it worked:

   **Windows** — press `Win`, type `cmd`, press Enter.
   **macOS** — press `Cmd+Space`, type `Terminal`, press Enter.
   **Linux** — `Ctrl+Alt+T`.

   ```
   node --version
   ```

   You want `v18` or higher. Tested here on `v22`.

## Step 2 — Get the files

> **Important:** the app is not on the repository's default `main` branch yet —
> it lives on the working branch. A bare `git clone` lands you on `main`, which
> contains only the README, and `node server/index.js` will then fail with
> *Cannot find module*. You must check the working branch out, as shown below.

Copy the `executable` folder onto the laptop. Either of these work:

- **From GitHub** (needs `git` installed):

  ```
  git clone https://github.com/claudearedjian-cloud/executable.git quiz-night
  cd quiz-night
  git checkout arena/01a0b357-executable
  ```

  (Once the open pull request is merged, the `git checkout` line goes away and a
  plain clone works.)

- **From a USB stick** — copy the whole folder across, then open a terminal in
  it. On Windows, open the folder in Explorer, click in the address bar, type
  `cmd`, press Enter.

You should see `server`, `public`, `tests` and `package.json` in there.

## Step 3 — Run it

```
node server/index.js
```

That is the whole install. There is **no `npm install` step** — the server uses
only Node's built-in modules.

You'll see:

```
  Quiz Night is running

  Players join      →  http://192.168.1.42:4173
  Host screen       →  http://192.168.1.42:4173/host

  Share that address with the room. Everyone must be on the same Wi-Fi.
  Press Ctrl+C to stop.
```

**Write that first address down or photograph it** — it's what players type in.

Open the **Host screen** link in a browser and press `F11` (Windows/Linux) or
`Ctrl+Cmd+F` (macOS) for full screen.

## Step 4 — Let phones reach the laptop

The first time you run it, your firewall will ask whether Node is allowed to
accept connections. **Say yes**, and tick *Private* networks.

If no prompt appeared, or a phone still can't connect, open the port manually:

**Windows** — run Command Prompt *as administrator*:

```
netsh advfirewall firewall add rule name="Quiz Night" dir=in action=allow protocol=TCP localport=4173
```

**macOS** — System Settings → Network → Firewall → Options → allow incoming
connections for `node`.

**Linux**:

```
sudo ufw allow 4173/tcp
```

## Step 5 — Test it before the night

1. With the laptop running, connect your own phone to the **same Wi-Fi**.
2. Open the *Players join* address in the phone's browser.
3. You should see the join screen. Enter the code and a name — you should appear
   in the roster on the laptop.

If that works, the night will work.

---

## Useful settings

Set these in front of the command:

| Setting    | Default            | Purpose                                     |
| ---------- | ------------------ | ------------------------------------------- |
| `ORG_NAME` | `Community Centre` | Name shown under the logo on every screen    |
| `PORT`     | `4173`             | Port to listen on                            |
| `HOST`     | `0.0.0.0`          | Leave alone — this is what lets phones in    |

**macOS / Linux**

```
ORG_NAME="St Mary's Hall" node server/index.js
```

**Windows (Command Prompt)**

```
set ORG_NAME=St Mary's Hall
node server/index.js
```

**Windows (PowerShell)**

```
$env:ORG_NAME="St Mary's Hall"; node server/index.js
```

---

## On the night — checklist

- [ ] Laptop on the **venue Wi-Fi** (not a phone hotspot, not a cable to a
      different network)
- [ ] Projector connected, laptop set to full screen, **sleep disabled**
- [ ] `node server/index.js` running in a terminal you won't close
- [ ] Host screen open in the browser
- [ ] Address written on a flip chart or slide for players
- [ ] Your own phone has joined successfully as a test

**Keep the terminal open all evening.** Closing it ends the game for everyone.

---

## Troubleshooting

**Phones can't reach the address at all.**
The phone and laptop are on different networks, or the venue Wi-Fi has *client
isolation* turned on — a common setting on guest networks that stops devices
seeing each other. Ask the venue to disable it, or bring a small travel router
and put the laptop and all the phones on that instead.

**`Port 4173 is already in use`.**
Quiz Night is probably already running in another window. If not, use a
different port: `PORT=4200 node server/index.js` — and tell players the new
address, including `:4200`.

**`node: command not found`.**
Node isn't installed, or the terminal was open before you installed it. Close
the terminal and open a new one.

**A player's screen goes blank or says their seat expired.**
Have them reopen the same link. Their seat is remembered in the browser.

**The host link stopped working.**
The host key lives in that browser tab. Keep the tab you created the game with
open — a fresh `/host` link without the key won't work.

**Everything is slow or frozen.**
Check the laptop hasn't gone to sleep and the Wi-Fi hasn't dropped. The app
reconnects by itself once the network comes back.

---

## Optional: run it as a background service

Only worth doing if you want the game running before anyone opens a terminal.

**macOS / Linux** — create `/etc/systemd/system/quiz-night.service`:

```ini
[Unit]
Description=Quiz Night
After=network.target

[Service]
WorkingDirectory=/home/you/quiz-night
ExecStart=/usr/bin/node server/index.js
Environment=PORT=4173
Environment=ORG_NAME=Community Centre
Restart=always
User=you

[Install]
WantedBy=multi-user.target
```

Then:

```
sudo systemctl enable --now quiz-night
sudo systemctl status quiz-night
journalctl -u quiz-night -f        # watch the log
```

**Windows** — use [NSSM](https://nssm.cc) to wrap `node server/index.js` as a
service, or simply add a shortcut to
`node C:\path\to\quiz-night\server\index.js` in `shell:startup`.

## Optional: put it on a server instead

If you'd rather host it somewhere always-on than on a laptop:

```
git clone https://github.com/claudearedjian-cloud/executable.git
cd executable
git checkout arena/01a0b357-executable
PORT=4173 node server/index.js
```

Put it behind a reverse proxy (nginx, Caddy) that terminates HTTPS and forwards
to `127.0.0.1:4173`. **Make sure the proxy supports Server-Sent Events** — with
nginx that means:

```
proxy_buffering off;
proxy_read_timeout 3600s;
```

The app falls back to polling automatically if SSE is blocked, so it still
works, just a little less snappy.

Note that a public server means anyone with the URL can create a room. Rooms
expire after six hours of inactivity and nothing is stored permanently, but if
you're worried, keep the port closed to the venue network only.
