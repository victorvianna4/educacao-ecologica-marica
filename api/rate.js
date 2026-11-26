const { kv } = require("@vercel/kv");
const { allowCors, ok, badRequest, readJsonBody, internalError } = require("./_shared");

module.exports = async (req, res) => {
  try {
    allowCors(res);
    if (req.method === "OPTIONS") return ok(res, { ok: true });

    if (req.method !== "POST") {
      res.statusCode = 405;
      return ok(res, { error: "Method not allowed" });
    }

    const body = await readJsonBody(req).catch(() => ({}));
    const id = String(body.id || "").trim();
    const stars = Number(body.stars);
    const oldStars = Number(body.oldStars) || 0; // Recebe a nota antiga (se for edição)

    if (!id) return badRequest(res, "Missing id");
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      return badRequest(res, "Invalid stars");
    }

    const key = `ecomarica:point:${id}`;

    // LÓGICA DE EDIÇÃO:
    // Se for edição (oldStars > 0), incrementa os votos em 0. Se for novo, incrementa em 1.
    const countIncrement = oldStars > 0 ? 0 : 1;
    // Se for edição, a diferença a ser somada é (stars - oldStars). Se for novo, soma as próprias estrelas.
    const sumIncrement = oldStars > 0 ? (stars - oldStars) : stars;

    const ratingCount = await kv.hincrby(key, "ratingCount", countIncrement);
    const ratingSum = await kv.hincrby(key, "ratingSum", sumIncrement);
    const clicks = Number((await kv.hget(key, "clicks")) || 0);

    await kv.hset(key, { lastRatedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

    // Passamos o objeto direto, sem JSON.stringify
    await kv.hset("ecomarica:byId", {
      [id]: {
        clicks,
        ratingCount: Number(ratingCount),
        ratingSum: Number(ratingSum),
      },
    });

    ok(res, {
      id,
      clicks,
      ratingCount: Number(ratingCount),
      ratingSum: Number(ratingSum),
    });
  } catch (err) {
    console.error("api/rate", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};