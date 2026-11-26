const { kv } = require("@vercel/kv");
const { allowCors, ok } = require("./_shared");

module.exports = async (req, res) => {
  allowCors(res);
  if (req.method === "OPTIONS") return ok(res, { ok: true });

  const byId = (await kv.hgetall("ecomarica:byId")) || {};
  
  // NOVO: Busca os IDs que estão ativos no site
  const activeIds = (await kv.get("ecomarica:activeIds")) || [];
  const activeSet = new Set(activeIds);

  const filteredById = {};

  for (const [id, raw] of Object.entries(byId)) {
    // NOVO: Ignora os registros fantasmas
    if (!activeSet.has(id) && activeIds.length > 0) continue;

    let data = {};
    
    if (typeof raw === 'string') {
      try {
        data = JSON.parse(raw);
      } catch {
        data = {};
      }
    } else if (typeof raw === 'object' && raw !== null) {
      data = raw;
    }

    filteredById[id] = {
      clicks: Number(data.clicks || 0),
      ratingCount: Number(data.ratingCount || 0),
      ratingSum: Number(data.ratingSum || 0),
    };
  }

  ok(res, { byId: filteredById });
};