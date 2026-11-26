const allowCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const readJsonBody = async (req) => {
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
};

const ok = (res, body) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const badRequest = (res, message) => {
  res.statusCode = 400;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: message }));
};

const internalError = (res, message) => {
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: message }));
};

module.exports = { allowCors, readJsonBody, ok, badRequest, internalError };


// ====== Utilitários do Educação Ecológica ======
const P = "ecomarica";
const DAILY_FIELDS = ["visitors", "clicks", "ratings", "likes", "visits", "comments", "pledges"];

// Data de hoje no fuso de Maricá (America/Sao_Paulo), formato AAAA-MM-DD
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

const bumpDaily = async (kv, field, n = 1) => {
  if (!n) return;
  await kv.hincrby(`${P}:daily:${field}`, today(), n);
};

const cleanId = (v) => String(v || "").trim().slice(0, 160);

// Recalcula o resumo de um ponto em ecomarica:byId a partir do hash do ponto
const syncById = async (kv, id) => {
  const h = (await kv.hgetall(`${P}:point:${id}`)) || {};
  const entry = {
    clicks: Number(h.clicks || 0),
    ratingCount: Number(h.ratingCount || 0),
    ratingSum: Number(h.ratingSum || 0),
    likes: Math.max(0, Number(h.likes || 0)),
    visits: Number(h.visits || 0),
    comments: Number(h.comments || 0),
  };
  await kv.hset(`${P}:byId`, { [id]: entry });
  return entry;
};

module.exports.P = P;
module.exports.DAILY_FIELDS = DAILY_FIELDS;
module.exports.today = today;
module.exports.bumpDaily = bumpDaily;
module.exports.cleanId = cleanId;
module.exports.syncById = syncById;
