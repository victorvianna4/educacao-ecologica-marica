// Aplica o histórico de demonstração (api/_seed-data.json).
// Roda só quando a versão do arquivo muda: se ecomarica:seeded já tem a mesma
// versão, não faz nada. Ao trocar de versão, apaga os dados de uso do site
// (prefixo ecomarica:) e grava o novo histórico.
const { kv } = require("@vercel/kv");
const { allowCors, ok, internalError, P, DAILY_FIELDS, syncById } = require("./_shared");
const SEED = require("./_seed-data.json");

module.exports = async (req, res) => {
  try {
    allowCors(res);
    if (req.method === "OPTIONS") return ok(res, { ok: true });
    if (req.method !== "POST") {
      res.statusCode = 405;
      return ok(res, { error: "Use POST" });
    }

    const version = SEED.version || "v1";
    const current = await kv.get(`${P}:seeded`);
    if (current === version) return ok(res, { ok: true, already: true, version });

    // Limpa os dados de uso anteriores
    const known = Object.keys((await kv.hgetall(`${P}:byId`)) || {});
    const ids = [...new Set([...known, ...Object.keys(SEED.points)])];
    const keys = [
      `${P}:byId`, `${P}:pledges`, `${P}:pledgeCompletions`, `${P}:recentComments`, `${P}:visitors`,
      ...DAILY_FIELDS.map((f) => `${P}:daily:${f}`),
      ...ids.flatMap((id) => [`${P}:point:${id}`, `${P}:comments:${id}`]),
    ];
    for (let i = 0; i < keys.length; i += 50) await kv.del(...keys.slice(i, i + 50));

    let p = kv.pipeline();
    for (const [id, v] of Object.entries(SEED.points)) {
      const key = `${P}:point:${id}`;
      for (const f of ["clicks", "ratingCount", "ratingSum", "likes", "visits", "comments"]) {
        if (v[f]) p.hincrby(key, f, v[f]);
      }
      const list = SEED.comments[id] || [];
      if (list.length) p.rpush(`${P}:comments:${id}`, ...list);
    }
    for (const [field, byDate] of Object.entries(SEED.daily)) {
      for (const [date, n] of Object.entries(byDate)) p.hincrby(`${P}:daily:${field}`, date, n);
    }
    for (const [rule, n] of Object.entries(SEED.pledges)) p.hincrby(`${P}:pledges`, rule, n);
    p.incrby(`${P}:pledgeCompletions`, SEED.pledgeCompletions || 0);
    p.incrby(`${P}:visitors`, SEED.visitors || 0);
    if (SEED.recentComments.length) p.rpush(`${P}:recentComments`, ...SEED.recentComments);
    p.hset(`${P}:meta`, SEED.meta);
    await p.exec();

    for (const id of ids) await syncById(kv, id);
    await kv.set(`${P}:seeded`, version);

    ok(res, { ok: true, seeded: Object.keys(SEED.points).length, version });
  } catch (err) {
    console.error("api/seed", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};
