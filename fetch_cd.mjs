// Her takım için Chief Delphi'de "NNNN in:title" araması yapıp chiefdelphi.json yazar.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const teams = readFileSync('teams.txt', 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
const OUT = 'chiefdelphi.json';
const old = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).teams || {} : {};
const out = {};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(n) {
  const url = 'https://www.chiefdelphi.com/search.json?q=' + encodeURIComponent(n + ' in:title');
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: { 'User-Agent': 'FRC-Turkiye-Wiki/1.0', Accept: 'application/json' } });
    if (r.ok) return r.json();
    if (r.status === 429 || r.status >= 500) { await sleep(10000 * (i + 1)); continue; }
    throw new Error('HTTP ' + r.status);
  }
  throw new Error('çok fazla deneme');
}

let fail = 0;
for (const n of teams) {
  try {
    const j = await get(n);
    const re = new RegExp('(^|\\D)' + n + '(\\D|$)');
    out[n] = (j.topics || [])
      .filter(t => re.test(t.title || ''))
      .slice(0, 6)
      .map(t => ({ id: t.id, slug: t.slug, title: t.title, created: t.created_at, posts: t.posts_count }));
  } catch (e) {
    fail++;
    console.error(n, e.message);
    if (old[n]) out[n] = old[n]; // hata olursa eski veriyi koru
    if (fail >= 15 && !Object.keys(out).length) { console.error('Engellenmiş olabilir, duruyorum.'); process.exit(1); }
  }
  await sleep(1500);
}
writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), teams: out }));
console.log('Bitti:', Object.keys(out).length, 'takım,', fail, 'hata');
