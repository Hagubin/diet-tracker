(function (global) {
  const BOWL_SIZES = ["half", "twoThirds", "one"];
  const PLATE_SIZES = ["half", "twoThirds", "one"];

  const SIZE_LABEL = {
    bowl: { half: "½ bowl", twoThirds: "⅔ bowl", one: "1 bowl" },
    plate: { half: "½ plate", twoThirds: "⅔ plate", one: "1 plate" },
  };

  const LEGACY_SIZE = { full: "one", two: "one" };

  const GENERIC_RANGES = {
    bowl: { half: [80, 140], twoThirds: [130, 210], one: [180, 280] },
    plate: { half: [70, 130], twoThirds: [115, 195], one: [160, 260] },
  };

  const DEFAULT_PLATE_FOODS = [
    {
      id: "rice",
      name: "Rice",
      category: "starch",
      bowl: { half: [120, 180], one: [250, 350] },
      plate: { half: [100, 160], one: [220, 320] },
    },
    {
      id: "noodles",
      name: "Noodles",
      category: "starch",
      bowl: { half: [140, 200], one: [280, 400] },
      plate: { half: [120, 180], one: [250, 380] },
    },
    {
      id: "broccoli",
      name: "Broccoli",
      category: "veg",
      bowl: { half: [20, 45], one: [45, 90] },
      plate: { half: [25, 55], one: [55, 110] },
    },
    {
      id: "fish",
      name: "Fish",
      category: "protein",
      bowl: { half: [80, 140], one: [160, 260] },
      plate: { half: [90, 150], one: [180, 280] },
    },
    {
      id: "chicken",
      name: "Chicken",
      category: "protein",
      bowl: { half: [100, 160], one: [200, 320] },
      plate: { half: [110, 180], one: [220, 340] },
    },
  ];

  function bandBetween(half, one, ratio = 0.67) {
    return [
      Math.round(half[0] + (one[0] - half[0]) * ratio),
      Math.round(half[1] + (one[1] - half[1]) * ratio),
    ];
  }

  function normalizeBands(bands) {
    if (!bands) return { half: [80, 140], twoThirds: [130, 210], one: [180, 280] };
    const half = bands.half;
    const one = bands.one || bands.full;
    const out = { half, one };
    if (bands.twoThirds) out.twoThirds = bands.twoThirds;
    else if (half && one) out.twoThirds = bandBetween(half, one);
    return out;
  }

  function normalizeSize(size) {
    return LEGACY_SIZE[size] || size;
  }

  function sizesForContainer(container) {
    return container === "bowl" ? BOWL_SIZES : PLATE_SIZES;
  }

  function sizeLabel(container, size) {
    const s = normalizeSize(size);
    return SIZE_LABEL[container]?.[s] || size;
  }

  function cloneFoods() {
    return DEFAULT_PLATE_FOODS.map((f) => ({
      ...f,
      bowl: normalizeBands(f.bowl),
      plate: normalizeBands(f.plate),
    }));
  }

  function normalizeFoodEntry(food) {
    return {
      ...food,
      bowl: normalizeBands(food.bowl),
      plate: normalizeBands(food.plate),
    };
  }

  function findFood(library, name) {
    const n = (name || "").trim().toLowerCase();
    return library.find((f) => f.name.toLowerCase() === n) || null;
  }

  function foodForName(library, name) {
    const hit = findFood(library, name);
    if (hit) return normalizeFoodEntry(hit);
    return {
      id: `custom-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name: name.trim(),
      category: "mixed",
      bowl: { ...GENERIC_RANGES.bowl },
      plate: { ...GENERIC_RANGES.plate },
    };
  }

  function rangeFor(food, container, size) {
    const s = normalizeSize(size);
    const bands = normalizeBands(food[container]);
    const band = bands[s];
    if (band) return { low: band[0], high: band[1] };
    const g = GENERIC_RANGES[container]?.[s];
    if (g) return { low: g[0], high: g[1] };
    return { low: 100, high: 200 };
  }

  function mid(range) {
    return (range.low + range.high) / 2;
  }

  function pickSizeForTarget(food, container, targetKcal) {
    const sizes = sizesForContainer(container);
    let best = sizes[0];
    let bestDiff = Infinity;
    sizes.forEach((size) => {
      const d = Math.abs(mid(rangeFor(food, container, size)) - targetKcal);
      if (d < bestDiff) {
        bestDiff = d;
        best = size;
      }
    });
    return best;
  }

  function suggestPortions(draft, library, kcalLeft) {
    const ready = draft.filter((d) => d.container);
    if (!ready.length) return [];

    const mealBudget = Math.min(Math.max(kcalLeft * 0.85, 200), 1200);
    const byCat = { starch: [], veg: [], protein: [], mixed: [] };
    ready.forEach((d) => {
      const food = foodForName(library, d.name);
      const cat = byCat[food.category] ? food.category : "mixed";
      byCat[cat].push({ draft: d, food });
    });

    const shares = { starch: 0.4, veg: 0.25, protein: 0.35, mixed: 0.3 };
    const out = [];

    Object.keys(byCat).forEach((cat) => {
      const items = byCat[cat];
      if (!items.length) return;
      const pool = mealBudget * shares[cat];
      const each = pool / items.length;
      items.forEach(({ draft: d, food }) => {
        const size = pickSizeForTarget(food, d.container, each);
        out.push({
          key: d.key,
          name: d.name,
          container: d.container,
          size,
          label: sizeLabel(d.container, size),
        });
      });
    });

    return out;
  }

  function lineRange(draftLine, library) {
    if (!draftLine.container || !draftLine.size) return null;
    const food = foodForName(library, draftLine.name);
    return rangeFor(food, draftLine.container, draftLine.size);
  }

  function mealTotalRange(draft, library) {
    let low = 0;
    let high = 0;
    let any = false;
    draft.forEach((d) => {
      const r = lineRange(d, library);
      if (!r) return;
      any = true;
      low += r.low;
      high += r.high;
    });
    return any ? { low, high } : null;
  }

  function mealCaloriesMid(total) {
    if (!total) return null;
    return Math.round((total.low + total.high) / 2);
  }

  global.DietPlateMeal = {
    BOWL_SIZES,
    PLATE_SIZES,
    SIZE_LABEL,
    DEFAULT_PLATE_FOODS,
    cloneFoods,
    normalizeFoodEntry,
    normalizeSize,
    sizesForContainer,
    sizeLabel,
    findFood,
    foodForName,
    rangeFor,
    suggestPortions,
    lineRange,
    mealTotalRange,
    mealCaloriesMid,
  };
})(typeof window !== "undefined" ? window : globalThis);
