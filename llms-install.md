# Installing dank-meme-sounds (for AI agents)

No API key, no build step. Requires Node.js 20+.

## Option A: local server (recommended, adds `play_sound`)

Add this to the MCP settings file:

```json
{
  "mcpServers": {
    "dankmachine": {
      "command": "npx",
      "args": ["-y", "dank-meme-sounds"]
    }
  }
}
```

## Option B: remote server (nothing to install)

```json
{
  "mcpServers": {
    "dank-meme-sounds": { "url": "https://dankmachine.com/mcp" }
  }
}
```

## Verify

Call `search_sounds` with `{"query": "vine boom"}`. You should get a list with `slug`, `title`, `audio` (an MP3 URL) and `page`.
Then try `find_reaction_sound` with `{"situation": "my code finally compiled"}`.

`play_sound` needs a local audio player: built in on macOS (afplay) and Windows (MediaPlayer); on Linux install one of mpg123, ffmpeg (ffplay) or pulseaudio-utils (paplay).
