const { kv } = require("@vercel/kv");
const { allowCors, ok, badRequest, readJsonBody, internalError, P, bumpDaily, cleanId, syncById } = require("./_shared");

module.exports = async (req, res) => {
  try {
    allowCors(res);
    if (req.method === "OPTIONS") return ok(res, { ok: true });
    if (req.method !== "POST") {
      res.statusCode = 405;
      return ok(res, { error: "Method not allowed" });
    }

    const body = await readJsonBody(req).catch(() => ({}));
    const id = cleanId(body.id);
    const stars = Number(body.stars);
    const oldStars = Number(body.oldStars) || 0; // nota antiga (se for edição)

    if (!id) return badRequest(res, "Missing id");
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) return badRequest(res, "Invalid stars");
    if (oldStars < 0 || oldStars > 5) return badRequest(res, "Invalid oldStars");

    const key = `${P}:point:${id}`;
    // Edição: não soma voto novo, só ajusta a diferença. Voto novo: soma 1 voto e as estrelas.
    const countIncrement = oldStars > 0 ? 0 : 1;
    const sumIncrement = oldStars > 0 ? stars - oldStars : stars;

    await kv.hincrby(key, "ratingCount", countIncrement);
    await kv.hincrby(key, "ratingSum", sumIncrement);
    const now = new Date().toISOString();
    await kv.hset(key, { lastRatedAt: now, updatedAt: now });
    await bumpDaily(kv, "ratings", countIncrement);

    const entry = await syncById(kv, id);
    ok(res, { id, ...entry });
  } catch (err) {
    console.error("api/rate", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};
