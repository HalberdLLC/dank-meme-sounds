#!/usr/bin/env node
// DankMachine MCP server (stdio). Reads the public catalog from DANKMACHINE_API (default https://dankmachine.com/api/v1).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { playFile } from './play.mjs';

const API = (process.env.DANKMACHINE_API ?? 'https://dankmachine.com/api/v1').replace(/\/$/, '');
const CACHE_DIR = path.join(os.tmpdir(), 'dankmachine-mcp');

/** @type {Promise<any[]> | null} */
let catalog = null;
function sounds() {
  catalog ??= fetch(`${API}/sounds.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`catalog fetch failed: HTTP ${r.status}`);
      return r.json();
    })
    .then((j) => j.sounds)
    .catch((e) => {
      catalog = null;
      throw e;
    });
  return catalog;
}

const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

function search(list, query, category) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  return list
    .filter((s) => !category || s.category === category)
    .map((s) => {
      const title = norm(s.title);
      const hay = `${title} ${norm(s.tags.join(' '))} ${s.category} ${s.vibe}`;
      if (!words.every((w) => hay.includes(w))) return null;
      return { s, score: words.reduce((n, w) => n + (title.startsWith(w) ? 3 : title.includes(w) ? 2 : 0), 0) };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.s.views - a.s.views)
    .map((x) => x.s);
}

const brief = (s) => ({ slug: s.slug, title: s.title, category: s.category, tags: s.tags, vibe: s.vibe, audio: s.audio, image: s.image, page: s.page });
const text = (data) => ({ content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }] });

async function findOne(slugOrQuery) {
  const list = await sounds();
  return list.find((s) => s.slug === slugOrQuery) ?? search(list, slugOrQuery)[0] ?? null;
}

/** Downloads (once) and plays a sound. Shared by the play_sound tool and the `play` CLI used by hooks. */
async function playSound(query) {
  const s = await findOne(query);
  if (!s) return `No sound found for "${query}".`;
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${s.slug}.mp3`);
  if (!fs.existsSync(file)) {
    const r = await fetch(s.audio);
    if (!r.ok) return `Could not download ${s.audio}: HTTP ${r.status}`;
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  }
  const ok = await playFile(file);
  return ok ? `▶ Played "${s.title}" (${s.page})` : `Downloaded "${s.title}" to ${file}, but no audio player was found on this system.`;
}

// CLI mode for hooks and scripts: `npx dank-meme-sounds play "sad violin"`.
if (process.argv[2] === 'play') {
  // Hooks must never fail loudly: report the problem and exit 0.
  console.log(await playSound(process.argv.slice(3).join(' ') || 'vine boom').catch((e) => `dankmachine: ${e.message}`));
  process.exit(0);
}

const server = new McpServer({ name: 'dank-meme-sounds', version: '0.3.1' });

async function apiJson(p) {
  const r = await fetch(`${API}${p}`);
  if (!r.ok) throw new Error(`DankMachine API ${p}: HTTP ${r.status}`);
  return r.json();
}

server.registerTool(
  'find_reaction_sound',
  {
    title: 'Find a reaction sound for a moment',
    description: 'Describe a situation ("my code finally compiled", "awkward silence", "someone got roasted") and get the best-fitting meme sounds, with what each one means and when to use it.',
    inputSchema: {
      situation: z.string().describe('The moment to react to, in plain words'),
      limit: z.number().int().min(1).max(20).optional().describe('Max results (default 5)'),
    },
  },
  async ({ situation, limit = 5 }) => text(await apiJson(`/reaction?situation=${encodeURIComponent(situation)}&limit=${limit}`)),
);

server.registerTool(
  'get_trending_sounds',
  {
    title: 'Trending meme sounds',
    description: 'Sounds people are playing most on DankMachine right now.',
    inputSchema: {
      window: z.enum(['1h', '24h', '7d']).optional().describe('Time window (default 24h)'),
      limit: z.number().int().min(1).max(50).optional().describe('Max results (default 10)'),
    },
  },
  async ({ window = '24h', limit = 10 }) => text(await apiJson(`/trending?window=${window}&limit=${limit}`)),
);

server.registerTool(
  'search_sounds',
  {
    title: 'Search meme sounds',
    description: 'Search DankMachine meme sound buttons by words in the title, tags, category or vibe. Returns audio URLs, pixel-art images and pages.',
    inputSchema: {
      query: z.string().describe('Words to match, e.g. "vine boom", "sad violin", "minecraft"'),
      category: z.string().optional().describe('Optional category slug from list_categories'),
      limit: z.number().int().min(1).max(50).optional().describe('Max results (default 10)'),
    },
  },
  async ({ query, category, limit = 10 }) => text(search(await sounds(), query, category).slice(0, limit).map(brief)),
);

server.registerTool(
  'random_sound',
  {
    title: 'Random meme sound',
    description: 'Pick a random sound, optionally from one category or with one vibe (funny, hype, cursed, wholesome, scary, sad, annoying, epic, chill, dramatic).',
    inputSchema: { category: z.string().optional(), vibe: z.string().optional() },
  },
  async ({ category, vibe }) => {
    const pool = (await sounds()).filter((s) => (!category || s.category === category) && (!vibe || s.vibe === vibe));
    if (!pool.length) return text('No sounds match that filter.');
    return text(brief(pool[Math.floor(Math.random() * pool.length)]));
  },
);

server.registerTool(
  'get_sound',
  {
    title: 'Get one sound',
    description: 'Get a sound by slug (or the best match for a query).',
    inputSchema: { sound: z.string().describe('Slug like "vine-boom-sound-70972", or a search query') },
  },
  async ({ sound }) => {
    const s = await findOne(sound);
    return text(s ? { ...brief(s), views: s.views, lang: s.lang } : `No sound found for "${sound}".`);
  },
);

server.registerTool(
  'list_categories',
  { title: 'List categories', description: 'List DankMachine sound categories with counts.', inputSchema: {} },
  async () => {
    const r = await fetch(`${API}/categories.json`);
    return text((await r.json()).categories);
  },
);

server.registerTool(
  'play_sound',
  {
    title: 'Play a meme sound',
    description: 'Play a sound out loud on the user\'s computer speakers. Use for celebrations, failures or comic timing when the user wants it.',
    inputSchema: { sound: z.string().describe('Slug or search query, e.g. "vine boom", "sad violin", "airhorn"') },
  },
  async ({ sound }) => text(await playSound(sound)),
);

await server.connect(new StdioServerTransport());
