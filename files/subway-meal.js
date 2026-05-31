/**
 * Subway SG-style estimates (6" / footlong). Sauces & extras are add-ons on top of a base sub
 * (base includes standard lettuce/tomato/onion/cucumber/pickle, no sauce).
 */
(function (global) {
  const BASES = [
    { id: "turkey", label: "Turkey breast", six: 280, foot: 560 },
    { id: "chicken", label: "Chicken breast", six: 320, foot: 640 },
    { id: "ham", label: "Ham", six: 290, foot: 580 },
    { id: "roast_beef", label: "Roast beef", six: 320, foot: 640 },
    { id: "tuna", label: "Tuna", six: 480, foot: 960 },
    { id: "veggie", label: "Veggie Delite", six: 230, foot: 460 },
    { id: "italian_bmt", label: "Italian BMT", six: 410, foot: 820 },
    { id: "meatball", label: "Meatball marinara", six: 480, foot: 960 },
    { id: "steak", label: "Steak & cheese", six: 380, foot: 760 },
    { id: "teriyaki", label: "Chicken teriyaki", six: 370, foot: 740 },
    { id: "cold_cut", label: "Cold Cut Trio", six: 390, foot: 780 },
    { id: "club", label: "Club", six: 310, foot: 620 },
    { id: "tuna_melt", label: "Tuna melt", six: 500, foot: 1000 },
  ];

  const SAUCES = [
    { id: "mayo", label: "Mayonnaise", six: 93, foot: 186 },
    { id: "light_mayo", label: "Light mayo", six: 49, foot: 98 },
    { id: "ranch", label: "Ranch", six: 110, foot: 220 },
    { id: "italian", label: "Italian dressing", six: 45, foot: 90 },
    { id: "southwest", label: "Chipotle southwest", six: 100, foot: 200 },
    { id: "honey_mustard", label: "Honey mustard", six: 30, foot: 60 },
    { id: "sweet_onion", label: "Sweet onion", six: 40, foot: 80 },
    { id: "bbq", label: "BBQ", six: 40, foot: 80 },
    { id: "ketchup", label: "Ketchup", six: 10, foot: 20 },
    { id: "mustard", label: "Mustard", six: 5, foot: 10 },
    { id: "vinegar", label: "Vinegar", six: 0, foot: 0 },
    { id: "oil", label: "Olive oil blend", six: 45, foot: 90 },
    { id: "garlic_aioli", label: "Garlic aioli", six: 100, foot: 200 },
    { id: "sriracha", label: "Sriracha", six: 20, foot: 40 },
  ];

  const EXTRAS = [
    { id: "cheese", label: "Cheese slice", six: 50, foot: 100 },
    { id: "double_meat", label: "Double meat", six: 90, foot: 180 },
    { id: "avocado", label: "Avocado", six: 60, foot: 120 },
    { id: "olives", label: "Extra olives", six: 25, foot: 50 },
    { id: "bacon", label: "Bacon (2 strips)", six: 45, foot: 90 },
    { id: "extra_pickles", label: "Extra pickles", six: 5, foot: 10 },
    { id: "jalapeno", label: "Extra jalapeño", six: 2, foot: 4 },
    { id: "poached_egg", label: "Egg (patty)", six: 70, foot: 140 },
    { id: "mozzarella", label: "Mozzarella cheese", six: 55, foot: 110 },
  ];

  const COMBOS = [
    {
      name: 'Subway 6" turkey · light sauce',
      aliases: ['6" turkey light mayo', "subway turkey light"],
      kcal: 330,
    },
    {
      name: 'Subway 6" turkey · heavy sauce (mayo + ranch)',
      aliases: ["subway turkey lots of sauce", "6 inch turkey heavy sauce"],
      kcal: 485,
    },
    {
      name: 'Subway 6" turkey · loaded (cheese, mayo, olives)',
      aliases: ["subway turkey loaded"],
      kcal: 450,
    },
    {
      name: "Subway footlong veggie · no sauce",
      aliases: ["footlong veggie", "footlong veggie no cheese"],
      kcal: 460,
    },
    {
      name: "Subway footlong turkey · mayo",
      aliases: ["footlong turkey mayo"],
      kcal: 750,
    },
  ];

  function sizeLabel(size) {
    return size === "foot" ? "footlong" : '6"';
  }

  function kcalFor(size, item) {
    return size === "foot" ? item.foot : item.six;
  }

  function partName(kind, size, label) {
    const s = sizeLabel(size);
    if (kind === "base") return `Subway ${s} ${label} base`;
    return `Subway ${s} · ${label}`;
  }

  function buildMeal(selection) {
    const size = selection.size === "foot" ? "foot" : "six";
    const base = BASES.find((b) => b.id === selection.baseId) || BASES[0];
    const parts = [];
    let total = 0;

    const baseName = partName("base", size, base.label);
    const baseKcal = kcalFor(size, base);
    parts.push({ name: baseName, kcal: baseKcal, kind: "base" });
    total += baseKcal;

    (selection.sauceIds || []).forEach((id) => {
      const s = SAUCES.find((x) => x.id === id);
      if (!s) return;
      const k = kcalFor(size, s);
      parts.push({ name: partName("sauce", size, s.label), kcal: k, kind: "sauce" });
      total += k;
    });

    (selection.extraIds || []).forEach((id) => {
      const e = EXTRAS.find((x) => x.id === id);
      if (!e) return;
      const k = kcalFor(size, e);
      parts.push({ name: partName("extra", size, e.label), kcal: k, kind: "extra" });
      total += k;
    });

    const sauceLabels = (selection.sauceIds || [])
      .map((id) => SAUCES.find((s) => s.id === id)?.label)
      .filter(Boolean);
    const extraLabels = (selection.extraIds || [])
      .map((id) => EXTRAS.find((e) => e.id === id)?.label)
      .filter(Boolean);
    const bits = [base.label, ...sauceLabels, ...extraLabels].filter(Boolean);
    const summary = `Subway ${sizeLabel(size)} ${bits.join(" · ")}`;

    return { parts, total, summary, size };
  }

  function dbEntries() {
    const out = [];
    const push = (name, kcal, aliases = []) => {
      out.push({ name, aliases, meals: ["lunch"], kcal });
    };

    BASES.forEach((b) => {
      push(partName("base", "six", b.label), b.six, [
        `subway 6 ${b.id}`,
        `6 inch ${b.label.toLowerCase()}`,
      ]);
      push(partName("base", "foot", b.label), b.foot, [`subway footlong ${b.id}`]);
    });

    SAUCES.forEach((s) => {
      push(partName("sauce", "six", s.label), s.six, [`subway ${s.id}`, `subway sauce ${s.label.toLowerCase()}`]);
      push(partName("sauce", "foot", s.label), s.foot);
    });

    EXTRAS.forEach((e) => {
      push(partName("extra", "six", e.label), e.six, [`subway extra ${e.id}`]);
      push(partName("extra", "foot", e.label), e.foot);
    });

    COMBOS.forEach((c) => push(c.name, c.kcal, c.aliases));

    return out;
  }

  function norm(text) {
    return (text || "")
      .toLowerCase()
      .replace(/\b6\s*"\b/g, "6 inch")
      .replace(/\b6\s*-\s*inch\b/g, "6 inch")
      .replace(/\b6\s*in\b/g, "6 inch")
      .replace(/[''"]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isSubwayOrderText(text) {
    const raw = (text || "").toLowerCase();
    return (
      raw.includes("subway") ||
      raw.includes("6 inch") ||
      raw.includes("6in") ||
      raw.includes('6"') ||
      raw.includes("6-in") ||
      raw.includes("footlong") ||
      raw.includes("foot long")
    );
  }

  /** Parse a long free-text Subway order (e.g. "6 inch cold cut … mayo"). */
  function parseOrder(name) {
    if (!isSubwayOrderText(name)) return null;
    const n = norm(name);

    const size =
      n.includes("footlong") || n.includes("foot long") || n.includes("12 inch") || n.includes("12in")
        ? "foot"
        : "six";

    const baseRules = [
      ["cold cut", "cold_cut"],
      ["italian bmt", "italian_bmt"],
      ["meatball", "meatball"],
      ["steak", "steak"],
      ["tuna melt", "tuna_melt"],
      ["tuna", "tuna"],
      ["teriyaki", "teriyaki"],
      ["roast beef", "roast_beef"],
      ["club", "club"],
      ["veggie", "veggie"],
      ["ham", "ham"],
      ["chicken", "chicken"],
      ["turkey", "turkey"],
    ];
    let baseId = "turkey";
    for (const [kw, id] of baseRules) {
      if (n.includes(kw)) {
        baseId = id;
        break;
      }
    }

    const sauceIds = [];
    const addSauce = (id, ...keys) => {
      if (keys.some((k) => n.includes(k)) && !sauceIds.includes(id)) sauceIds.push(id);
    };
    addSauce("mayo", "mayonnaise", "mayo");
    addSauce("light_mayo", "light mayo");
    addSauce("ranch", "ranch");
    addSauce("southwest", "southwest", "chipotle");
    addSauce("honey_mustard", "honey mustard");
    addSauce("sweet_onion", "sweet onion", "teriyaki sauce");
    addSauce("bbq", "bbq", "barbecue");
    addSauce("ketchup", "ketchup");
    addSauce("mustard", "mustard");
    addSauce("garlic_aioli", "garlic", "aioli");
    addSauce("italian", "italian dressing");
    addSauce("oil", "olive oil");

    const extraIds = [];
    const addExtra = (id) => {
      if (!extraIds.includes(id)) extraIds.push(id);
    };
    if (n.includes("mozzarella")) addExtra("mozzarella");
    else if (n.includes("cheese") || n.includes("cheddar") || n.includes("swiss")) addExtra("cheese");
    if (n.includes("avocado")) addExtra("avocado");
    if (/\begg\b/.test(n) || n.includes("egg patty")) addExtra("poached_egg");
    if (n.includes("bacon")) addExtra("bacon");
    if (n.includes("double meat")) addExtra("double_meat");
    if (n.includes("olive")) addExtra("olives");
    if (n.includes("jalapeno") || n.includes("jalapeño")) addExtra("jalapeno");

    return buildMeal({ size, baseId, sauceIds, extraIds });
  }

  global.DietSubway = {
    BASES,
    SAUCES,
    EXTRAS,
    COMBOS,
    buildMeal,
    parseOrder,
    isSubwayOrderText,
    dbEntries,
    kcalFor,
    partName,
  };
})(typeof window !== "undefined" ? window : globalThis);
