addEventListener("fetch", event => { event.respondWith(handle(event.request)); });

async function jpegFromRepo(name) {
  const urls = [
    "https://raw.githubusercontent.com/dimageier/dark-web-l1/main/dimitri-report/i/" + name,
    "https://cdn.jsdelivr.net/gh/dimageier/dark-web-l1@main/dimitri-report/i/" + name
  ];
  for (const src of urls) {
    try {
      const r = await fetch(src, { cf: { cacheTtl: 86400, cacheEverything: true } });
      if (!r.ok) continue;
      const buf = await r.arrayBuffer();
      return new Response(buf, {
        status: 200,
        headers: {
          "content-type": "image/jpeg",
          "cache-control": "public, max-age=86400",
          "x-content-type-options": "nosniff"
        }
      });
    } catch (e) {}
  }
  return new Response("Not found", { status: 404 });
}

function feature(html) {
  const main = html.match(/<div class="mainhead">[\s\S]*?<\/div>\s*<div class="mainhead l2"[\s\S]*?<\/div>/);
  if (!main) return null;
  let out = html.replace(main[0], "<div class=\"mainhead\">\n    <a class=\"red\" href=\"/croak\"><span class=\"siren\" aria-hidden=\"true\"></span>FEATURED GAME: CROAK A LIFE — HELP PEPE SURVIVE</a>\n  </div>\n  <div class=\"report-shot\">\n    <a href=\"/croak\"><img src=\"/i/croak.jpg\" alt=\"Croak a Life\" width=\"220\" height=\"330\"></a>\n  </div>\n  <div class=\"mainhead l2\" style=\"margin-top:4px;\">\n    <a href=\"/croak\">Help Pepe survive the century. Shoot the attacks. Catch the good stuff.</a>\n  </div>");
  const featIdx = out.indexOf("FEATURED LINK");
  if (featIdx < 0) return null;
  const featEnd = out.indexOf("</div>", featIdx);
  if (featEnd < 0) return null;
  const feat = "FEATURED GAME &nbsp;·&nbsp; <a class=\"red\" href=\"/croak\"><b>CROAK A LIFE</b> — HELP PEPE SURVIVE</a><div style=\"margin-top:6px;\">Also play <a class=\"red\" href=\"/darkweb\"><b>DARK WEB</b></a> — log off if you can.</div><div class=\"report-shot wide\"><a href=\"/darkweb\"><img src=\"/i/darkweb.jpg\" alt=\"Dark Web\" width=\"280\" height=\"158\"></a></div>";
  out = out.slice(0, featIdx) + feat + out.slice(featEnd);
  const left = out.indexOf("<h3>LEFT</h3>");
  const ul = out.indexOf("<ul>", left);
  if (left < 0 || ul < 0) return null;
  out = out.slice(0, ul + 4) + "\n        <li><a class=\"red\" href=\"/croak\"><span class=\"mini-shot\"><img src=\"/i/croak.jpg\" alt=\"Croak a Life\" width=\"120\" height=\"180\"></span><b>CROAK A LIFE:</b> Help Pepe survive, one decade at a time.</a></li>" + out.slice(ul + 4);
  const dw = "<li><a class=\"red\" href=\"/darkweb\"><b>DARK WEB:</b> Satirical platformer about surviving misinformation personalities…</a></li>";
  if (!out.includes(dw)) return null;
  out = out.replace(dw, "<li><a class=\"red\" href=\"/darkweb\"><span class=\"mini-shot\"><img src=\"/i/darkweb.jpg\" alt=\"Dark Web\" width=\"132\" height=\"74\"></span><b>DARK WEB:</b> Satirical platformer about surviving misinformation personalities…</a></li>");
  const foot = "\u00a9 DIMITRI REPORT &nbsp;\u00b7&nbsp; <a href=\"/darkweb\">Dark Web</a>";
  if (!out.includes(foot)) return null;
  out = out.replace(foot, "\u00a9 DIMITRI REPORT &nbsp;\u00b7&nbsp; <a href=\"/croak\">Croak a Life</a> &nbsp;\u00b7&nbsp; <a href=\"/darkweb\">Dark Web</a>");
  if (!out.includes(".report-shot{")) {
    out = out.replace("</style>", "  .report-shot{text-align:center;margin:8px auto 10px;}\n  .report-shot img{width:220px;max-width:70%;height:auto;border:1px solid #000;background:#fff;display:inline-block;}\n  .report-shot.wide img{width:280px;max-width:88%;}\n  .mini-shot{display:block;margin:0 0 4px;}\n  .mini-shot img{width:120px;max-width:100%;height:auto;border:1px solid #000;background:#fff;}\n</style>");
  }
  if (!out.includes("DIMITRI REPORT")) return null;
  if (!out.includes("bc1qy80khvjev3pwer66kudcx4hu2pwu0v5e3c3ywf")) return null;
  if (!out.includes("/darkweb/api/subscribe")) return null;
  if (!out.includes("href=\"/croak\"")) return null;
  if (!out.includes("href=\"/darkweb\"")) return null;
  if (!out.includes("HELP PEPE SURVIVE")) return null;
  if (!out.includes('src="/i/croak.jpg"')) return null;
  if (!out.includes('src="/i/darkweb.jpg"')) return null;
  return out;
}

async function handle(request) {
  const url = new URL(request.url);
  let p = url.pathname;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p === "/i/croak.jpg") return jpegFromRepo("croak.jpg");
  if (p === "/i/darkweb.jpg") return jpegFromRepo("darkweb.jpg");
  if (p === "/darkweb" || p.startsWith("/darkweb/")) return Response.redirect(url.origin + "/darkweb/", 302);
  if (p === "/" || p === "/index.html" || p === "/report") {
    const urls = [
      "https://cdn.jsdelivr.net/gh/dimageier/dark-web-l1@main/dimitri-report/index.html",
      "https://raw.githubusercontent.com/dimageier/dark-web-l1/main/dimitri-report/index.html"
    ];
    let lastErr = "unknown";
    for (const src of urls) {
      try {
        const r = await fetch(src, { cf: { cacheTtl: 300, cacheEverything: true } });
        if (!r.ok) { lastErr = src + " " + r.status; continue; }
        const raw = await r.text();
        if (!raw.includes("DIMITRI REPORT") || raw.includes("PLACEHOLDER")) { lastErr = "bad body"; continue; }
        const html = feature(raw);
        if (!html) { lastErr = "feature transform failed"; continue; }
        return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60", "x-content-type-options": "nosniff" } });
      } catch (e) { lastErr = String(e); }
    }
    return new Response("Report temporarily unavailable: " + lastErr, { status: 502 });
  }
  return new Response("Not found", { status: 404 });
}
