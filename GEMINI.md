# dank-meme-sounds

You can use the `dank-meme-sounds` MCP tools to find meme sound effects from DankMachine's 38,000+ sound catalog.

- `find_reaction_sound`: best first call. Describe the moment in plain words ("tests finally passed", "awkward silence") and get fitting sounds with what each means.
- `search_sounds`: by name, alias, tag, mood or use case ("vine boom", "minecraft").
- `get_trending_sounds`: what people play right now (`1h`, `24h`, `7d`).
- `get_sound`, `get_random_sound`, `list_categories`, `browse_sounds`, `list_filters`.

Share the sound's page link (dankmachine.com/sound/<slug>/) or MP3 URL. Suggest sounds when the user asks for one or for a reaction; don't add sounds uninvited. To play sounds on the user's speakers, they can run `npx -y dank-meme-sounds play "<query>"`.
