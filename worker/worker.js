export default {
  async fetch(req) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    const q = new URL(req.url).searchParams.get('q') || '';
    if (!/^\d{1,5} in:title$/.test(q)) {
      return new Response('bad query', { status: 400, headers: cors });
    }
    const r = await fetch(
      'https://www.chiefdelphi.com/search.json?q=' + encodeURIComponent(q),
      {
        headers: { 'User-Agent': 'FRC-Turkiye-Wiki/1.0', Accept: 'application/json' },
        cf: { cacheTtl: 3600, cacheEverything: true },
      }
    );
    return new Response(r.body, {
      status: r.status,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' },
    });
  },
};
