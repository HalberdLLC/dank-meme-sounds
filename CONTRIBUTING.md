# Contributing

Thanks for making agents louder. Useful contributions:

- **Hook recipes** for more agents and editors (Cursor, Gemini CLI, Windsurf, Zed…). Add them to the README.
- **Client configs** we are missing, with the exact file path.
- **Bug reports** with your client, OS and what you ran. Use the bug template.
- **Sound requests**: use the sound request template, or upload at https://dankmachine.com/upload/.
- **Better reaction picks**: if `find_reaction_sound` returns something odd for a situation, open an issue with the situation text and what you expected.

## Development

```bash
npm install
node index.mjs                      # stdio MCP server
node index.mjs play "vine boom"     # CLI
DANKMACHINE_API=http://localhost:8787/api/v1 node index.mjs   # point at another catalog
```

Requires Node.js 20+. Keep the package dependency-light and the CLI hook-safe (it must always exit 0).

## Pull requests

One change per PR, describe how you tested it, and keep the README examples copy-pasteable.
