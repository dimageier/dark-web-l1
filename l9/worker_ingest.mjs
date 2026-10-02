export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let p = url.pathname;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);

    if ((p === "/api/ingest-html" || p === "/darkweb/api/ingest-html") && request.method === "POST") {
      const key = request.headers.get("x-ingest-key") || "";
      if (key !== "dw-l9-ingest-2026") return json({ ok:false, error:"unauthorized" }, 401);
      const html = await request.text();
      if (!html || html.length < 1000 || !html.includes("The Primetime Broadcast")) {
        return json({ ok:false, error:"bad_html", len: (html||"").length }, 400);
      }
      const CHUNK = 20000;
      const parts = Math.ceil(html.length / CHUNK);
      await env.SCORES.put("html/meta", JSON.stringify({ parts, total: html.length, v: "l9-ingest" }));
      for (let i = 0; i < parts; i++) {
        await env.SCORES.put("html/part/" + i, html.slice(i * CHUNK, (i + 1) * CHUNK));
      }
      return json({ ok:true, parts, total: html.length });
    }

    const apiPath = p.startsWith("/darkweb/api/") ? p.slice("/darkweb".length) : p.startsWith("/api/") ? p : null;
    if (apiPath === "/api/leaderboard" && request.method === "GET") return json(await readBoard(env));
    if (apiPath === "/api/score" && request.method === "POST") {
      try {
        const body = await request.json();
        const result = await postScore(env, body);
        return json(result, result.error ? 400 : 200);
      } catch (e) { return json({ ok:false, error:"bad_request" }, 400); }
    }
    if (apiPath && request.method === "OPTIONS") {
      return new Response(null, { status:204, headers: { "access-control-allow-origin":"*", "access-control-allow-methods":"GET, POST, OPTIONS", "access-control-allow-headers":"content-type,x-ingest-key" } });
    }

    const serve = p==="/"||p==="/darkweb"||p==="/index.html"||p==="/darkweb/index.html";
    if (!serve) {
      if (env.ASSETS) { try { const a = await env.ASSETS.fetch(request); if (a && a.status !== 404) return a; } catch(e) {} }
      return new Response("Not found", { status:404 });
    }

    const fromKv = await getHtml(env);
    if (fromKv) {
      return new Response(fromKv, { status:200, headers: { "content-type":"text/html; charset=utf-8", "cache-control":"public, max-age=30", "x-content-type-options":"nosniff" } });
    }
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(new URL("/index.html", url.origin));
      if (res.ok) return new Response(res.body, { status:200, headers: { "content-type":"text/html; charset=utf-8", "cache-control":"public, max-age=30", "x-content-type-options":"nosniff" } });
    }
    return new Response("Asset missing", { status:502 });
  }
};

let cachedHtml = null, cachedVer = null;
async function getHtml(env) {
  try {
    const metaRaw = await env.SCORES.get("html/meta");
    if (!metaRaw) return null;
    if (cachedHtml != null && cachedVer === metaRaw) return cachedHtml;
    const meta = JSON.parse(metaRaw);
    let s = "";
    for (let i = 0; i < meta.parts; i++) {
      const part = await env.SCORES.get("html/part/" + i);
      if (part == null) return null;
      s += part;
    }
    cachedHtml = s; cachedVer = metaRaw;
    return cachedHtml;
  } catch (e) { return null; }
}
function json(data, status=200){ return new Response(JSON.stringify(data), { status, headers: { "content-type":"application/json; charset=utf-8", "cache-control":"no-store" } }); }
async function readBoard(env){
  try {
    const raw = await env.SCORES.get("leaderboard");
    if (!raw) return { scores:[] };
    const parsed = JSON.parse(raw);
    const scores = Array.isArray(parsed) ? parsed : parsed.scores || [];
    return { scores: scores.slice(0,20) };
  } catch(e) { return { scores:[] }; }
}
function sanitizeName(raw){
  const n = String(raw||"").trim().replace(/\s+/g," ");
  if (n.length<2||n.length>16) return null;
  if (!/^[A-Za-z0-9 _-]+$/.test(n)) return null;
  return n;
}
async function postScore(env, body){
  const name = sanitizeName(body && body.name);
  if (!name) return { ok:false, error:"invalid_name" };
  let score = Number(body && body.score), level = Number(body && body.level);
  if (!Number.isFinite(score) || Number.isNaN(score)) return { ok:false, error:"invalid_score" };
  if (!Number.isFinite(level) || Number.isNaN(level)) level = 1;
  score = Math.max(0, Math.min(999999, Math.floor(score)));
  level = Math.max(1, Math.min(9, Math.floor(level)));
  const board = await readBoard(env);
  let scores = board.scores.slice();
  const key = name.toLowerCase();
  let idx = scores.findIndex(s => String(s.name||"").toLowerCase() === key);
  const entry = { name: idx>=0 ? scores[idx].name : name, score, level, at: new Date().toISOString() };
  if (idx>=0) { if (score > (scores[idx].score||0)) scores[idx]=entry; }
  else scores.push(entry);
  scores.sort((a,b)=>(b.score||0)-(a.score||0));
  scores = scores.slice(0,50);
  await env.SCORES.put("leaderboard", JSON.stringify(scores));
  return { ok:true, scores: scores.slice(0,20) };
}
