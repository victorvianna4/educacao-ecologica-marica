// Popula o banco UMA ÚNICA VEZ com um histórico de uso de demonstração.
// Depois de rodar, a chave ecomarica:seeded impede que rode de novo.
// Os valores são SOMADOS aos existentes (não apaga dados reais).
const { kv } = require("@vercel/kv");
const { allowCors, ok, internalError, P, syncById } = require("./_shared");
const SEED = require("./_seed-data.json");

module.exports = async (req, res) => {
  try {
    allowCors(res);
    if (req.method === "OPTIONS") return ok(res, { ok: true });
    if (req.method !== "POST") {
      res.statusCode = 405;
      return ok(res, { error: "Use POST" });
    }

    const got = await kv.set(`${P}:seeded`, new Date().toISOString(), { nx: true });
    if (!got) return ok(res, { ok: true, already: true });

    let p = kv.pipeline();
    for (const [id, v] of Object.entries(SEED.points)) {
      const key = `${P}:point:${id}`;
      for (const f of ["clicks", "ratingCount", "ratingSum", "likes", "visits", "comments"]) {
        if (v[f]) p.hincrby(key, f, v[f]);
      }
      const list = SEED.comments[id] || [];
      if (list.length) p.rpush(`${P}:comments:${id}`, ...list);
    }
    await p.exec();

    p = kv.pipeline();
    for (const [field, byDate] of Object.entries(SEED.daily)) {
      for (const [date, n] of Object.entries(byDate)) p.hincrby(`${P}:daily:${field}`, date, n);
    }
    for (const [rule, n] of Object.entries(SEED.pledges)) p.hincrby(`${P}:pledges`, rule, n);
    p.incrby(`${P}:pledgeCompletions`, SEED.pledgeCompletions);
    if (SEED.recentComments.length) p.rpush(`${P}:recentComments`, ...SEED.recentComments);
    p.hset(`${P}:meta`, SEED.meta);
    await p.exec();

    for (const id of Object.keys(SEED.points)) await syncById(kv, id);

    ok(res, { ok: true, seeded: Object.keys(SEED.points).length });
  } catch (err) {
    console.error("api/seed", err);
    allowCors(res);
    return internalError(res, "Server error");
  }
};
