// Popup: trending by default, keyword search as you type, "describe a moment" falls back to the reaction endpoint.
const API = 'https://dankmachine.com/api/v1';
const list = document.getElementById('list');
const hint = document.getElementById('hint');
const q = document.getElementById('q');
let audio = null;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function render(sounds, label) {
  hint.textContent = label;
  list.innerHTML = sounds.length
    ? sounds.map((s) => `<li>
        ${s.image_url ? `<img src="${esc(s.image_url)}" alt="">` : '<img alt="">'}
        <div class="t"><a href="${esc(s.page_url)}" target="_blank" title="${esc(s.title)}">${esc(s.title)}</a><small>${esc(s.about ?? s.category ?? '')}</small></div>
        <button class="play" data-audio="${esc(s.audio_url)}" title="Play">▶</button>
        <button data-copy="${esc(s.page_url)}" title="Copy link">🔗</button>
      </li>`).join('')
    : '<li>Nothing found. Try other words.</li>';
}

async function get(path) {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

async function trending() {
  try { render((await get('/trending?window=24h&limit=12')).sounds ?? [], 'Trending right now'); }
  catch { render([], 'Could not reach DankMachine.'); }
}

let timer = 0;
q.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const text = q.value.trim();
    if (!text) return trending();
    try {
      // Several words read like a situation ("my code finally compiled"): ask the reaction finder.
      const many = text.split(/\s+/).length >= 4;
      const j = many ? await get(`/reaction?situation=${encodeURIComponent(text)}&limit=12`) : await get(`/search?q=${encodeURIComponent(text)}&limit=12`);
      render(j.sounds ?? j.results ?? [], many ? 'Sounds for that moment' : `Results for “${text}”`);
    } catch { render([], 'Could not reach DankMachine.'); }
  }, 200);
});

list.addEventListener('click', async (e) => {
  const play = e.target.closest('[data-audio]');
  if (play) {
    audio?.pause();
    audio = new Audio(play.dataset.audio);
    audio.volume = 0.8;
    audio.play().catch(() => {});
    return;
  }
  const copy = e.target.closest('[data-copy]');
  if (copy) {
    await navigator.clipboard.writeText(copy.dataset.copy);
    copy.textContent = '✓';
  }
});

// Text sent from the context menu (see background.js).
const session = globalThis.chrome?.storage?.session;
(session ? session.get('pending') : Promise.resolve({})).then(({ pending }) => {
  if (pending) {
    q.value = pending;
    session?.remove('pending');
    q.dispatchEvent(new Event('input'));
  } else trending();
});
