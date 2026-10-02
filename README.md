# Dark Web — Level 1: Noise

Henry's House–style short-room platformer. Survive Infowars HQ as a hooded figure: slide under lie-tickers, climb falling platforms, stomp callers, dodge fake supplements, pick a loud or quiet path, then crack the Megaphone boss.

**Play:** https://raw.githack.com/dimageier/dark-web-l1/main/index.html

Parody only — no real likenesses, logos, or quotes. Cartoon lies like "THE FROGS ARE EMAILING."

## Open locally

```bash
cd dark-web-l1
python3 -m http.server 8765
```

Open http://localhost:8765/ — single-file `index.html` (full game, no build).

> Online hosting packs the same game via a tiny loader + gzip chunks (`c0.txt`…`c24.txt`) so the browser reconstructs the full HTML. Local `index.html` is the uncompressed complete game.

## Controls

| Key | Action |
|-----|--------|
| ←→ / A D | Move |
| ↑ / W | Jump (coyote + buffer) |
| Shift or ↓ / S | Slide under tickers |
| Space | Mute (3 charges; Facts refill) |
| Enter / Click | Start / play again |

## Rooms

1. **Lobby Crawl** — slide under orange tickers, Mute tutorial, grab Fact Cards, EXIT
2. **BREAKING Stack** — vertical climb; every ~4s BREAKING flash; green-outline plats stay, red ones fall; hot-mic pit below
3. **Call-in Pit** — floating CALLER bubbles; stomp from above or Mute; avoid stun
4. **Supplement Gauntlet** — conveyor belts; real Facts pulse cream; orange fakes chase once touched (Mute drops them)
5. **Studio Approach** — loud upper path (+Alert/sec) vs quiet green vents (Alert frozen); need **5 Facts** to open the door
6. **Boss: Megaphone Jones** — three quiet pads rotate every 8s
   - **Phase 1 Volume Up** — shout-bubble arcs; Mute on a quiet pad banks clips
   - **Phase 2 Contradiction Reel** — after 3 clips, dash through the center reel (stamp) for 1 HP
   - **Phase 3 Panic Broadcast** — overlapping alerts; safe only on quiet pad + Mute; repeat clip→reel until megaphone cracks

## Lose / Win

- **Lose:** Alert meter 100% or fall into a hot-mic pit
- **Win:** Boss HP to 0 → megaphone cracks → win overlay

## HUD

- **ALERT** red meter (top left)
- **MUTE** three green pips
- **FACTS** cream count (target 5 for studio door)
- Room name (violet)

## Art direction

Locked 8-color palette: `#0B0B12` `#1E2433` `#F2E6C9` `#E8F0FF` `#FF2E2E` `#FFB020` `#3DDC97` `#7B5CFF`

Chunky pixel silhouettes, CRT scanlines, hooded cream player + cape, paper Fact Cards, green Mute ring, orange shout/caller bubbles, foam megaphone prop (no face).
