# dank-meme-sounds

**A meme soundboard for AI agents.** Give Claude, Cursor, Codex, ChatGPT or any MCP client instant access to **38,000+ meme sound effects** from [DankMachine](https://dankmachine.com): vine boom, bruh, sad violin, airhorn, Windows XP error, anime wow, and every reaction sound the internet runs on.

Your agent can **find the right sound for a moment** ("my code finally compiled", "awkward silence", "someone got roasted"), search by name, mood or use case, see what's trending right now, and **play it out loud** on your speakers.

[![npm](https://img.shields.io/npm/v/dank-meme-sounds)](https://www.npmjs.com/package/dank-meme-sounds)
[![MCP](https://img.shields.io/badge/MCP-remote%20%2B%20stdio-ff3db0)](https://dankmachine.com/developers/)
[![Glama](https://glama.ai/mcp/servers/TanKucukhas/dank-meme-sounds/badges/score.svg)](https://glama.ai/mcp/servers/TanKucukhas/dank-meme-sounds)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

- 🔊 38k+ sounds, each with an MP3 URL and a sound page; the most popular ones have their own pixel-art icon
- 🧠 Sounds come with AI-written metadata: what it is, **when to use it**, moods, use cases and alternate names
- 🎯 `find_reaction_sound`: describe the situation, get the fitting sounds
- 📈 Live trending from real plays on dankmachine.com (1h / 24h / 7d)
- ▶️ `play_sound` plays it locally (macOS, Windows, Linux) — great for coding-agent hooks
- 🌐 Zero setup remote server, or a tiny local npm package. No API key.

---

## Quick start

### Claude Code plugin (MCP server + meme-sounds skill, one step)

```
/plugin install dank-meme-sounds --marketplace TanKucukhas/dank-meme-sounds
```

Or add the marketplace first: `/plugin marketplace add TanKucukhas/dank-meme-sounds`, then `/plugin install dank-meme-sounds@dankmachine`. The skill teaches Claude when a sound fits and keeps `play_sound` for when you ask for it.

### Remote server (no install)

```bash
claude mcp add --transport http dank-meme-sounds https://dankmachine.com/mcp
```

Any client that supports Streamable HTTP:

```json
{
  "mcpServers": {
    "dank-meme-sounds": { "url": "https://dankmachine.com/mcp" }
  }
}
```

### Local server (adds `play_sound` on your speakers)

**Claude Code**

```bash
claude mcp add dankmachine -- npx -y dank-meme-sounds
```

**Claude Desktop / Cursor / Windsurf / Cline / Zed** (`mcpServers` config)

```json
{
  "mcpServers": {
    "dankmachine": { "command": "npx", "args": ["-y", "dank-meme-sounds"] }
  }
}
```

**VS Code** (`.vscode/mcp.json`)

```json
{
  "servers": {
    "dankmachine": { "type": "stdio", "command": "npx", "args": ["-y", "dank-meme-sounds"] }
  }
}
```

**OpenAI Codex CLI** (`~/.codex/config.toml`)

```toml
[mcp_servers.dankmachine]
command = "npx"
args = ["-y", "dank-meme-sounds"]
```

Requires Node.js 20+.

---

## Tools

| Tool | What it does | Example |
| --- | --- | --- |
| `find_reaction_sound` | Describe a moment, get the best-fitting sounds with what each means and when to use it | "my build failed again" → sad trombone, bruh, windows error |
| `get_trending_sounds` | What people are playing on DankMachine right now (`1h`, `24h`, `7d`) | "what's trending today?" |
| `search_sounds` | Search by title, tags, category or vibe | "vine boom", "minecraft", "anime" |
| `random_sound` | Random sound, optionally by category or vibe (funny, hype, cursed, wholesome, scary, sad, epic, dramatic…) | "random cursed sound" |
| `get_sound` | One sound by slug or best match | `vine-boom-sound-70972` |
| `list_categories` | All categories with counts (memes, gaming, reactions, anime, brainrot, tiktok…) | |
| `play_sound` | **Local only.** Plays the sound on your speakers (afplay, Windows MediaPlayer, mpg123/ffplay/paplay) | "play an airhorn when tests pass" |

Every result includes the title, category, tags, an `audio` MP3 URL, a pixel-art `image` when available, and the `page` on dankmachine.com.

### Prompts to try

- *"Play vine boom when the tests pass and sad violin when they fail."*
- *"Find me a sound for a dramatic reveal in my video."*
- *"What are the top 5 trending meme sounds today?"*
- *"Give me three hype sounds for my stream intro, with links."*
- *"Pick a random cursed sound and play it."*

---

## Sound effects for your coding agent (Claude Code hooks)

`npx dank-meme-sounds play "<query>"` plays a sound from the terminal, so hooks can use it. Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [{ "hooks": [{ "type": "command", "command": "npx -y dank-meme-sounds play \"vine boom\"" }] }],
    "Notification": [{ "hooks": [{ "type": "command", "command": "npx -y dank-meme-sounds play \"discord notification\"" }] }],
    "SessionStart": [{ "hooks": [{ "type": "command", "command": "npx -y dank-meme-sounds play \"windows xp startup\"" }] }]
  }
}
```

Sounds are cached in your temp folder after the first play, and the CLI never fails a hook (it exits 0 when offline).

---

## REST API

The same catalog is a free JSON API with CORS, no key:

```
GET https://dankmachine.com/api/v1/search?q=vine%20boom&limit=5
GET https://dankmachine.com/api/v1/reaction?situation=my%20code%20compiled
GET https://dankmachine.com/api/v1/trending?window=24h
GET https://dankmachine.com/api/v1/sounds/<slug>
GET https://dankmachine.com/api/v1/sounds.json     (full catalog)
GET https://dankmachine.com/api/v1/categories.json
```

Docs: https://dankmachine.com/developers/

## Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `DANKMACHINE_API` | `https://dankmachine.com/api/v1` | Point the local server at another catalog |

## More from DankMachine

- **Live sound chat**: https://dankmachine.com/rooms/ — IRC-style chat where every sound plays for everyone
- **OBS overlay** for streamers: https://dankmachine.com/obs/?r=lobby
- **Upload your own sounds**: https://dankmachine.com/upload/

## Content and rights

Sounds are user-contributed meme clips; `rights_status` is `unverified`. Removal requests: https://dankmachine.com/takedown/

## License

MIT for this server's code. Sounds belong to their respective owners.
