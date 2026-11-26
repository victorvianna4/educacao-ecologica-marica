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
    if (!id) return badRequest(res, "Missing id");

    const key = `${P}:point:${id}`;
    await kv.hincrby(key, "clicks", 1);
    await kv.hset(key, { updatedAt: new Date().toISOString() });
    await bumpDaily(kv, "clicks");

    const entry = await syncById(kv, id);
    ok(res, { id, ...entry });
  } catch (err) {
    console.error("api/click", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};
