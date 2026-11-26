// Dados do painel: histórico diário, compromissos, comentários recentes e nomes das áreas
const { kv } = require("@vercel/kv");
const { allowCors, ok, internalError, P, DAILY_FIELDS } = require("./_shared");

module.exports = async (req, res) => {
  try {
    allowCors(res);
    if (req.method === "OPTIONS") return ok(res, { ok: true });

    const daily = {};
    for (const f of DAILY_FIELDS) {
      const raw = (await kv.hgetall(`${P}:daily:${f}`)) || {};
      daily[f] = Object.fromEntries(Object.entries(raw).map(([d, n]) => [d, Number(n) || 0]));
    }
    const pledgesRaw = (await kv.hgetall(`${P}:pledges`)) || {};
    const pledges = Object.fromEntries(Object.entries(pledgesRaw).map(([k, n]) => [k, Number(n) || 0]));
    const pledgeCompletions = Number((await kv.get(`${P}:pledgeCompletions`)) || 0);
    const recentComments = (await kv.lrange(`${P}:recentComments`, 0, 19)) || [];
    const meta = (await kv.hgetall(`${P}:meta`)) || {};

    res.setHeader("Cache-Control", "no-store");
    ok(res, { daily, pledges, pledgeCompletions, recentComments, meta });
  } catch (err) {
    console.error("api/history", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};
