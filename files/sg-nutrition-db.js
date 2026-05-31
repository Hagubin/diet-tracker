/**
 * Singapore-common foods — approximate kcal from public nutrition labels / typical servings.
 * Drinks catalog: files/sg-nutrition-drinks.js (lazy-loaded). Not a live API.
 */
(function (global) {
  /** @type {{ name: string, aliases?: string[], meals?: string[], kcal?: number, kcalLow?: number, kcalHigh?: number, bowl?: object, plate?: object, cup?: object, can?: object, bottle?: object }[]} */
  const ENTRIES = [
    // —— Fast food: sg-fastfood-db.js + subway-meal.js (lazy-loaded with this file) ——

    // —— Hawker / home staples (ranges for build) ——
    {
      name: "Chicken rice",
      aliases: ["hainanese chicken rice", "chicken rice plate"],
      meals: ["lunch", "dinner"],
      kcalLow: 500,
      kcalHigh: 700,
      plate: { half: [250, 350], one: [500, 700], two: [1000, 1400] },
    },
    {
      name: "Char kway teow",
      aliases: ["ckt", "fried kway teow", "char kway teow", "char kuey teow"],
      meals: ["lunch", "dinner"],
      kcalLow: 550,
      kcalHigh: 750,
      plate: { half: [280, 380], one: [550, 750], two: [1100, 1500] },
    },
    {
      name: "Wanton mee",
      aliases: ["wanton noodles", "wonton mee"],
      meals: ["lunch", "dinner"],
      kcalLow: 400,
      kcalHigh: 550,
      plate: { half: [200, 280], one: [400, 550] },
    },
    {
      name: "Fish soup",
      aliases: ["fish slice soup", "teochew fish soup"],
      meals: ["lunch", "dinner"],
      kcalLow: 250,
      kcalHigh: 400,
      bowl: { half: [120, 180], one: [250, 400] },
    },
    {
      name: "Ban mian",
      aliases: ["banmian", "manual ban mian"],
      meals: ["lunch", "dinner"],
      kcalLow: 450,
      kcalHigh: 650,
      bowl: { half: [220, 320], one: [450, 650] },
    },
    {
      name: "Nasi lemak",
      aliases: ["nasi lemak plate", "lemak", "nasie lemak"],
      meals: ["breakfast", "lunch"],
      kcalLow: 500,
      kcalHigh: 750,
      plate: { half: [250, 380], one: [500, 750] },
    },
    {
      name: "Laksa",
      aliases: ["katong laksa", "nyonya laksa"],
      meals: ["lunch", "dinner"],
      kcalLow: 450,
      kcalHigh: 650,
      bowl: { half: [220, 320], one: [450, 650] },
    },
    {
      name: "Mee goreng",
      aliases: ["mamak mee goreng", "fried mee"],
      meals: ["lunch", "dinner"],
      kcalLow: 500,
      kcalHigh: 700,
      plate: { half: [250, 350], one: [500, 700] },
    },
    {
      name: "Roti prata",
      aliases: ["prata", "roti prata 2 pieces", "plain prata"],
      meals: ["breakfast", "lunch"],
      kcalLow: 300,
      kcalHigh: 420,
      plate: { half: [150, 210], one: [300, 420] },
    },
    {
      name: "Roti prata egg",
      aliases: ["egg prata", "prata egg"],
      meals: ["breakfast", "lunch"],
      kcalLow: 420,
      kcalHigh: 550,
      plate: { one: [420, 550] },
    },
    {
      name: "Nasi padang",
      aliases: ["padang rice", "nasi padang plate"],
      meals: ["lunch", "dinner"],
      kcalLow: 600,
      kcalHigh: 900,
      plate: { half: [300, 450], one: [600, 900] },
    },
    {
      name: "Cai png",
      aliases: ["cai fan", "economy rice", "mixed rice", "caipng"],
      meals: ["lunch", "dinner"],
      kcalLow: 500,
      kcalHigh: 850,
      plate: { half: [250, 420], one: [500, 850] },
    },
    {
      name: "Thunder tea rice",
      aliases: ["lei cha fan", "hakka thunder tea"],
      meals: ["lunch", "dinner"],
      kcalLow: 400,
      kcalHigh: 550,
      plate: { one: [400, 550] },
    },
    {
      name: "Yong tau foo",
      aliases: ["ytf", "yong tau fu"],
      meals: ["lunch", "dinner"],
      kcalLow: 300,
      kcalHigh: 550,
      bowl: { one: [300, 550] },
    },
    {
      name: "Satay",
      aliases: ["satay 10 sticks", "chicken satay"],
      meals: ["lunch", "dinner"],
      kcalLow: 400,
      kcalHigh: 550,
      plate: { one: [400, 550] },
    },
    {
      name: "Prawn noodles",
      aliases: ["hokkien prawn mee", "prawn mee soup"],
      meals: ["lunch", "dinner"],
      kcalLow: 400,
      kcalHigh: 550,
      bowl: { half: [200, 280], one: [400, 550] },
    },
    {
      name: "Bak kut teh",
      aliases: ["bkt", "pork rib soup"],
      meals: ["lunch", "dinner"],
      kcalLow: 500,
      kcalHigh: 700,
      bowl: { one: [500, 700] },
    },
    {
      name: "Duck rice",
      aliases: ["roast duck rice", "duck rice plate"],
      meals: ["lunch", "dinner"],
      kcalLow: 550,
      kcalHigh: 750,
      plate: { one: [550, 750] },
    },
    {
      name: "Hokkien mee",
      aliases: ["fried hokkien mee", "hokkien prawn noodles fried"],
      meals: ["lunch", "dinner"],
      kcalLow: 500,
      kcalHigh: 650,
      plate: { one: [500, 650] },
    },
    {
      name: "Carrot cake",
      aliases: ["chai tow kway", "radish cake"],
      meals: ["breakfast", "lunch"],
      kcalLow: 400,
      kcalHigh: 550,
      plate: { half: [200, 280], one: [400, 550] },
    },
    {
      name: "Oyster omelette",
      aliases: ["orh luak", "oh jian"],
      meals: ["lunch", "dinner"],
      kcalLow: 400,
      kcalHigh: 550,
      plate: { one: [400, 550] },
    },
    {
      name: "Fish head curry",
      aliases: ["curry fish head"],
      meals: ["lunch", "dinner"],
      kcalLow: 600,
      kcalHigh: 850,
      plate: { one: [600, 850] },
    },
    {
      name: "Curry puff",
      aliases: ["currypuff", "old chang kee curry puff"],
      meals: ["breakfast", "lunch"],
      kcal: 180,
    },
    {
      name: "Popiah",
      aliases: ["spring roll popiah"],
      meals: ["lunch", "dinner"],
      kcal: 200,
    },
    {
      name: "Ice kacang",
      aliases: ["ais kacang", "ice kachang"],
      meals: ["drinks", "lunch"],
      kcal: 250,
    },
    {
      name: "Rojak",
      aliases: ["fruit rojak", "indian rojak"],
      meals: ["lunch", "dinner"],
      kcalLow: 300,
      kcalHigh: 450,
      plate: { one: [300, 450] },
    },
    {
      name: "Rice",
      aliases: ["white rice", "steamed rice"],
      meals: ["breakfast", "lunch", "dinner"],
      bowl: { half: [120, 180], twoThirds: [200, 280], one: [250, 350] },
      plate: { half: [100, 160], one: [220, 320] },
    },
    {
      name: "Noodles",
      aliases: ["yellow noodles", "mee"],
      meals: ["lunch", "dinner"],
      bowl: { half: [140, 200], one: [280, 400] },
      plate: { half: [120, 180], one: [250, 380] },
    },
    {
      name: "Broccoli",
      aliases: ["brocoli"],
      meals: ["lunch", "dinner"],
      bowl: { half: [20, 45], one: [45, 90] },
      plate: { half: [25, 55], one: [55, 110] },
    },
    {
      name: "Fish",
      aliases: ["steamed fish", "fried fish"],
      meals: ["lunch", "dinner"],
      plate: { half: [90, 150], one: [180, 280] },
    },
    {
      name: "Chicken",
      aliases: ["chicken meat", "stir fry chicken"],
      meals: ["lunch", "dinner"],
      plate: { half: [110, 180], one: [220, 340] },
    },
    {
      name: "Egg",
      aliases: ["fried egg", "half boil egg"],
      meals: ["breakfast", "lunch", "dinner"],
      kcal: 70,
      plate: { half: [35, 50], one: [70, 100] },
    },
  ];

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/[''"]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function entryNames(entry) {
    return [entry.name, ...(entry.aliases || [])].map(normalize);
  }

  function tokens(str) {
    return normalize(str)
      .split(" ")
      .filter((t) => t.length > 1);
  }

  /** One missing/extra/wrong letter for longer words (e.g. chiken → chicken). */
  function oneTypoMatch(a, b) {
    if (a === b) return true;
    if (a.length < 4 || b.length < 4) return false;
    if (Math.abs(a.length - b.length) > 1) return false;
    if (a.length === b.length) {
      let diff = 0;
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
      return diff <= 1;
    }
    const short = a.length < b.length ? a : b;
    const long = a.length < b.length ? b : a;
    for (let i = 0; i < long.length; i++) {
      if (long.slice(0, i) + long.slice(i + 1) === short) return true;
    }
    return false;
  }

  function tokenMatch(qw, tw) {
    if (tw === qw || tw.includes(qw) || qw.includes(tw)) return true;
    if (qw.length >= 4 && tw.length >= 4 && oneTypoMatch(qw, tw)) return true;
    return false;
  }

  /** Word order does not matter — "large koi golden" still matches "KOI golden … large". */
  function tokenOverlapScore(q, target) {
    const qt = tokens(q);
    const tt = tokens(target);
    if (!qt.length || !tt.length) return 0;
    let hits = 0;
    qt.forEach((qw) => {
      if (tt.some((tw) => tokenMatch(qw, tw))) hits++;
    });
    return Math.round((hits / qt.length) * 70);
  }

  function allQueryTokensMatch(q, target) {
    const qt = tokens(q);
    const tt = tokens(target);
    if (!qt.length || !tt.length) return 0;
    const hits = qt.filter((qw) => tt.some((tw) => tokenMatch(qw, tw))).length;
    if (hits !== qt.length) return 0;
    return Math.min(92, 78 + hits * 3);
  }

  function substringMatchScore(q, n) {
    if (n.includes(q)) return q.length >= 10 ? 88 : 85;
    if (!q.includes(n)) return 0;
    const nToks = tokens(n);
    const qToks = tokens(q);
    if (nToks.length >= 2 && nToks.every((t) => qToks.some((qt) => tokenMatch(qt, t)))) return 86;
    if (n.length >= 14) return 85;
    return 0;
  }

  function matchScore(query, entry) {
    const q = normalize(query);
    if (!q) return 0;
    let best = 0;
    entryNames(entry).forEach((n) => {
      if (q === n) best = Math.max(best, 100);
      else {
        best = Math.max(best, substringMatchScore(q, n));
        best = Math.max(best, allQueryTokensMatch(q, n));
        best = Math.max(best, tokenOverlapScore(q, n));
      }
    });
    return best;
  }

  /**
   * @param {string} name
   * @param {{ meal?: string, minScore?: number }} opts
   */
  const FOOD_MEALS = ["breakfast", "lunch", "dinner"];

  /** Shop chains — type these in the name to use that shop's kcal. */
  const DRINK_BRANDS = [
    "starbucks",
    "sbux",
    "koi",
    "liho",
    "li ho",
    "gong cha",
    "gongcha",
    "chagee",
    "bawangchaji",
    "mixue",
    "heytea",
    "xicha",
    "nayuki",
    "naixue",
    "tiger sugar",
    "tigersugar",
    "coco fresh",
    "sharetea",
    "share tea",
    "zus",
    "arabica",
    "playmade",
    "play made",
    "each a cup",
    "eachacup",
    "xing fu tang",
    "xingfutang",
    "r&b",
    "r and b",
  ];

  function brandsInQuery(query) {
    const n = normalize(query);
    return DRINK_BRANDS.filter((b) => n.includes(b));
  }

  function hasDrinkBrand(query) {
    return brandsInQuery(query).length > 0;
  }

  function entryHasBrand(entry, brand) {
    return entryNames(entry).some((n) => n.includes(brand));
  }

  function isBrandedDrinkEntry(entry) {
    if (!entry.meals?.includes("drinks")) return false;
    return brandsInQuery(entry.name).length > 0 || DRINK_BRANDS.some((b) => entryHasBrand(entry, b));
  }

  function entryAllowedForMeal(entry, meal, queryName) {
    if (!entry.meals?.length) return true;
    if (meal === "drinks") {
      if (!entry.meals.includes("drinks")) return false;
      if (!queryName) return true;
      const branded = isBrandedDrinkEntry(entry);
      const userBrands = brandsInQuery(queryName);
      if (!userBrands.length) return !branded;
      return userBrands.some((b) => entryHasBrand(entry, b));
    }
    if (meal === "snacks") return entry.meals.includes("snacks");
    if (FOOD_MEALS.includes(meal)) return entry.meals.some((m) => FOOD_MEALS.includes(m));
    return entry.meals.includes(meal);
  }

  function lookup(name, opts = {}) {
    const minScore = opts.minScore ?? 52;
    const queryName = opts.queryName ?? name;
    let best = null;
    let bestScore = 0;
    ENTRIES.forEach((entry) => {
      if (opts.meal && !entryAllowedForMeal(entry, opts.meal, queryName)) return;
      const score = matchScore(name, entry);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });
    if (!best || bestScore < minScore) return null;
    return {
      entry: best,
      score: bestScore,
      label: best.name,
    };
  }

  function kcalFromLookup(name, meal) {
    if (!meal) return null;
    const hit = lookup(name, { meal, queryName: name });
    if (!hit) return null;
    const e = hit.entry;
    if (e.kcal != null) return { kcal: e.kcal, kcalLow: e.kcal, kcalHigh: e.kcal, source: "database", label: hit.label, score: hit.score };
    if (e.kcalLow != null && e.kcalHigh != null) {
      const mid = Math.round((e.kcalLow + e.kcalHigh) / 2);
      return { kcal: mid, kcalLow: e.kcalLow, kcalHigh: e.kcalHigh, source: "database", label: hit.label, score: hit.score };
    }
    return null;
  }

  function portionBands(entry, vesselOrContainer) {
    const key = vesselOrContainer === "bowl" || vesselOrContainer === "plate" ? vesselOrContainer : vesselOrContainer;
    const bands = entry[key];
    if (!bands) return null;
    return bands;
  }

  function registerEntries(more) {
    if (Array.isArray(more) && more.length) ENTRIES.push(...more);
  }

  global.DietSgNutrition = {
    ENTRIES,
    lookup,
    kcalFromLookup,
    portionBands,
    normalize,
    registerEntries,
    hasDrinkBrand,
    brandsInQuery,
  };
})(typeof window !== "undefined" ? window : globalThis);
