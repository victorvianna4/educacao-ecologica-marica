// Curtidas, intenção de visita e compromissos do visitante
const { kv } = require("@vercel/kv");
const { allowCors, ok, badRequest, readJsonBody, internalError, P, bumpDaily, cleanId, syncById } = require("./_shared");

const RULES = 6;

module.exports = async (req, res) => {
  try {
    allowCors(res);
    if (req.method === "OPTIONS") return ok(res, { ok: true });
    if (req.method !== "POST") {
      res.statusCode = 405;
      return ok(res, { error: "Method not allowed" });
    }

    const body = await readJsonBody(req).catch(() => ({}));
    const type = String(body.type || "");

    if (type === "pledge") {
      const rule = Number(body.rule);
      if (!Number.isInteger(rule) || rule < 0 || rule >= RULES) return badRequest(res, "Invalid rule");
      await kv.hincrby(`${P}:pledges`, String(rule), 1);
      await bumpDaily(kv, "pledges");
      if (body.complete === true) await kv.incr(`${P}:pledgeCompletions`);
      return ok(res, { ok: true });
    }

    const id = cleanId(body.id);
    if (!id) return badRequest(res, "Missing id");
    const key = `${P}:point:${id}`;

    if (type === "like" || type === "unlike") {
      const delta = type === "like" ? 1 : -1;
      await kv.hincrby(key, "likes", delta);
      await bumpDaily(kv, "likes", delta);
    } else if (type === "visit") {
      await kv.hincrby(key, "visits", 1);
      await bumpDaily(kv, "visits");
    } else {
      return badRequest(res, "Invalid type");
    }

    await kv.hset(key, { updatedAt: new Date().toISOString() });
    const entry = await syncById(kv, id);
    ok(res, { id, ...entry });
  } catch (err) {
    console.error("api/event", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};
