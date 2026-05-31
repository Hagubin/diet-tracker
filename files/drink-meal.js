(function (global) {
  const CUP_SIZES = ["half", "twoThirds", "one"];
  const CAN_SIZES = ["half", "one"];
  const BOTTLE_SIZES = ["small", "medium", "large"];

  const SIZE_LABEL = {
    cup: { half: "½ cup", twoThirds: "⅔ cup", one: "1 cup" },
    can: { half: "½ can", one: "1 can" },
    bottle: { small: "Small", medium: "Medium", large: "Large" },
  };

  const VESSEL_LABEL = { cup: "Cup", can: "Can", bottle: "Bottle" };

  const GENERIC_RANGES = {
    cup: { half: [15, 35], twoThirds: [30, 55], one: [45, 90] },
    can: { half: [40, 70], one: [80, 150] },
    bottle: { small: [30, 60], medium: [60, 120], large: [100, 200] },
  };

  const DEFAULT_DRINK_FOODS = [
    {
      id: "coffee",
      name: "Coffee",
      category: "coffee",
      cup: { half: [2, 8], twoThirds: [5, 12], one: [8, 20] },
      can: { half: [40, 70], one: [90, 140] },
      bottle: { small: [5, 15], medium: [10, 25], large: [15, 35] },
    },
    {
      id: "tea",
      name: "Tea",
      category: "tea",
      cup: { half: [0, 5], twoThirds: [2, 8], one: [5, 15] },
      bottle: { small: [20, 45], medium: [40, 80], large: [70, 120] },
    },
    {
      id: "water",
      name: "Water",
      category: "water",
      cup: { half: [0, 0], twoThirds: [0, 0], one: [0, 0] },
      bottle: { small: [0, 0], medium: [0, 0], large: [0, 0] },
    },
    {
      id: "juice",
      name: "Juice",
      category: "juice",
      cup: { half: [40, 60], twoThirds: [70, 100], one: [100, 140] },
      bottle: { small: [50, 80], medium: [100, 150], large: [160, 240] },
    },
    {
      id: "milk_tea",
      name: "Milk tea",
      category: "sweet",
      cup: { half: [80, 120], twoThirds: [140, 200], one: [200, 300] },
      bottle: { small: [100, 160], medium: [180, 260], large: [280, 400] },
    },
    {
      id: "coke",
      name: "Coke",
      category: "soda",
      can: { half: [70, 90], one: [130, 150] },
      bottle: { small: [80, 110], medium: [130, 160], large: [200, 260] },
    },
    {
      id: "sprite",
      name: "Sprite",
      category: "soda",
      can: { half: [70, 90], one: [130, 150] },
      bottle: { small: [80, 110], medium: [130, 160], large: [200, 260] },
    },
    {
      id: "beer",
      name: "Beer",
      category: "alcohol",
      can: { half: [50, 75], one: [100, 160] },
      bottle: { small: [90, 140], medium: [140, 200], large: [200, 280] },
    },
  ];

  function bandBetween(half, one, ratio = 0.67) {
    return [
      Math.round(half[0] + (one[0] - half[0]) * ratio),
      Math.round(half[1] + (one[1] - half[1]) * ratio),
    ];
  }

  function normalizeBands(bands) {
    if (!bands) return { ...GENERIC_RANGES.cup };
    const out = { ...bands };
    if (!out.twoThirds && out.half && out.one) out.twoThirds = bandBetween(out.half, out.one);
    return out;
  }

  function sizesForVessel(vessel) {
    if (vessel === "cup") return CUP_SIZES;
    if (vessel === "can") return CAN_SIZES;
    if (vessel === "bottle") return BOTTLE_SIZES;
    return CUP_SIZES;
  }

  function sizeLabel(vessel, size) {
    return SIZE_LABEL[vessel]?.[size] || size;
  }

  function vesselsForDrink(drink) {
    const list = [];
    if (drink.cup) list.push("cup");
    if (drink.can) list.push("can");
    if (drink.bottle) list.push("bottle");
    return list.length ? list : ["cup", "can", "bottle"];
  }

  function cloneDrinks() {
    return DEFAULT_DRINK_FOODS.map((d) => ({
      ...d,
      cup: d.cup ? normalizeBands(d.cup) : undefined,
      can: d.can ? normalizeBands(d.can) : undefined,
      bottle: d.bottle ? normalizeBands(d.bottle) : undefined,
    }));
  }

  function normalizeDrinkEntry(drink) {
    const out = { ...drink };
    if (out.cup) out.cup = normalizeBands(out.cup);
    if (out.can) out.can = normalizeBands(out.can);
    if (out.bottle) out.bottle = normalizeBands(out.bottle);
    return out;
  }

  function findDrink(library, name) {
    const n = (name || "").trim().toLowerCase();
    return library.find((d) => d.name.toLowerCase() === n) || null;
  }

  function drinkForName(library, name) {
    const hit = findDrink(library, name);
    if (hit) return normalizeDrinkEntry(hit);
    return {
      id: `custom-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name: name.trim(),
      category: "mixed",
      cup: { ...GENERIC_RANGES.cup },
      can: { ...GENERIC_RANGES.can },
      bottle: { ...GENERIC_RANGES.bottle },
    };
  }

  function rangeFor(drink, vessel, size) {
    const bands = normalizeBands(drink[vessel]);
    const band = bands[size];
    if (band) return { low: band[0], high: band[1] };
    const g = GENERIC_RANGES[vessel]?.[size];
    if (g) return { low: g[0], high: g[1] };
    return { low: 20, high: 80 };
  }

  function mid(range) {
    return (range.low + range.high) / 2;
  }

  function pickSizeForTarget(drink, vessel, targetKcal) {
    const sizes = sizesForVessel(vessel);
    let best = sizes[0];
    let bestDiff = Infinity;
    sizes.forEach((size) => {
      const d = Math.abs(mid(rangeFor(drink, vessel, size)) - targetKcal);
      if (d < bestDiff) {
        bestDiff = d;
        best = size;
      }
    });
    return best;
  }

  function suggestPortions(draft, library, kcalLeft) {
    const ready = draft.filter((d) => d.vessel);
    if (!ready.length) return [];

    const mealBudget = Math.min(Math.max(kcalLeft * 0.85, 80), 600);
    const each = mealBudget / ready.length;
    return ready.map((d) => {
      const drink = drinkForName(library, d.name);
      const size = pickSizeForTarget(drink, d.vessel, each);
      return {
        key: d.key,
        name: d.name,
        vessel: d.vessel,
        size,
        label: sizeLabel(d.vessel, size),
      };
    });
  }

  function lineRange(draftLine, library) {
    if (!draftLine.vessel || !draftLine.size) return null;
    const drink = drinkForName(library, draftLine.name);
    return rangeFor(drink, draftLine.vessel, draftLine.size);
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

  global.DietDrinkMeal = {
    CUP_SIZES,
    CAN_SIZES,
    BOTTLE_SIZES,
    SIZE_LABEL,
    VESSEL_LABEL,
    DEFAULT_DRINK_FOODS,
    cloneDrinks,
    normalizeDrinkEntry,
    sizesForVessel,
    sizeLabel,
    vesselsForDrink,
    findDrink,
    drinkForName,
    rangeFor,
    suggestPortions,
    lineRange,
    mealTotalRange,
    mealCaloriesMid,
  };
})(typeof window !== "undefined" ? window : globalThis);
