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
    if (!id) return badRequest(res, "Missing id");

    const key = `ecomarica:point:${id}`;

    const clicks = await kv.hincrby(key, "clicks", 1);
    await kv.hset(key, { updatedAt: new Date().toISOString() });

    const ratingCount = Number((await kv.hget(key, "ratingCount")) || 0);
    const ratingSum = Number((await kv.hget(key, "ratingSum")) || 0);
    
    // Passamos o objeto direto, sem JSON.stringify
    await kv.hset("ecomarica:byId", {
      [id]: { clicks: Number(clicks), ratingCount, ratingSum },
    });

    ok(res, { id, clicks: Number(clicks), ratingCount, ratingSum });
  } catch (err) {
    console.error("api/click", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};