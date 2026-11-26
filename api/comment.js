// Comentários dos visitantes (GET ?id=  |  POST {id, author, text, stars})
const { kv } = require("@vercel/kv");
const { allowCors, ok, badRequest, readJsonBody, internalError, P, bumpDaily, cleanId, syncById } = require("./_shared");

const clean = (s, max) =>
  String(s || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

module.exports = async (req, res) => {
  try {
    allowCors(res);
    if (req.method === "OPTIONS") return ok(res, { ok: true });

    if (req.method === "GET") {
      const url = new URL(req.url, "http://localhost");
      const id = cleanId(url.searchParams.get("id"));
      if (!id) return badRequest(res, "Missing id");
      const list = (await kv.lrange(`${P}:comments:${id}`, 0, 19)) || [];
      res.setHeader("Cache-Control", "no-store");
      return ok(res, { id, comments: list });
    }

    if (req.method !== "POST") {
      res.statusCode = 405;
      return ok(res, { error: "Method not allowed" });
    }

    const body = await readJsonBody(req).catch(() => ({}));
    const id = cleanId(body.id);
    const author = clean(body.author, 40) || "Visitante";
    const text = clean(body.text, 400);
    const stars = Number(body.stars) || 0;
    if (!id) return badRequest(res, "Missing id");
    if (text.length < 3) return badRequest(res, "Comment too short");

    const comment = {
      author,
      text,
      stars: stars >= 1 && stars <= 5 ? stars : 0,
      date: new Date().toISOString(),
      placeId: id,
    };

    await kv.lpush(`${P}:comments:${id}`, comment);
    await kv.ltrim(`${P}:comments:${id}`, 0, 99);
    await kv.lpush(`${P}:recentComments`, comment);
    await kv.ltrim(`${P}:recentComments`, 0, 49);
    await kv.hincrby(`${P}:point:${id}`, "comments", 1);
    await bumpDaily(kv, "comments");
    const entry = await syncById(kv, id);

    ok(res, { ok: true, comment, ...entry });
  } catch (err) {
    console.error("api/comment", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};
