/* global mammoth */

const DOCX_PATH = "./Ecologia%20em%20Maric%C3%A1.docx";

const STORAGE_KEY = "ecomarica_analytics_v2"; // v2: descarta o cache local antigo (dados de demonstração maiores)
const DEFAULT_LANG = "pt-BR";
const API_BASE = (() => {
  const fromWindow = globalThis.MARICA_API_BASE;
  let fromStorage = "";
  try {
    fromStorage = localStorage.getItem("marica_api_base") || "";
  } catch {
    fromStorage = "";
  }
  const base = String(fromWindow || fromStorage || "").trim();
  return base ? base.replace(/\/$/, "") : "";
})();

// ====== INTERFACE ======
const I18N = {
  "pt-BR": {
    subtitle: "Educação Ecológica",
    language: "Idioma",
    dashboard: "Dashboard",
    heroTitle: "Educação Ecológica em Maricá",
    heroDesc:
      "Conheça as áreas protegidas, as restingas em reflorestamento, as lagoas em recuperação e as matas de Maricá. Passeie, aprenda e ajude a preservar: suas avaliações alimentam nosso painel em tempo real.",
    searchPlaceholder: "Buscar por nome, bairro, categoria ou proteção…",
    totalPoints: "Áreas Naturais",
    ratedPoints: "Avaliações",
    totalClicks: "Cliques no Mapa",
    listTitle: "Áreas para visitar e preservar",
    docHint: "Carregando áreas naturais...",
    loaded: (n) => `${n} área(s) natural(is) carregada(s)`,
    footerNote:
      "Ver o painel: as interações na plataforma alimentam um banco de dados global (Vercel KV) e mostram quais áreas naturais mais despertam o interesse dos visitantes.",
    close: "Fechar",
    all: "Todos",
    neighborhood: "Bairro",
    hours: "Horário",
    price: "Preço",
    access: "Acesso",
    protection: "Proteção",
    protectedArea: "Área protegida",
    ecoTip: "Dica ecológica",
    openMap: "Abrir no mapa",
    clicks: "cliques",
    rate: "Avalie",
    ratingSummary: (avg, count) =>
      count > 0 ? `Média ${avg.toFixed(1)} • ${count} voto(s)` : "Sem votos ainda",
    noResults: "Nenhuma área encontrada com esse filtro.",
    defaultDesc: "Visite, conheça e ajude a preservar esta área natural de Maricá.",
    shareText: (name) => `Conheça ${name} em Maricá e ajude a preservar! 🌿`,
    alertTitle: "Leve seu lixo embora!",
    alertText:
      "Nas praias, trilhas, lagoas e cachoeiras de Maricá, tudo o que você trouxer deve voltar com você. Não alimente animais, não arranque plantas, não faça fogueiras e respeite as áreas cercadas de reflorestamento. A natureza agradece.",
    guideTitle: "Compromisso do visitante consciente",
    guideHint: "Marque os compromissos que você assume antes de sair de casa:",
    rules: [
      ["🗑️", "Vou levar todo o meu lixo de volta, inclusive bitucas e restos de comida."],
      ["🌱", "Vou caminhar só pelas trilhas e acessos demarcados, sem pisar na restinga e nas dunas."],
      ["🐦", "Não vou alimentar, perseguir ou retirar animais do seu ambiente."],
      ["🔥", "Não vou acender fogueiras nem soltar balões."],
      ["💧", "Não vou usar sabão, xampu ou descartar nada em rios, lagoas e no mar."],
      ["🔇", "Vou manter o som baixo para não assustar a fauna."],
    ],
    guideDone: "🌎 Obrigado! Você é um guardião da natureza de Maricá.",
    guideProgress: (n, t) => `${n} de ${t} compromissos assumidos`,
    totalLikes: "Curtidas",
    like: "Curtir",
    visitBtn: "Quero visitar",
    visitDone: "Visita planejada",
    visitsLabel: (n) => `${n} pessoa(s) querem visitar`,
    commentsTitle: "O que os visitantes dizem",
    commentName: "Seu nome (opcional)",
    commentText: "Conte como foi sua visita e o que você fez para preservar…",
    commentSend: "Comentar",
    commentThanks: "Obrigado pelo comentário! 🌿",
    commentError: "Não foi possível enviar agora. Tente novamente.",
    commentsCount: (n) => `${n} comentário(s)`,
  },
  en: {
    subtitle: "Ecological Education",
    language: "Language",
    dashboard: "Dashboard",
    heroTitle: "Ecological Education in Maricá",
    heroDesc:
      "Explore Maricá's protected areas, restinga being reforested, lagoons under recovery and Atlantic Forest trails. Visit, learn and help preserve: your ratings feed our real-time dashboard.",
    searchPlaceholder: "Search by name, neighborhood, category or protection…",
    totalPoints: "Natural Areas",
    ratedPoints: "Ratings",
    totalClicks: "Map Clicks",
    listTitle: "Places to visit and protect",
    docHint: "Loading natural areas...",
    loaded: (n) => `${n} natural area(s) loaded`,
    footerNote:
      "See the dashboard: all interactions feed a global database (Vercel KV), showing which natural areas visitors care about most.",
    close: "Close",
    all: "All",
    neighborhood: "Neighborhood",
    hours: "Hours",
    price: "Price",
    access: "Access",
    protection: "Protection",
    protectedArea: "Protected area",
    ecoTip: "Eco tip",
    openMap: "Open map",
    clicks: "clicks",
    rate: "Rate",
    ratingSummary: (avg, count) =>
      count > 0 ? `Avg ${avg.toFixed(1)} • ${count} vote(s)` : "No votes yet",
    noResults: "No areas match your filters.",
    defaultDesc: "Visit, learn about and help protect this natural area of Maricá.",
    shareText: (name) => `Discover ${name} in Maricá and help protect it! 🌿`,
    alertTitle: "Take your trash home!",
    alertText:
      "On Maricá's beaches, trails, lagoons and waterfalls, everything you bring must leave with you. Don't feed animals, don't pick plants, don't light fires and respect the fenced reforestation areas. Nature thanks you.",
    guideTitle: "Responsible visitor pledge",
    guideHint: "Tick the commitments you take on before leaving home:",
    rules: [
      ["🗑️", "I will take all my trash back, including cigarette butts and food scraps."],
      ["🌱", "I will only walk on marked trails and paths, never on the restinga or dunes."],
      ["🐦", "I will not feed, chase or remove animals from their habitat."],
      ["🔥", "I will not light fires or release balloons."],
      ["💧", "I will not use soap or shampoo or dump anything in rivers, lagoons or the sea."],
      ["🔇", "I will keep noise low so as not to scare wildlife."],
    ],
    guideDone: "🌎 Thank you! You are a guardian of Maricá's nature.",
    guideProgress: (n, t) => `${n} of ${t} commitments made`,
    totalLikes: "Likes",
    like: "Like",
    visitBtn: "I want to visit",
    visitDone: "Visit planned",
    visitsLabel: (n) => `${n} people want to visit`,
    commentsTitle: "What visitors say",
    commentName: "Your name (optional)",
    commentText: "Tell us about your visit and what you did to protect it…",
    commentSend: "Comment",
    commentThanks: "Thanks for your comment! 🌿",
    commentError: "Could not send right now. Please try again.",
    commentsCount: (n) => `${n} comment(s)`,
  },
  es: {
    subtitle: "Educación Ecológica",
    language: "Idioma",
    dashboard: "Panel",
    heroTitle: "Educación Ecológica en Maricá",
    heroDesc:
      "Conoce las áreas protegidas, las restingas en reforestación, las lagunas en recuperación y los bosques de Maricá. Pasea, aprende y ayuda a preservar: tus valoraciones alimentan nuestro panel en tiempo real.",
    searchPlaceholder: "Buscar por nombre, barrio, categoría o protección…",
    totalPoints: "Áreas Naturales",
    ratedPoints: "Valoraciones",
    totalClicks: "Clics en el Mapa",
    listTitle: "Lugares para visitar y preservar",
    docHint: "Cargando áreas naturales...",
    loaded: (n) => `${n} área(s) natural(es) cargada(s)`,
    footerNote:
      "Ver el panel: las interacciones alimentan una base de datos global (Vercel KV) y muestran qué áreas naturales despiertan más interés.",
    close: "Cerrar",
    all: "Todos",
    neighborhood: "Barrio",
    hours: "Horario",
    price: "Precio",
    access: "Acceso",
    protection: "Protección",
    protectedArea: "Área protegida",
    ecoTip: "Consejo ecológico",
    openMap: "Abrir mapa",
    clicks: "clics",
    rate: "Valorar",
    ratingSummary: (avg, count) =>
      count > 0 ? `Media ${avg.toFixed(1)} • ${count} voto(s)` : "Aún sin votos",
    noResults: "No hay áreas con ese filtro.",
    defaultDesc: "Visita, conoce y ayuda a preservar esta área natural de Maricá.",
    shareText: (name) => `¡Conoce ${name} en Maricá y ayuda a preservarlo! 🌿`,
    alertTitle: "¡Llévate tu basura!",
    alertText:
      "En las playas, senderos, lagunas y cascadas de Maricá, todo lo que traigas debe irse contigo. No alimentes animales, no arranques plantas, no hagas fogatas y respeta las áreas cercadas de reforestación. La naturaleza te lo agradece.",
    guideTitle: "Compromiso del visitante consciente",
    guideHint: "Marca los compromisos que asumes antes de salir de casa:",
    rules: [
      ["🗑️", "Me llevaré toda mi basura, incluidas colillas y restos de comida."],
      ["🌱", "Caminaré solo por senderos y accesos señalizados, sin pisar la restinga ni las dunas."],
      ["🐦", "No alimentaré, perseguiré ni sacaré animales de su hábitat."],
      ["🔥", "No encenderé fogatas ni soltaré globos."],
      ["💧", "No usaré jabón ni champú ni tiraré nada en ríos, lagunas o el mar."],
      ["🔇", "Mantendré el volumen bajo para no asustar a la fauna."],
    ],
    guideDone: "🌎 ¡Gracias! Eres un guardián de la naturaleza de Maricá.",
    guideProgress: (n, t) => `${n} de ${t} compromisos asumidos`,
    totalLikes: "Me gusta",
    like: "Me gusta",
    visitBtn: "Quiero visitar",
    visitDone: "Visita planeada",
    visitsLabel: (n) => `${n} persona(s) quieren visitar`,
    commentsTitle: "Lo que dicen los visitantes",
    commentName: "Tu nombre (opcional)",
    commentText: "Cuenta cómo fue tu visita y qué hiciste para preservar…",
    commentSend: "Comentar",
    commentThanks: "¡Gracias por tu comentario! 🌿",
    commentError: "No se pudo enviar ahora. Inténtalo de nuevo.",
    commentsCount: (n) => `${n} comentario(s)`,
  },
  zh: {
    subtitle: "生态教育",
    language: "语言",
    dashboard: "仪表盘",
    heroTitle: "马里卡（Maricá）生态教育",
    heroDesc:
      "了解马里卡的保护区、正在重新造林的沙滩植被（restinga）、正在恢复的潟湖以及大西洋森林步道。游览、学习并帮助保护：您的评分会实时更新到我们的仪表盘。",
    searchPlaceholder: "按名称、地区、类别或保护类型搜索…",
    totalPoints: "自然区域",
    ratedPoints: "评价次数",
    totalClicks: "地图点击",
    listTitle: "值得参观与保护的地方",
    docHint: "正在加载自然区域...",
    loaded: (n) => `已加载 ${n} 个自然区域`,
    footerNote: "查看仪表盘：所有互动都会汇入全局数据库 (Vercel KV)，显示访客最关注的自然区域。",
    close: "关闭",
    all: "全部",
    neighborhood: "地区",
    hours: "时间",
    price: "价格",
    access: "难度",
    protection: "保护",
    protectedArea: "保护区",
    ecoTip: "生态提示",
    openMap: "打开地图",
    clicks: "次点击",
    rate: "评分",
    ratingSummary: (avg, count) =>
      count > 0 ? `平均 ${avg.toFixed(1)} • ${count} 次` : "暂无评分",
    noResults: "没有符合筛选条件的区域。",
    defaultDesc: "参观、了解并帮助保护马里卡的这片自然区域。",
    shareText: (name) => `来马里卡认识 ${name}，一起保护它！🌿`,
    alertTitle: "请把垃圾带走！",
    alertText:
      "在马里卡的海滩、步道、潟湖和瀑布，您带来的一切都必须带走。不要喂食动物，不要采摘植物，不要生火，并尊重围起来的造林区域。大自然感谢您。",
    guideTitle: "文明游客承诺",
    guideHint: "出门前请勾选您愿意遵守的承诺：",
    rules: [
      ["🗑️", "我会带走所有垃圾，包括烟头和食物残渣。"],
      ["🌱", "我只走标记的步道和通道，不踩踏沙滩植被和沙丘。"],
      ["🐦", "我不会喂食、追逐或带走野生动物。"],
      ["🔥", "我不会生火或放飞孔明灯。"],
      ["💧", "我不会在河流、潟湖或海中使用肥皂、洗发水或丢弃任何东西。"],
      ["🔇", "我会保持安静，不惊扰野生动物。"],
    ],
    guideDone: "🌎 谢谢！您是马里卡大自然的守护者。",
    guideProgress: (n, t) => `已做出 ${n}/${t} 项承诺`,
    totalLikes: "点赞",
    like: "点赞",
    visitBtn: "我想去",
    visitDone: "已计划参观",
    visitsLabel: (n) => `${n} 人想去`,
    commentsTitle: "游客评论",
    commentName: "您的名字（可选）",
    commentText: "分享您的游览经历以及您为保护环境所做的事…",
    commentSend: "评论",
    commentThanks: "感谢您的评论！🌿",
    commentError: "暂时无法发送，请重试。",
    commentsCount: (n) => `${n} 条评论`,
  },
};

// Dica ecológica geral por categoria (usada nos idiomas estrangeiros)
const CATEGORY_TIPS = {
  "Áreas Protegidas": {
    en: "This is a protected area: stay on the trails, don't light fires or collect plants and animals.",
    es: "Esta es un área protegida: quédate en los senderos, no hagas fuego ni recojas plantas o animales.",
    zh: "这里是保护区：请走步道，不要生火，不要采集植物或动物。",
  },
  "Restauração Ecológica": {
    en: "This area is being restored: respect fenced seedlings and never dump waste or oil in the water.",
    es: "Esta área está en recuperación: respeta las plántulas cercadas y nunca tires residuos o aceite al agua.",
    zh: "该区域正在恢复中：请爱护围起来的幼苗，切勿向水中倾倒垃圾或油。",
  },
  "Praias e Restinga": {
    en: "Take your trash home, pick up cigarette butts and use marked paths: restinga plants hold the sand in place.",
    es: "Llévate tu basura, recoge colillas y usa los accesos señalizados: la restinga sostiene la arena.",
    zh: "带走垃圾、捡起烟头并走标记通道：沙滩植被能固定沙子。",
  },
  "Lagoas": {
    en: "Don't feed fish or birds and never throw food or oil in the lagoon. Watch birds from a distance.",
    es: "No alimentes peces ni aves y nunca tires comida o aceite a la laguna. Observa las aves de lejos.",
    zh: "不要喂鱼或鸟，切勿向潟湖丢弃食物或油。请远距离观鸟。",
  },
  "Mata Atlântica": {
    en: "Stay on the trail, keep noise low and never use soap in rivers and waterfalls.",
    es: "Quédate en el sendero, mantén el silencio y nunca uses jabón en ríos y cascadas.",
    zh: "请走步道，保持安静，切勿在河流和瀑布中使用肥皂。",
  },
  "Costões e Geologia": {
    en: "Don't scratch or remove rocks, shells or marine life: these formations are millions of years old.",
    es: "No rayes ni retires rocas, conchas o vida marina: estas formaciones tienen millones de años.",
    zh: "不要刻划或带走岩石、贝壳或海洋生物：这些地貌已有数百万年历史。",
  },
  "Educação Ambiental": {
    en: "Book ahead, respect local communities and buy from local producers.",
    es: "Reserva con antelación, respeta a las comunidades y compra a productores locales.",
    zh: "请提前预约，尊重当地社区，并购买本地农产品。",
  },
};

// ====== DICIONÁRIO DE DADOS DO WORD ======
const DATA_DICT = {
  // Dias da semana e horários comuns
  "Segunda": { en: "Monday", es: "Lunes", zh: "周一" },
  "Terça": { en: "Tuesday", es: "Martes", zh: "周二" },
  "Quarta": { en: "Wednesday", es: "Miércoles", zh: "周三" },
  "Quinta": { en: "Thursday", es: "Jueves", zh: "周四" },
  "Sexta": { en: "Friday", es: "Viernes", zh: "周五" },
  "Sábado": { en: "Saturday", es: "Sábado", zh: "周六" },
  "Sábados": { en: "Saturdays", es: "Sábados", zh: "周六" },
  "domingo": { en: "Sunday", es: "domingo", zh: "周日" },
  "Domingo": { en: "Sunday", es: "Domingo", zh: "周日" },
  "domingos": { en: "Sundays", es: "domingos", zh: "周日" },
  "Feriados": { en: "Holidays", es: "Festivos", zh: "节假日" },
  "feriados": { en: "holidays", es: "festivos", zh: "节假日" },
  " a ": { en: " to ", es: " a ", zh: "至" },
  " e ": { en: " and ", es: " y ", zh: "和" },
  "de ": { en: "from ", es: "de ", zh: "从" },
  "às ": { en: "to ", es: "a las ", zh: "至" },
  " às ": { en: " to ", es: " a las ", zh: "至" },
  "Pode variar conforme eventos": { en: "May vary according to events", es: "Puede variar según los eventos", zh: "可能因活动而异" },
  "Todos os dias": { en: "Every day", es: "Todos los días", zh: "每天" },
  "A partir das": { en: "From", es: "A partir de las", zh: "起" },
  "com entrada até as": { en: "with entry until", es: "con entrada hasta las", zh: "入场截至" },
  "24h": { en: "24h", es: "24h", zh: "24小时" },
  
  // ---> FRASE NOVA ADICIONADA AQUI <---
  "Horário pode variar, é recomendável entrar em contato (21) 96744-3131 para mais informações.": { 
    en: "Hours may vary, it is recommended to contact (21) 96744-3131 for more information.", 
    es: "El horario puede variar, se recomienda contactar al (21) 96744-3131 para más información.", 
    zh: "时间可能因活动而异，建议联系 (21) 96744-3131 了解更多信息。" 
  },

  // Acesso e Preço
  "Gratuito": { en: "Free", es: "Gratis", zh: "免费" },
  "Leve": { en: "Easy", es: "Fácil", zh: "简单" },
  "Leve a Moderado": { en: "Easy to Moderate", es: "Fácil a Moderado", zh: "简单到中等" },
  "Moderado a difícil": { en: "Moderate to Difficult", es: "Moderado a difícil", zh: "中等到困难" },
  "Necessário agendamento": { en: "Appointment required", es: "Cita requerida", zh: "需要预约" },
  "necessário agendar": { en: "appointment required", es: "cita requerida", zh: "需要预约" },
  "Para grupos acima de 5 pessoas é necessário agendar por e-mail": { en: "For groups over 5 people, appointment via email is required", es: "Para grupos de más de 5 personas es necesario reservar por correo electrónico", zh: "5人以上团队需通过电子邮件预约" },
  "Necessário pegar um barco para chegar, trilha leve.": { en: "Boat required to get there, easy trail.", es: "Se requiere un bote para llegar, sendero fácil.", zh: "需要乘船到达，小径轻松。" },

  // Categorias
  "Áreas Protegidas": { en: "Protected Areas", es: "Áreas Protegidas", zh: "保护区" },
  "Restauração Ecológica": { en: "Ecological Restoration", es: "Restauración Ecológica", zh: "生态修复" },
  "Praias e Restinga": { en: "Beaches & Restinga", es: "Playas y Restinga", zh: "海滩与沙滩植被" },
  "Lagoas": { en: "Lagoons", es: "Lagunas", zh: "潟湖" },
  "Mata Atlântica": { en: "Atlantic Forest", es: "Mata Atlántica", zh: "大西洋森林" },
  "Costões e Geologia": { en: "Rocky Shores & Geology", es: "Costas Rocosas y Geología", zh: "海岸岩石与地质" },
  "Educação Ambiental": { en: "Environmental Education", es: "Educación Ambiental", zh: "环境教育" },
  "Moderado a difícil": { en: "Moderate to Difficult", es: "Moderado a difícil", zh: "中等到困难" },

  // Bairros/Regiões comuns
  "Centro": { en: "Downtown", es: "Centro", zh: "市中心" },
  "Espraiado": { en: "Espraiado", es: "Espraiado", zh: "Espraiado" },
  "Ponta Negra": { en: "Ponta Negra", es: "Ponta Negra", zh: "Ponta Negra" },
  "Itaipuaçu": { en: "Itaipuaçu", es: "Itaipuaçu", zh: "Itaipuaçu" }
};

// ====== MAPEAMENTO DE IMAGENS ======
const IMAGE_MAP = {
  "casa-de-cultura": "Casa-da-CulturaMuseu-Historico.jpeg",
  "igreja-matriz-de-nossa-senhora-do-amparo": "igreja-nossa-senhora-do-amparo.jpg",
  "cine-teatro-henfil": "cine-teatro-henfil.jpg",
  "mercado-das-artes": "mercado-das-artes.jpg",
  "escadaria-da-boa-vista": "escadaria-da-boa-vista.jpeg",
  "mesa-dos-imortais": "mesa-dos-imortais.jpg",
  "capela-de-sao-pedro": "Capela.Sao.Pedro.png",
  "grupo-de-artistas-de-marica-gam": "Grupo.de.Artistas.jpeg",
  "aldeia-indigena-mata-verde-bonita": "aldeia-indigena-mata-verde-bonita-1.jpg",
  "paroquia-sao-jose": "ParóquiaSaoJosé.webp",
  "capela-nossa-senhora-da-saude": "Capela.N.Sra.da.Saude.png",
  "casa-darcy-ribeiro": "Casa.Darcy.Ribeiro.png",
  "fazenda-publica-joaquin-pinero": "Fazenda Publica Joaquin Piñero - Foto Paulo Avila.webp",
  "atelie-jose-pereira": "Atelie.Jose.Pereira.png",
  "ecomuseu-estacao-bertha-lutz": "Ecomuseu.Bertha.Lutz.png",
  "castelo-shiachticas": "castelo-schiachticas.jpg",
  "fazenda-itaocaia": "Fazenda.Itaocaia.png",
  "lagoa-de-aracatiba": "Lagoa.Aracatiba.jpg",
  "lagoa-de-jacaroa": "Lagoa.de.Jacaroa.jpeg",
  "lagoa-do-boqueirao": "Lagoa.do.Boqueiraojpg.jpg",
  "lagoa-das-amendoeiras": "Lagoa-das-Amendoeiras.jpg",
  "comunidade-pesqueira-de-zacarias-restinga-de-marica": "Comunidade.pesqueira.Zacarias.png",
  "orla-do-marine": "Orla.do.Marine.jpeg",
  "orla-de-jacaroa": "Orla.de.Jacaroá.jpeg",
  "orla-do-parque-nanci": "Orla.Pq.Nanci.jpeg",
  "orla-de-itapeba": "Orla.Itapeba.webp",
  "deck-de-aracatiba": "Deck.Araçatiba.jpeg",
  "orla-de-aracatiba": "Lagoa.Aracatiba.jpg",
  "farol-de-ponta-negra": "Farol-de-Ponta-Negra.jpeg",
  "cachoeira-do-espraiado": "Cachoeira.Espraiado.jpeg",
  "orla-de-bambui": "Orla.de.Bambui.jpeg",
  "gruta-da-sacristia": "Gruta.Sacristia.jpeg",
  "gruta-de-ponta-negra": "Gruta.Ponta.Negra.jpeg",
  "canal-de-ponta-negra": "Canal.Ponta.Negra.jpeg",
  "parque-ecologico": "Pq.Ecológico.webp",
  "cachoeira-do-silvado": "Cachoeira.do.Silvado.jpeg",
  "quiosque-conchas": "Quiosque.Conchas.webp",
  "praia-da-barra-de-marica": "Praia.da.Barra.jpg",
  "praia-de-guaratiba": "Praia.de.Guaratiba.jpg",
  "praia-de-cordeirinho": "Praia.Cordeirinho.jpg",
  "praia-de-ponta-negra": "Praia.de.Ponta.Negra.jpeg",
  "praia-de-sacristia": "Praia.da.Sacristia.jpeg",
  "praia-de-jacone": "Praia.de.Jaconé.jpeg",
  "praia-de-itaipuacu": "Praia.de.Itaipuaçu.jpeg",
  "praia-do-frances": "Praia.do.Francês.jpg",
  "praia-do-recanto": "Praia.do.Recanto.webp",
  "praia-da-aeronautica": "Praia.da.Aeronáutica.jpeg",
  "praca-orlando-de-barros-pimentel": "Praca-Orlando-de-Barros-Pimentel.webp",
  "parque-linear-do-flamengo": "P.Linear.do.Flamengo.jpeg",
  "praca-nossa-senhora-das-gracas": "Pca.N.Sra.das.Gracas.jpeg",
  "praca-dos-times": "Praca.dos.Times.jpg",
  "praca-da-70": "Praça.da.70.jpg",
  "praca-do-barroco": "PRACA-DO-BARROCO-3.jpg",
  "pedra-do-macaco": "Pedra.do.Macaco.jpg",
  "serra-do-camburi": "Serra.do.Camburi.jpg",
  "pedra-do-silvado": "Pedra-do-Silvado.jpg",
  "vale-de-sao-francisco": "Vale.de.S.Francisco.jpg",
  "pico-da-lagoinha": "Pico-da-Lagoinha.webp",
  "mirante-de-jacone": "Mirante.de.Jaconé.jpeg",
  "ponta-da-galeta": "Ponta.da.Galeta.jpeg",
  "mirante-do-caju": "Mirante.do.Caju.jpg",
  "pedra-de-inoa": "Pedra.de.Inoã.jpg",
  "gruta-do-spar": "Gruta.do.Spar.jpeg",
  "tunel-da-antiga-estrada-de-ferro-marica": "Tunel.Antiga.Estr.Ferro.webp",
  "pedra-do-elefante": "Pedra.do Elefante-Alto.Mourao.webp",
  "pedra-de-itaocaia": "Pedra.de.Itaocaia.jpg",
  "mirante-de-itaipuacu": "Mirante.Itaipuaçu.jpg",
  "caminhos-de-darwin": "Caminhos.de.Darwin.jpeg",
  "morro-da-peca": "Morro-da-Peca-webp.webp",
  "farol-das-ilhas-maricas": "Farol.das.Ilhas.Marica.jpeg",
  "feira-livre-de-sao-bento-da-lagoa": "feiralivre.jpg"
};

function getCommentsForPlace(p) {
  let hash = 0;
  const str = p.id || p.nome;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const random = (max) => {
    let x = Math.sin(hash++) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  };

  const names = ["Maria", "João", "Ana", "Carlos", "Beatriz", "Lucas", "Juliana", "Rafael", "Camila", "Felipe", "Letícia", "Marcos", "Bruna", "Pedro"];
  const initials = ["S.", "P.", "M.", "A.", "C.", "T.", "V.", "F.", "L.", "R."];
  const intros = ["Lugar incrível!", "Que natureza linda.", "Vale muito a visita.", "Passeio excelente.", "Que paz!", "Sensacional.", "Surpreendente.", "Ótima experiência."];
  // Finais com consciência ambiental
  const ends = [
    "Levei meu lixo de volta, como todo mundo deveria fazer.",
    "Peço a todos: não deixem lixo, vamos preservar!",
    "Fui com meus filhos e aproveitei para falar sobre preservação.",
    "Recolhi algumas garrafas que outras pessoas deixaram. Vamos cuidar!",
    "Lugar para visitar com respeito à natureza.",
    "Que continue assim, limpo e preservado.",
    "Natureza assim só existe se cada um fizer sua parte.",
  ];

  const middlesByCategory = {
    "Áreas Protegidas": ["dá para ver como a proteção faz diferença na mata", "vi bromélias e muitas aves pelo caminho", "a trilha é bem preservada e cheia de vida", "é emocionante saber que esse lugar é protegido por lei", "a vista lá de cima mostra o quanto ainda temos de verde", "encontrei placas explicando a importância da unidade de conservação"],
    "Restauração Ecológica": ["dá para ver as mudas de restinga crescendo nas áreas cercadas", "a água está visivelmente melhor que há alguns anos", "bom ver a cidade investindo em reflorestamento", "as ilhas de vegetação já estão atraindo passarinhos", "é bonito acompanhar a recuperação do lugar", "aprendi muito sobre restinga e espécies nativas"],
    "Praias e Restinga": ["areia limpa e vegetação de restinga preservada", "vi a lagartixa-da-areia correndo entre as plantas", "praia tranquila e com dunas bem conservadas", "clima perfeito, só faltava mais lixeira, então levei meu lixo", "o mar é lindo e a restinga em volta dá um charme especial", "ótimo lugar para relaxar ouvindo as ondas"],
    "Lagoas": ["vi garças e biguás pescando no fim de tarde", "uma paz enorme ficar olhando para essa lagoa", "o pôr do sol aqui é inesquecível", "dá para observar as corujas-buraqueiras de longe", "águas tranquilas e ambiente muito familiar", "ótimo para caminhar e observar aves"],
    "Mata Atlântica": ["contato puro com a Mata Atlântica", "a água da cachoeira é limpa e geladinha", "ouvimos muitos pássaros durante a trilha", "trilha cercada de árvores enormes e muito verde", "ar puro e revigorante", "dá para sentir a força da floresta"],
    "Costões e Geologia": ["as formações rochosas são impressionantes", "é uma aula de geologia ao ar livre", "vi peixes coloridos nas águas claras", "a erosão esculpiu formas lindas nas pedras", "a vista do costão para o mar é de tirar o fôlego", "rochas com bilhões de anos, que coisa incrível"],
    "Educação Ambiental": ["aprendi muito sobre o meio ambiente da região", "ótimo passeio para levar as crianças e a escola", "um exemplo de convivência entre gente e natureza", "conhecemos produtores locais e saberes tradicionais", "excelente para entender a biodiversidade de Maricá", "saí de lá com outra visão sobre preservação"],
    "default": ["natureza muito bem cuidada", "bem tranquilo e limpo", "ambiente agradável e preservado"],
  };

  const category = p.categoria || "default";
  const middlePool = middlesByCategory[category] || middlesByCategory["default"];

  const generateComment = () => {
    const author = names[random(names.length)] + " " + initials[random(initials.length)];
    const intro = intros[random(intros.length)];
    const middle = middlePool[random(middlePool.length)];
    const end = ends[random(ends.length)];
    const middleFormatted = middle.charAt(0).toUpperCase() + middle.slice(1);
    return { author, text: `${intro} ${middleFormatted}. ${end}` };
  };

  const c1 = generateComment();
  const c2 = generateComment();
  if (c1.author === c2.author) {
    c2.author = names[random(names.length)] + " " + initials[random(initials.length)];
  }

  return [c1, c2];
}

function renderCommentItem(c) {
  const author = String(c.author || "Visitante");
  const stars = Number(c.stars) || 0;
  let when = "";
  if (c.date) {
    try {
      when = new Date(c.date).toLocaleDateString(state.lang === "pt-BR" ? "pt-BR" : state.lang, { day: "2-digit", month: "short" });
    } catch { when = ""; }
  }
  return `
    <div class="comment-item">
      <div class="comment-avatar">${escapeHtml(author.charAt(0).toUpperCase())}</div>
      <div>
        <div class="comment-author">${escapeHtml(author)}${stars ? ` <span class="comment-stars">${"★".repeat(stars)}</span>` : ""}${when ? ` <span class="comment-date">· ${escapeHtml(when)}</span>` : ""}</div>
        <div class="comment-text">${escapeHtml(c.text || "")}</div>
      </div>
    </div>`;
}

const commentsCache = {};
async function loadServerComments(card, id) {
  const listEl = card.querySelector("[data-comments]");
  if (!listEl) return;
  try {
    if (!commentsCache[id]) {
      const r = await apiGet(`/api/comment?id=${encodeURIComponent(id)}`);
      commentsCache[id] = Array.isArray(r.comments) ? r.comments : [];
    }
    const list = commentsCache[id];
    if (list.length) listEl.innerHTML = list.slice(0, 6).map(renderCommentItem).join("");
  } catch {
    // mantém os comentários gerados localmente
  }
}

function tData(text, lang) {
  if (!text || lang === "pt-BR") return text;
  let t = String(text).trim();
  
  // 1. Tenta correspondência exata primeiro
  if (DATA_DICT[t] && DATA_DICT[t][lang]) {
    return DATA_DICT[t][lang];
  }
  
  // 2. Substituição em pedaços com proteção contra corte de palavras
  const sortedKeys = Object.keys(DATA_DICT).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // O (?<![a-zA-ZÀ-ÿ]) garante que não há uma letra colada antes do termo.
    // Assim, "de " solto é traduzido, mas o "de " dentro de "pode " é ignorado.
    const regex = new RegExp(`(?<![a-zA-ZÀ-ÿ])` + escapedKey, 'gi');
    
    t = t.replace(regex, (match) => {
        return DATA_DICT[key][lang];
    });
  }
  
  t = t.replace(/Gratuito\./gi, DATA_DICT["Gratuito"][lang]);
  t = t.replace(/Necessário agendamento\./gi, DATA_DICT["Necessário agendamento"][lang]);

  return t;
}

function $(sel) { return document.querySelector(sel); }

// NOVA VERSÃO BLINDADA: Evita que o chat quebre os códigos ao você copiar
function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .split("&").join("&" + "amp;")
    .split("<").join("&" + "lt;")
    .split(">").join("&" + "gt;")
    .split('"').join("&" + "quot;")
    .split("'").join("&" + "#039;");
}

function stripAccents(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugify(s) {
  return stripAccents(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ====== LÓGICA DO TEMA ======
function initTheme() {
  const themeToggleBtn = document.getElementById("themeToggle");
  if (!themeToggleBtn) return;

  const currentTheme = localStorage.getItem("ecomarica_theme") || 
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeToggleBtn.textContent = theme === "light" ? "🌙" : "☀️";
    localStorage.setItem("ecomarica_theme", theme);
  }

  applyTheme(currentTheme);

  themeToggleBtn.addEventListener("click", () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    applyTheme(isLight ? "dark" : "light");
  });
}

function loadAnalytics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { byId: {}, meta: { createdAt: new Date().toISOString() } };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("bad");
    parsed.byId ||= {};
    parsed.meta ||= { createdAt: new Date().toISOString() };
    return parsed;
  } catch {
    return { byId: {}, meta: { createdAt: new Date().toISOString() } };
  }
}

function saveAnalytics(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function ensureEntry(state, id) {
  state.byId[id] ||= {
    clicks: 0,
    ratingCount: 0,
    ratingSum: 0,
    likes: 0,
    visits: 0,
    comments: 0,
    lastRatedAt: null,
  };
  return state.byId[id];
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  return await res.json();
}

async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  return await res.json();
}

function mergeAnalyticsEntryFromServer(entry, raw) {
  const server = {
    clicks: Number(raw.clicks ?? 0),
    ratingCount: Number(raw.ratingCount ?? 0),
    ratingSum: Number(raw.ratingSum ?? 0),
  };

  const lc = Number(entry.clicks) || 0;
  entry.clicks = Math.max(lc, server.clicks);

  const lrc = Number(entry.ratingCount) || 0;
  const lrs = Number(entry.ratingSum) || 0;

  if (server.ratingCount > lrc) {
    entry.ratingCount = server.ratingCount;
    entry.ratingSum = server.ratingSum;
  } else if (server.ratingCount < lrc) {
    // Mantém local
  } else if (server.ratingCount > 0) {
    entry.ratingSum = Math.max(lrs, server.ratingSum);
  }

  // Curtidas, intenções de visita e comentários: o servidor é a fonte da verdade
  for (const f of ["likes", "visits", "comments"]) {
    if (raw[f] !== undefined) entry[f] = Math.max(0, Number(raw[f]) || 0);
  }
}

async function syncFromServer() {
  const data = await apiGet("/api/stats");
  if (!data || typeof data !== "object") return;
  
  const items = data.byId ? data.byId : data;
  
  for (const [id, raw] of Object.entries(items)) {
    if (typeof raw !== "object" || !raw) continue;
    const entry = ensureEntry(state.analytics, id);
    mergeAnalyticsEntryFromServer(entry, raw);
  }
  saveAnalytics(state.analytics);
}

async function bootstrapServerPoints(points) {
  const ids = Array.from(new Set(points.map((p) => p.id).filter(Boolean)));
  if (ids.length === 0) return;
  const meta = {};
  for (const p of points) {
    meta[p.id] = {
      nome: p.nome,
      categoria: p.categoria,
      bairro: p.bairro || "",
      protegida: isProtectedPlace(p),
    };
  }
  await apiPost("/api/bootstrap", { ids, meta });
}

// Conta o visitante uma única vez por navegador
function registerVisitor() {
  try {
    if (localStorage.getItem("ecomarica_visitor")) return;
    localStorage.setItem("ecomarica_visitor", String(Date.now()));
  } catch {
    return;
  }
  apiPost("/api/event", { type: "visitor" }).catch(() => {});
}

function isProtectedPlace(p) {
  return /APA|Parque Estadual|Monumento Natural|Refúgio|REVIS|Geossítio|patrimônio/i.test(p.protecao || "");
}

function t(key, lang) {
  return I18N[lang]?.[key] ?? I18N[DEFAULT_LANG][key] ?? key;
}

function setLang(lang) {
  document.documentElement.lang = lang === "pt-BR" ? "pt-BR" : lang;
  localStorage.setItem("ecomarica_lang", lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    const val = t(k, lang);
    if (typeof val === "function") return;
    el.textContent = val;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const k = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(k, lang));
  });
}

// DE VOLTA PARA A VERSÃO SIMPLES: Sem encodeURIComponent
function getImageUrl(ponto) {
  const slug = slugify(ponto.nome);
  const filename = IMAGE_MAP[slug];
  
  return filename ? `./imagens/${filename}` : '';
}

function parseDocTextToPoints(text) {
  // Pré-filtro para texto grudado
  const fixedText = text
    .replace(/Nome:/g, "\nNome:")
    .replace(/Bairro\/Regi[ãa]o:/g, "\nBairro/Região:")
    .replace(/Localiza[çc][ãa]o:/g, "\nLocalização:")
    .replace(/Hor[áa]rio de funcionamento:/g, "\nHorário de funcionamento:")
    .replace(/Pre[çc]o:/g, "\nPreço:")
    .replace(/Acesso:/g, "\nAcesso:")
    .replace(/Descri[çc][ãa]o/g, "\nDescrição")
    .replace(/N[úu]mero do processo/g, "\nNúmero do processo")
    .replace(/Documento:/g, "\nDocumento:")
    .replace(/Fonte:/g, "\nFonte:")
    .replace(/Prote[çc][ãa]o:/g, "\nProteção:")
    .replace(/Dica ecol[óo]gica:/g, "\nDica ecológica:");

  const lines = fixedText
    .split(/\r?\n/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const cats = new Set([
    "Áreas Protegidas",
    "Restauração Ecológica",
    "Praias e Restinga",
    "Lagoas",
    "Mata Atlântica",
    "Costões e Geologia",
    "Educação Ambiental",
  ]);

  let categoria = null;
  let cur = null;
  const out = [];

  const commit = () => {
    if (!cur) return;
    if (!cur.nome) return;
    cur.id = slugify(`${cur.categoria}-${cur.nome}`);
    out.push(cur);
    cur = null;
  };

  for (const line of lines) {
    if (cats.has(line)) {
      categoria = line;
      continue;
    }
    if (/^Pontos Tur/i.test(line)) continue;
    if (/^Ecologia em Maric/i.test(line)) continue;
    if (/^OBS:/i.test(line)) continue;

    if (/^Nome:/i.test(line)) {
      commit();
      cur = { categoria, nome: line.split(":", 2)[1].trim() };
      continue;
    }
    if (!cur) continue;

    const write = (key, value) => {
      if (!value) return;
      if (key === "descricao" && cur.descricao) {
        cur.descricao = `${cur.descricao} ${value}`.trim();
      } else {
        cur[key] = value;
      }
    };

    const kv = (prefix, key) => {
      if (!line.startsWith(prefix)) return false;
      write(key, line.slice(prefix.length).trim());
      return true;
    };

    if (kv("Bairro/Região:", "bairro")) continue;
    if (kv("Bairro/Regio:", "bairro")) continue;
    if (kv("Localização:", "maps")) continue;
    if (kv("Localizao:", "maps")) continue;
    if (kv("Horário de funcionamento:", "horario")) continue;
    if (kv("Horrio de funcionamento:", "horario")) continue;
    if (kv("Preço:", "preco")) continue;
    if (kv("Preo:", "preco")) continue;
    if (kv("Acesso:", "acesso")) continue;
    
    // --- CORREÇÃO: Captura a 'Descrição:' padrão e a de tombamento ---
    if (kv("Descrição:", "descricao")) continue;
    if (kv("Descrio:", "descricao")) continue;
    if (kv("Descrição (tombamento):", "descricao")) continue;
    if (kv("Descrio (tombamento):", "descricao")) continue;
    if (kv("Descrição (en):", "descricao_en")) continue;
    if (kv("Descrição (es):", "descricao_es")) continue;
    if (kv("Descrição (zh):", "descricao_zh")) continue;
    
    if (kv("Número do processo de tombamento:", "tombamentoProcesso")) continue;
    if (kv("Nmero do processo de tombamento:", "tombamentoProcesso")) continue;
    if (kv("Documento:", "documento")) continue;
    if (kv("Fonte:", "fonte")) continue;
    if (kv("Proteção:", "protecao")) continue;
    if (kv("Dica ecológica:", "dica")) continue;

    if (cur.descricao) cur.descricao = `${cur.descricao} ${line}`.trim();
  }
  commit();

  return out;
}

function computeStats(points, analyticsState) {
  let totalClicks = 0;
  let totalRatingVotes = 0;
  let totalLikes = 0;
  for (const p of points) {
    const e = analyticsState.byId[p.id];
    totalClicks += e?.clicks ?? 0;
    totalRatingVotes += e?.ratingCount ?? 0;
    totalLikes += e?.likes ?? 0;
  }
  return { total: points.length, totalRatingVotes, totalClicks, totalLikes };
}

function renderChips(categories, active, lang) {
  const root = $("#categoryChips");
  root.innerHTML = "";

  const makeChip = (value, label) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = value === "__ALL__" ? label : tData(label, lang);
    btn.setAttribute("aria-pressed", value === active ? "true" : "false");
    btn.addEventListener("click", () => {
      state.activeCategory = value;
      renderAll();
    });
    root.appendChild(btn);
  };

  makeChip("__ALL__", t("all", lang));
  for (const c of categories) makeChip(c, c);
}

function renderCard(p, analyticsState, lang) {
  const e = analyticsState.byId[p.id] || { clicks: 0, ratingCount: 0, ratingSum: 0 };
  const avg = e.ratingCount ? e.ratingSum / e.ratingCount : 0;

  const mapHref = p.maps?.startsWith("http") ? p.maps : null;
  
  let mapEmbedUrl = "";
  if (mapHref) {
    const q = encodeURIComponent(`${p.nome}, Maricá, RJ`);
    mapEmbedUrl = `https://maps.google.com/maps?q=${q}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }

  const metaBits = [];
  if (p.bairro) metaBits.push({ label: `${t("neighborhood", lang)}: ${tData(p.bairro, lang)}` });
  if (p.horario) metaBits.push({ label: `${t("hours", lang)}: ${tData(p.horario, lang)}` });
  if (p.preco) metaBits.push({ label: `${t("price", lang)}: ${tData(p.preco, lang)}` });
  if (p.acesso) metaBits.push({ label: `${t("access", lang)}: ${tData(p.acesso, lang)}` });

  const img = getImageUrl(p);
  
  let descToUse = p.descricao || p.categoria;
  if (lang === 'en' && p.descricao_en) descToUse = p.descricao_en;
  if (lang === 'es' && p.descricao_es) descToUse = p.descricao_es;
  if (lang === 'zh' && p.descricao_zh) descToUse = p.descricao_zh;

  const comments = getCommentsForPlace(p);

  const isProtected = isProtectedPlace(p);
  let tipToUse = p.dica || "";
  if (lang !== "pt-BR" && CATEGORY_TIPS[p.categoria]?.[lang]) tipToUse = CATEGORY_TIPS[p.categoria][lang];

  return `
    <div class="card-wrapper">
      <article class="card" data-id="${escapeHtml(p.id)}">
        <button class="card__close" aria-label="Fechar">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <div class="card__media">
          <img class="card__img" src="${escapeHtml(img)}" alt="${escapeHtml(p.nome)}" loading="lazy" />
          <div class="card__overlay">
            ${p.categoria ? `<span class="tag">${escapeHtml(tData(p.categoria, lang))}</span>` : ""}
            ${isProtected ? `<span class="tag tag--protected">🛡️ ${escapeHtml(t("protectedArea", lang))}</span>` : ""}
          </div>
        </div>
        
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(p.nome)}</h3>
          ${p.protecao ? `<div class="card__protection" title="${escapeHtml(t("protection", lang))}">🌿 ${escapeHtml(p.protecao)}</div>` : ""}
          <div class="card__meta">
            ${metaBits.map(m => `<span>• ${escapeHtml(m.label)}</span>`).join("")}
          </div>
          
          <div class="card__expanded-content">
            <p class="card__desc">${escapeHtml(descToUse || t("defaultDesc", lang))}</p>
            ${tipToUse ? `<div class="card__eco-tip"><span aria-hidden="true">♻️</span><div><strong>${escapeHtml(t("ecoTip", lang))}</strong>${escapeHtml(tipToUse)}</div></div>` : ""}
            
            <div class="card__expanded-row">
              ${mapEmbedUrl ? `
                <div class="card__map-container">
                  <iframe class="card__map-iframe" src="${mapEmbedUrl}" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
              ` : ""}
              
              <div class="card__comments">
                <div class="comments__title">💬 ${escapeHtml(t("commentsTitle", lang))} <span class="comments__count">${escapeHtml(t("commentsCount", lang)(e.comments || comments.length))}</span></div>
                <div class="comments__list" data-comments>
                  ${comments.map(renderCommentItem).join("")}
                </div>
                <form class="comment-form" data-comment-form>
                  <input class="comment-form__name" name="author" maxlength="40" placeholder="${escapeHtml(t("commentName", lang))}" />
                  <textarea class="comment-form__text" name="text" maxlength="400" rows="2" required placeholder="${escapeHtml(t("commentText", lang))}"></textarea>
                  <div class="comment-form__row">
                    <span class="comment-form__status" aria-live="polite"></span>
                    <button class="link comment-form__send" type="submit">${escapeHtml(t("commentSend", lang))}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div class="card__footer">
          <div class="stars" aria-label="${escapeHtml(t("rate", lang))}">
            <div class="stars__buttons">
              ${[1, 2, 3, 4, 5].map((n) => {
                  const userRating = e.myRating || 0;
                  const pressed = userRating >= n ? "true" : "false";
                  return `<button class="star-btn" type="button" data-rate="${n}" aria-pressed="${pressed}" aria-label="${n}">★</button>`;
                }).join("")}
            </div>
            <div class="stars__summary">${escapeHtml(t("ratingSummary", lang)(avg, e.ratingCount || 0))}</div>
          </div>
          <div class="card__actions">
            <div style="display: flex; gap: 8px;">
              ${mapHref ? `<a class="link" href="${escapeHtml(mapHref)}" target="_blank" rel="noreferrer noopener" data-action="map">${escapeHtml(t("openMap", lang))}</a>` : ""}
              
              <button class="link share-btn" type="button" aria-label="Compartilhar" data-share-title="${escapeHtml(p.nome)}" data-share-url="${escapeHtml(mapHref || window.location.href)}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
            </div>

            <div class="clicks"><span data-clicks>${e.clicks || 0}</span> ${escapeHtml(t("clicks", lang))}</div>
          </div>
          <div class="card__eco-actions">
            <button class="eco-btn like-btn" type="button" data-action="like" aria-pressed="${e.myLike ? "true" : "false"}" aria-label="${escapeHtml(t("like", lang))}">
              <span aria-hidden="true">${e.myLike ? "💚" : "🤍"}</span> <span data-likes>${e.likes || 0}</span>
            </button>
            <button class="eco-btn visit-btn" type="button" data-action="visit" aria-pressed="${e.myVisit ? "true" : "false"}" title="${escapeHtml(t("visitsLabel", lang)(e.visits || 0))}">
              <span aria-hidden="true">🧭</span> <span data-visit-label>${escapeHtml(e.myVisit ? t("visitDone", lang) : t("visitBtn", lang))}</span> · <span data-visits>${e.visits || 0}</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  `;
}

function wireCardEvents(points, lang) {
  const grid = $("#grid");
  const analytics = state.analytics;

  grid.querySelectorAll(".card").forEach((card) => {
    const id = card.getAttribute("data-id");
    const p = points.find((x) => x.id === id);
    if (!p) return;

    card.addEventListener("click", (e) => {
      if(e.target.closest('.star-btn') || e.target.closest('.link') || e.target.closest('.card__close') || e.target.closest('.eco-btn') || e.target.closest('[data-comment-form]')) {
        return;
      }
      
      document.querySelectorAll('.card.is-expanded').forEach(c => {
        if (c !== card) {
          c.classList.remove('is-expanded');
          c.closest('.card-wrapper').style.zIndex = '';
        }
      });
      
      card.classList.add('is-expanded');
      card.closest('.card-wrapper').style.zIndex = '200';
      
      const overlay = document.getElementById("page-overlay");
      if (overlay) overlay.classList.add('is-active');
    });

    const closeBtn = card.querySelector('.card__close');
    if(closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        card.classList.remove('is-expanded');
        card.closest('.card-wrapper').style.zIndex = ''; 
        
        const overlay = document.getElementById("page-overlay");
        if (overlay) overlay.classList.remove('is-active');
      });
    }

    const shareBtn = card.querySelector('.share-btn');
    if (shareBtn) {
      shareBtn.addEventListener("click", async (e) => {
        e.stopPropagation(); 
        const title = shareBtn.getAttribute('data-share-title');
        const url = shareBtn.getAttribute('data-share-url');
        const text = t("shareText", state.lang)(title);

        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: text,
              url: url
            });
          } catch (err) {
            console.log('Compartilhamento cancelado ou falhou', err);
          }
        } else {
          try {
            await navigator.clipboard.writeText(`${text} - ${url}`);
            const originalIcon = shareBtn.innerHTML;
            shareBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            setTimeout(() => { shareBtn.innerHTML = originalIcon; }, 2000);
          } catch (err) {
            console.log('Falha ao copiar', err);
          }
        }
      });
    }

    // Carrega comentários reais ao abrir o card
    card.addEventListener("click", () => {
      if (card.classList.contains("is-expanded")) loadServerComments(card, id);
    });

    // Curtir / descurtir
    const likeBtn = card.querySelector('[data-action="like"]');
    if (likeBtn) {
      likeBtn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const entry = ensureEntry(analytics, id);
        const liking = !entry.myLike;
        entry.myLike = liking;
        entry.likes = Math.max(0, (entry.likes || 0) + (liking ? 1 : -1));
        saveAnalytics(analytics);
        likeBtn.setAttribute("aria-pressed", liking ? "true" : "false");
        likeBtn.querySelector("span").textContent = liking ? "💚" : "🤍";
        likeBtn.querySelector("[data-likes]").textContent = String(entry.likes);
        renderStats();
        try {
          const r = await apiPost("/api/event", { type: liking ? "like" : "unlike", id });
          entry.likes = Number(r.likes ?? entry.likes);
          saveAnalytics(analytics);
          likeBtn.querySelector("[data-likes]").textContent = String(entry.likes);
          renderStats();
        } catch {}
      });
    }

    // Quero visitar (uma vez por pessoa)
    const visitBtn = card.querySelector('[data-action="visit"]');
    if (visitBtn) {
      visitBtn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const entry = ensureEntry(analytics, id);
        if (entry.myVisit) return;
        entry.myVisit = true;
        entry.visits = (entry.visits || 0) + 1;
        saveAnalytics(analytics);
        visitBtn.setAttribute("aria-pressed", "true");
        visitBtn.querySelector("[data-visit-label]").textContent = t("visitDone", state.lang);
        visitBtn.querySelector("[data-visits]").textContent = String(entry.visits);
        try {
          const r = await apiPost("/api/event", { type: "visit", id });
          entry.visits = Number(r.visits ?? entry.visits);
          saveAnalytics(analytics);
          visitBtn.querySelector("[data-visits]").textContent = String(entry.visits);
        } catch {}
      });
    }

    // Enviar comentário
    const form = card.querySelector("[data-comment-form]");
    if (form) {
      form.addEventListener("click", (ev) => ev.stopPropagation());
      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const status = form.querySelector(".comment-form__status");
        const author = form.author.value.trim();
        const text = form.text.value.trim();
        if (text.length < 3) return;
        const entry = ensureEntry(analytics, id);
        const btn = form.querySelector("button[type=submit]");
        btn.disabled = true;
        try {
          const r = await apiPost("/api/comment", { id, author, text, stars: entry.myRating || 0 });
          const c = r.comment || { author: author || "Visitante", text, stars: entry.myRating || 0, date: new Date().toISOString() };
          commentsCache[id] = [c, ...(commentsCache[id] || [])];
          card.querySelector("[data-comments]").insertAdjacentHTML("afterbegin", renderCommentItem(c));
          entry.comments = Number(r.comments ?? (entry.comments || 0) + 1);
          saveAnalytics(analytics);
          const countEl = card.querySelector(".comments__count");
          if (countEl) countEl.textContent = t("commentsCount", state.lang)(entry.comments);
          form.reset();
          status.textContent = t("commentThanks", state.lang);
        } catch {
          status.textContent = t("commentError", state.lang);
        } finally {
          btn.disabled = false;
        }
      });
    }

    const incrementClickLocal = () => {
      const entry = ensureEntry(analytics, id);
      entry.clicks += 1;
      saveAnalytics(analytics);
      card.querySelector("[data-clicks]").textContent = String(entry.clicks);
      renderStats();
    };

    const map = card.querySelector('[data-action="map"]');
    if (map)
      map.addEventListener("click", async () => {
        incrementClickLocal();
        try {
          const r = await apiPost("/api/click", { id });
          const entry = ensureEntry(analytics, id);
          entry.clicks = Number(r.clicks || entry.clicks);
          entry.ratingCount = Number(r.ratingCount || entry.ratingCount);
          entry.ratingSum = Number(r.ratingSum || entry.ratingSum);
          saveAnalytics(analytics);
          
          await syncFromServer();
          renderAll(); 
        } catch (e) {
          console.warn("Clique salvo apenas localmente.", e);
        }
      });

    card.querySelectorAll(".star-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const entry = ensureEntry(analytics, id);
        const n = Number(btn.getAttribute("data-rate"));
        
        if (entry.myRating === n) return;

        const oldRating = entry.myRating || 0;
        
        if (oldRating > 0) {
          entry.ratingSum = entry.ratingSum - oldRating + n;
        } else {
          entry.ratingCount += 1;
          entry.ratingSum += n;
        }
        
        entry.myRating = n;
        entry.lastRatedAt = new Date().toISOString();
        
        saveAnalytics(analytics);
        renderAll();

        try {
          const r = await apiPost("/api/rate", { id, stars: n, oldStars: oldRating });
          
          entry.clicks = Number(r.clicks || entry.clicks);
          entry.ratingCount = Number(r.ratingCount || entry.ratingCount);
          entry.ratingSum = Number(r.ratingSum || entry.ratingSum);
          entry.lastRatedAt = new Date().toISOString();
          saveAnalytics(analytics);
          
          await syncFromServer();
          renderAll(); 
        } catch {
          // Mantém cache
        }
      });
    });
  });
}

function renderStats() {
  const { total, totalRatingVotes, totalClicks, totalLikes } = computeStats(
    state.points,
    state.analytics,
  );
  const likesEl = $("#statLikes");
  if (likesEl) likesEl.textContent = String(totalLikes);
  $("#statTotal").textContent = String(total);
  $("#statRated").textContent = String(totalRatingVotes);
  $("#statClicks").textContent = String(totalClicks);
}

function renderAll() {
  const lang = state.lang;
  const q = stripAccents($("#searchInput").value || "");
  const active = state.activeCategory;

  const filtered = state.points.filter((p) => {
    if (active && active !== "__ALL__" && p.categoria !== active) return false;
    if (!q) return true;
    
    const searchString = `${p.nome} ${tData(p.bairro, lang) || ""} ${tData(p.categoria, lang) || ""} ${p.categoria || ""} ${p.protecao || ""}`;
    const hay = stripAccents(searchString);
    return hay.includes(q);
  });

  state.filteredPoints = filtered;

  renderChips(state.categories, active, lang);

  const grid = $("#grid");
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty">${escapeHtml(t("noResults", lang))}</div>`;
  } else {
    grid.innerHTML = filtered.map((p) => renderCard(p, state.analytics, lang)).join("");
  }

  wireCardEvents(filtered, lang);
  renderStats();
}

async function loadDocxPoints() {
  const res = await fetch(DOCX_PATH);
  if (!res.ok) throw new Error(`Falha ao carregar DOCX: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();

  const { value: rawText } = await mammoth.extractRawText({ arrayBuffer });
  return parseDocTextToPoints(rawText);
}

let iframeClickDebounce = {};
window.addEventListener('blur', () => {
  setTimeout(async () => {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.tagName === 'IFRAME' && activeEl.classList.contains('card__map-iframe')) {
      const card = activeEl.closest('.card');
      if (!card) return;
      
      const id = card.getAttribute('data-id');
      if (!id) return;

      const now = Date.now();
      if (iframeClickDebounce[id] && (now - iframeClickDebounce[id] < 2000)) {
        window.focus(); 
        return;
      }
      iframeClickDebounce[id] = now;

      const entry = ensureEntry(state.analytics, id);
      entry.clicks += 1;
      saveAnalytics(state.analytics);
      
      const clicksEl = card.querySelector('[data-clicks]');
      if (clicksEl) clicksEl.textContent = String(entry.clicks);
      renderStats();

      window.focus();

      try {
        const r = await apiPost("/api/click", { id });
        entry.clicks = Number(r.clicks || entry.clicks);
        entry.ratingCount = Number(r.ratingCount || entry.ratingCount);
        entry.ratingSum = Number(r.ratingSum || entry.ratingSum);
        saveAnalytics(state.analytics);
        
        if (clicksEl) clicksEl.textContent = String(entry.clicks);
        renderStats();
        syncFromServer(); 
      } catch (e) {
      }
    }
  }, 100);
});

function initOverlay() {
  let overlay = document.getElementById("page-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "page-overlay";
    overlay.className = "page-overlay";
    document.body.appendChild(overlay);

    overlay.addEventListener("click", () => {
      document.querySelectorAll('.card.is-expanded').forEach(c => {
        c.classList.remove('is-expanded');
        c.closest('.card-wrapper').style.zIndex = '';
      });
      overlay.classList.remove('is-active');
    });
  }
}

// ====== ALERTA AMBIENTAL + COMPROMISSO DO VISITANTE ======
function loadPledge() {
  try { return JSON.parse(localStorage.getItem("ecomarica_pledge") || "[]"); } catch { return []; }
}
function savePledge(list) {
  try { localStorage.setItem("ecomarica_pledge", JSON.stringify(list)); } catch {}
}

function renderEcoSection() {
  const lang = state.lang;

  const alertEl = $("#ecoAlert");
  if (alertEl) {
    let hidden = false;
    try { hidden = sessionStorage.getItem("ecomarica_alert_hidden") === "1"; } catch {}
    alertEl.hidden = hidden;
    alertEl.innerHTML = `
      <div class="eco-alert__icon" aria-hidden="true">⚠️</div>
      <div>
        <p class="eco-alert__title">${escapeHtml(t("alertTitle", lang))}</p>
        <p class="eco-alert__text">${escapeHtml(t("alertText", lang))}</p>
      </div>
      <button class="eco-alert__close" type="button" aria-label="${escapeHtml(t("close", lang))}">✕</button>`;
    alertEl.querySelector(".eco-alert__close").addEventListener("click", () => {
      alertEl.hidden = true;
      try { sessionStorage.setItem("ecomarica_alert_hidden", "1"); } catch {}
    });
  }

  const guide = $("#ecoGuide");
  if (!guide) return;
  const rules = t("rules", lang);
  const checked = new Set(loadPledge());
  guide.innerHTML = `
    <div class="section__header">
      <h2 class="section__title">${escapeHtml(t("guideTitle", lang))}</h2>
      <p class="section__hint">${escapeHtml(t("guideHint", lang))}</p>
    </div>
    <div class="eco-guide__grid">
      ${rules.map(([icon, text], i) => `
        <label class="eco-rule ${checked.has(i) ? "is-checked" : ""}">
          <input type="checkbox" data-rule="${i}" ${checked.has(i) ? "checked" : ""} />
          <span class="eco-rule__icon" aria-hidden="true">${icon}</span>
          <span class="eco-rule__text">${escapeHtml(text)}</span>
        </label>`).join("")}
    </div>
    <div class="eco-guide__status" aria-live="polite"></div>`;

  const status = guide.querySelector(".eco-guide__status");
  const updateStatus = () => {
    const n = checked.size;
    status.textContent = n === rules.length ? t("guideDone", lang) : t("guideProgress", lang)(n, rules.length);
  };
  updateStatus();

  guide.querySelectorAll("input[data-rule]").forEach((inp) => {
    inp.addEventListener("change", () => {
      const i = Number(inp.getAttribute("data-rule"));
      if (inp.checked) checked.add(i); else checked.delete(i);
      inp.closest(".eco-rule").classList.toggle("is-checked", inp.checked);
      savePledge([...checked]);
      updateStatus();

      // Conta cada compromisso só uma vez por pessoa
      if (inp.checked) {
        let sent = [];
        try { sent = JSON.parse(localStorage.getItem("ecomarica_pledge_sent") || "[]"); } catch {}
        if (!sent.includes(i)) {
          sent.push(i);
          const complete = sent.length === rules.length;
          try { localStorage.setItem("ecomarica_pledge_sent", JSON.stringify(sent)); } catch {}
          apiPost("/api/event", { type: "pledge", rule: i, complete }).catch(() => {});
        }
      }
    });
  });
}

const state = {
  lang: DEFAULT_LANG,
  points: [],
  filteredPoints: [],
  categories: [],
  activeCategory: "__ALL__",
  analytics: loadAnalytics(),
};

async function main() {
  initTheme();
  initOverlay();

  const savedLang = localStorage.getItem("ecomarica_lang");
  state.lang = savedLang && I18N[savedLang] ? savedLang : DEFAULT_LANG;
  $("#languageSelect").value = state.lang;
  setLang(state.lang);

  $("#languageSelect").addEventListener("change", (e) => {
    state.lang = e.target.value;
    setLang(state.lang);
    if (state.loadedCount) $("#docHint").textContent = t("loaded", state.lang)(state.loadedCount);
    renderEcoSection();
    renderAll();
  });

  $("#searchInput").addEventListener("input", () => renderAll());
  renderEcoSection();

  try {
    let points = await loadDocxPoints();
    
    // Filtro mantido desativado para exibir todos os 73 pontos
    // points = points.filter(p => !!IMAGE_MAP[slugify(p.nome)]);

    state.points = points;
    state.filteredPoints = points;
    state.categories = Array.from(
      new Set(points.map((p) => p.categoria).filter(Boolean)),
    ); // mantém a ordem do Word

    state.loadedCount = points.length;
    $("#docHint").textContent = t("loaded", state.lang)(points.length);

    renderAll();

    registerVisitor();

    bootstrapServerPoints(points).catch((err) => {
      console.warn("Aviso: Falha isolada no bootstrap (pode ser ignorado).", err);
    });

    try {
      await syncFromServer();
      renderAll(); 
    } catch (syncErr) {
      console.warn("Aviso: Falha ao puxar os status globais na inicialização.", syncErr);
    }

  } catch (err) {
    $("#docHint").textContent =
      "Não consegui ler o arquivo Word. Verifique se o `Ecologia em Maricá.docx` está na pasta e com o mesmo nome.";
    $("#grid").innerHTML = `<div class="empty">${escapeHtml(String(err.message || err))}</div>`;
  }
}

main();