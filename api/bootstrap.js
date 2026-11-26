const { kv } = require("@vercel/kv");
const { allowCors, ok, badRequest, readJsonBody } = require("./_shared");

module.exports = async (req, res) => {
  allowCors(res);
  if (req.method === "OPTIONS") return ok(res, { ok: true });

  if (req.method !== "POST") {
    res.statusCode = 405;
    return ok(res, { error: "Method not allowed" });
  }

  const body = await readJsonBody(req).catch(() => ({}));
  const ids = Array.isArray(body.ids) ? body.ids : [];
  if (ids.length === 0) return badRequest(res, "Missing ids");

  // NOVO: Salva a lista exata de IDs válidos atuais
  await kv.set("ecomarica:activeIds", ids);

  const byIdRaw = (await kv.hgetall("ecomarica:byId")) || {};
  const existing = new Set(Object.keys(byIdRaw));
  let inserted = 0;

  for (const rawId of ids) {
    const id = String(rawId || "").trim();
    if (!id || existing.has(id)) continue;

    const payload = { clicks: 0, ratingCount: 0, ratingSum: 0 };
    await kv.hset("ecomarica:byId", { [id]: payload });
    await kv.hset(`ecomarica:point:${id}`, {
      clicks: 0,
      ratingCount: 0,
      ratingSum: 0,
      updatedAt: new Date().toISOString(),
    });

    existing.add(id);
    inserted += 1;
  }

  return ok(res, { ok: true, total: ids.length, inserted, known: existing.size });
};