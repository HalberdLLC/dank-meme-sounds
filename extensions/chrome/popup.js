// DankMachine toolbar soundboard: trending sounds, instant search through the public API (four or more words are read
// as a moment, "my code finally compiled", and go to the reaction finder), saved sounds in chrome.storage.sync. Plays in the popup; Shift+click copies the sound page link (with ?ref=extension).
const API = 'https://dankmachine.com/api/v1';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const audio = new Audio();
let rows = [];
let tab = 'trending';
let saved = [];

const pageUrl = (s) => `https://dankmachine.com/sound/${s.slug}/?ref=extension`;
const audioUrl = (s) => s.audio_url ?? `https://dankmachine.com/media/audio/${s.slug}.mp3`;
const imageUrl = (s) => s.image_url ?? null;

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function render(list, empty) {
  rows = list;
  $('status').textContent = list.length ? '' : empty;
  $('list').innerHTML = list.map((s, i) => {
    const img = imageUrl(s);
    const on = saved.some((x) => x.slug === s.slug);
    return `<li><button type="button" class="tile" data-i="${i}" title="${esc(s.title)}">
      ${i < 9 ? `<span class="n">${i + 1}</span>` : ''}
      ${img ? `<img src="${esc(img)}" alt="" />` : `<span class="face">${esc(s.title.slice(0, 1).toUpperCase())}</span>`}
      <span class="t">${esc(s.title)}</span></button>
      <button type="button" class="save" data-save="${i}" aria-pressed="${on}" aria-label="${on ? 'Remove from saved' : 'Save'} ${esc(s.title)}">${on ? '♥︎' : '♡︎'}</button></li>`;
  }).join('');
}

async function show() {
  const q = $('q').value.trim();
  try {
    if (q) {
      $('status').textContent = 'Searching...';
      const moment = q.split(/\s+/).length >= 4;
      const j = await getJSON(moment ? `${API}/reaction?situation=${encodeURIComponent(q)}&limit=30` : `${API}/search?q=${encodeURIComponent(q)}&limit=30`);
      return render(j.sounds ?? j.results ?? [], moment ? 'No sound fits that moment. Try other words.' : `Nothing for "${q}". Try fewer words.`);
    }
    if (tab === 'saved') return render(saved, 'Nothing saved yet. Tap the heart on any sound.');
    $('status').textContent = 'Loading...';
    const j = await getJSON(`${API}/trending?limit=30`);
    render(j.sounds ?? [], 'Nothing trending. The internet is asleep.');
  } catch {
    $('status').textContent = 'DankMachine is unreachable right now.';
  }
}

function play(i) {
  const s = rows[i];
  if (!s) return;
  document.querySelectorAll('.tile.playing').forEach((t) => t.classList.remove('playing'));
  const tile = document.querySelector(`.tile[data-i="${i}"]`);
  if (audio.src === audioUrl(s) && !audio.paused) {
    audio.pause();
    return;
  }
  audio.src = audioUrl(s);
  audio.currentTime = 0;
  void audio.play().then(() => tile?.classList.add('playing')).catch(() => ($('status').textContent = 'Could not play that one.'));
}
audio.addEventListener('ended', () => document.querySelectorAll('.tile.playing').forEach((t) => t.classList.remove('playing')));

$('list').addEventListener('click', async (e) => {
  const sv = e.target.closest('[data-save]');
  if (sv) {
    const s = rows[Number(sv.dataset.save)];
    saved = saved.some((x) => x.slug === s.slug) ? saved.filter((x) => x.slug !== s.slug) : [{ slug: s.slug, title: s.title, audio_url: audioUrl(s), image_url: imageUrl(s) }, ...saved].slice(0, 60);
    await chrome.storage.sync.set({ saved });
    return render(tab === 'saved' && !$('q').value.trim() ? saved : rows, '');
  }
  const t = e.target.closest('.tile');
  if (!t) return;
  const s = rows[Number(t.dataset.i)];
  if (e.shiftKey) {
    await navigator.clipboard.writeText(pageUrl(s));
    $('status').textContent = `Copied the link to ${s.title}.`;
    return;
  }
  play(Number(t.dataset.i));
});

$('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]');
  if (!b) return;
  tab = b.dataset.tab;
  document.querySelectorAll('#tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  $('q').value = '';
  void show();
});

let timer = 0;
$('q').addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(show, 180);
});

document.addEventListener('keydown', (e) => {
  if (e.target === $('q') && $('q').value) return;
  if (/^[1-9]$/.test(e.key)) {
    e.preventDefault();
    play(Number(e.key) - 1);
  }
});

// Text sent from the right-click menu (background.js) is searched right away.
Promise.all([chrome.storage.sync.get({ saved: [] }), chrome.storage.session.get('pending')]).then(([v, s]) => {
  saved = v.saved ?? [];
  if (s.pending) {
    $('q').value = s.pending;
    void chrome.storage.session.remove('pending');
  }
  void show();
});
