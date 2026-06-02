(function () {
  const STORAGE_KEY = "dietTracker_v4";
  const APP_RELEASE = 66;
  const BUILD_STORAGE_KEY = "dietAppBuild";
  const LOCALE = "en-US";
  const M = window.DietBodyMath;
  const PM = window.DietPlateMeal;
  const DM = window.DietDrinkMeal;
  const SG = window.DietSgNutrition;
  const NUTRITION_BUNDLE_V = String(APP_RELEASE);
  const nutritionBundles = { drinks: false, food: false };
  const nutritionScriptLoads = new Map();

  function loadNutritionScript(path) {
    const url = `${path}?v=${NUTRITION_BUNDLE_V}`;
    if (nutritionScriptLoads.has(url)) return nutritionScriptLoads.get(url);
    const p = new Promise((resolve, reject) => {
      const sel = `script[data-nutrition-src="${url}"]`;
      const existing = document.querySelector(sel);
      if (existing) {
        if (existing.dataset.loaded === "1") resolve();
        else {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error(url)), { once: true });
        }
        return;
      }
      const el = document.createElement("script");
      el.src = url;
      el.dataset.nutritionSrc = url;
      el.async = true;
      el.onload = () => {
        el.dataset.loaded = "1";
        resolve();
      };
      el.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(el);
    });
    nutritionScriptLoads.set(url, p);
    return p;
  }

  function ensureNutritionForMeal(meal) {
    if (!SG?.registerEntries) return Promise.resolve();
    if (meal === "snacks") return Promise.resolve();
    if (meal === "drinks") {
      return loadNutritionScript("files/sg-nutrition-drinks.js").then(() => {
        const drinks = window.DietSgDrinks;
        if (drinks && !nutritionBundles.drinks) {
          SG.registerEntries(drinks.dbEntries());
          nutritionBundles.drinks = true;
        }
      });
    }
    return Promise.all([
      loadNutritionScript("files/sg-fastfood-db.js"),
      loadNutritionScript("files/subway-meal.js"),
    ]).then(() => {
      if (nutritionBundles.food) return;
      const sw = window.DietSubway;
      const ff = window.DietSgFastfood;
      if (sw) SG.registerEntries(sw.dbEntries());
      if (ff) SG.registerEntries(ff.dbEntries());
      nutritionBundles.food = true;
    });
  }

  const DEFAULT_WATER_BOTTLE_ML = 1200;
  const DEFAULT_WATER_GOAL_BOTTLES = 1.5;
  /** Daily fluid above ~45 ml/kg may be risky for many adults (not medical advice). */
  const WATER_ML_PER_KG_CAUTION = 45;

  const DEFAULT_PRESETS = {
    lunch: ['Subway 6" turkey · light sauce', 'Subway 6" Turkey breast base', 'Subway 6" · Light mayo'],
    dinner: [],
    breakfast: [],
    snacks: [],
    drinks: [],
  };

  /** Old built-in snack starters — stripped from your list on upgrade. */
  const LEGACY_SNACK_SEED_NAMES = [
    "Curry puff",
    "Potato chips small bag",
    "Oreo (4 pcs)",
    "Bak kwa slice (2 pcs)",
    "Banana (1 medium)",
    "Yogurt cup",
    "Granola bar",
    "Fishball stick (3 pcs)",
    "Spring roll (2 pcs)",
    "Milo 3-in-1 sachet",
    "Chicken nuggets (4 pcs)",
    "Tau sar piah (2 pcs)",
  ];

  const SUBWAY_PRESET_RENAME = {
    '6" turkey, no cheese': 'Subway 6" Turkey breast base',
    "Subway 6\" turkey no cheese": 'Subway 6" Turkey breast base',
    '6" turkey, light mayo': 'Subway 6" turkey · light sauce',
    "Footlong veggie, no cheese": "Subway footlong veggie · no sauce",
  };

  const PRESET_KCAL = {
    lunch: {},
    dinner: {},
    breakfast: {},
    snacks: {},
    drinks: {
      "Starbucks Tall latte": 180,
      "Starbucks Grande latte": 250,
      "Starbucks Venti latte": 320,
      "Starbucks Tall black coffee": 15,
      "Starbucks Grande black coffee": 20,
      "Coke (330ml can)": 139,
      "Sprite (330ml can)": 140,
      "Fanta orange (330ml can)": 150,
      "Bubble tea (large)": 350,
      "Diet Coke (330ml can)": 1,
    },
  };

  const VIEW_TITLES = {
    summary: "Summary",
    food: "Food",
    exercise: "Exercise",
    profile: "Profile",
  };

  const DEFAULT_EXERCISE_TYPES = [
    { id: "fitness_boxing", name: "Fitness Boxing", note: "Switch", kcalPerMin: 8, builtin: true },
  ];

  const EXERCISE_KCAL_GUESS = [
    { keys: ["run", "jog", "sprint"], kcal: 10 },
    { keys: ["cycl", "bike", "bik"], kcal: 8 },
    { keys: ["jump", "rope", "skip"], kcal: 11 },
    { keys: ["swim"], kcal: 9 },
    { keys: ["walk"], kcal: 4 },
    { keys: ["hike"], kcal: 6 },
    { keys: ["yoga", "pilates"], kcal: 3 },
    { keys: ["strength", "weight", "lift"], kcal: 6 },
    { keys: ["hiit", "cardio"], kcal: 10 },
    { keys: ["dance"], kcal: 7 },
    { keys: ["box", "fight", "punch"], kcal: 8 },
    { keys: ["row"], kcal: 8 },
    { keys: ["elliptic", "stair"], kcal: 7 },
  ];

  const $ = (id) => document.getElementById(id);

  function defaultProfile() {
    return {
      age: null,
      sex: "male",
      heightCm: null,
      idealWeightKg: null,
      baselineSet: false,
      goalStartDate: null,
      startWeightKg: null,
    };
  }

  function defaultState() {
    return {
      foodPresets: { ...DEFAULT_PRESETS },
      plateFoodsByMeal: defaultPlateFoodsByMeal(),
      mealLogs: [],
      weightEntries: [],
      waterByDate: {},
      exerciseLogs: [],
      exerciseTypes: DEFAULT_EXERCISE_TYPES.map((t) => ({ ...t })),
      profile: defaultProfile(),
      presetKcalOverrides: { breakfast: {}, lunch: {}, dinner: {}, snacks: {}, drinks: {} },
      snackCatalog: {},
      settings: {
        waterBottleMl: DEFAULT_WATER_BOTTLE_ML,
        waterGoalBottles: DEFAULT_WATER_GOAL_BOTTLES,
        theme: "day",
        snackCatalogV2: true,
      },
    };
  }

  function migrateSnackCatalog(raw) {
    const out = {};
    if (!raw || typeof raw !== "object") return out;
    Object.entries(raw).forEach(([key, val]) => {
      if (!val || typeof val !== "object") return;
      const name = (val.name || key || "").trim();
      if (!name) return;
      const k = draftItemKey(name);
      const kcal = val.kcal != null && Number.isFinite(val.kcal) ? Math.round(val.kcal) : null;
      out[k] = { name, kcal, updatedAt: val.updatedAt || null };
    });
    return out;
  }

  function migrateSnacksPresetList(fpSnacks, overrides, catalogV2) {
    const seedKeys = new Set(LEGACY_SNACK_SEED_NAMES.map((n) => n.toLowerCase()));
    let list = dedupePresetNames(fpSnacks || []);
    const ov = { ...(overrides || {}) };
    if (!catalogV2) {
      list = list.filter((n) => !seedKeys.has(n.toLowerCase()));
      Object.keys(ov).forEach((k) => {
        if (seedKeys.has(k.toLowerCase())) delete ov[k];
      });
    }
    return { list, overrides: ov };
  }

  function migratePlateFoods(saved) {
    if (!saved?.length) return PM.cloneFoods();
    const drop = new Set(["vegetables"]);
    const seen = new Set();
    const out = [];
    saved.forEach((f) => {
      const name = (f.name || "").trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (drop.has(key) || seen.has(key)) return;
      seen.add(key);
      out.push(PM.normalizeFoodEntry(f));
    });
    return out.length ? out : PM.cloneFoods();
  }

  function clonePlateFoodList(list) {
    return list.map((f) => ({
      ...f,
      bowl: { ...f.bowl },
      plate: { ...f.plate },
    }));
  }

  function defaultPlateFoodsByMeal() {
    return {
      breakfast: PM.cloneFoods(),
      lunch: PM.cloneFoods(),
      dinner: PM.cloneFoods(),
    };
  }

  function migratePlateFoodsByMeal(byMeal, legacy) {
    if (
      byMeal &&
      (Array.isArray(byMeal.breakfast) || Array.isArray(byMeal.lunch) || Array.isArray(byMeal.dinner))
    ) {
      return {
        breakfast: migratePlateFoods(byMeal.breakfast || []),
        lunch: migratePlateFoods(byMeal.lunch || []),
        dinner: migratePlateFoods(byMeal.dinner || []),
      };
    }
    const base = migratePlateFoods(legacy);
    return {
      breakfast: clonePlateFoodList(base),
      lunch: clonePlateFoodList(base),
      dinner: clonePlateFoodList(base),
    };
  }

  function plateFoodsForMeal(meal) {
    if (meal === "drinks" || meal === "snacks") return [];
    if (!state.plateFoodsByMeal) state.plateFoodsByMeal = defaultPlateFoodsByMeal();
    if (!state.plateFoodsByMeal[meal]) state.plateFoodsByMeal[meal] = PM.cloneFoods();
    return state.plateFoodsByMeal[meal];
  }

  function dedupePresetNames(names) {
    const seen = new Set();
    const out = [];
    (names || []).forEach((n) => {
      const trimmed = (n || "").trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(trimmed);
    });
    return out;
  }

  function migrateDrinksPresetList(fp, legacyDrinkFoods) {
    const out = dedupePresetNames(fp?.drinks || [...DEFAULT_PRESETS.drinks]);
    const seen = new Set(out.map((n) => n.toLowerCase()));
    (legacyDrinkFoods || []).forEach((d) => {
      const name = (typeof d === "string" ? d : d?.name || "").trim();
      if (!name || name.toLowerCase() === "water") return;
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(name);
    });
    return out;
  }

  function migrateLogs(oldLogs) {
    if (!oldLogs?.length) return [];
    return oldLogs.map((l) => {
      if (l.meal) return { ...l, id: l.id || `${l.date}-${l.meal}-${l.at}` };
      if (l.type === "lunch")
        return { id: l.at, date: l.date, meal: "lunch", name: l.preset || l.name, calories: l.calories ?? null, at: l.at };
      if (l.type === "dinner")
        return {
          id: l.at,
          date: l.date,
          meal: "dinner",
          name: l.dish || l.name,
          portion: l.portion,
          calories: l.calories ?? null,
          at: l.at,
        };
      return l;
    });
  }

  function migrateSubwayPresetNames(names) {
    const seen = new Set();
    const out = [];
    (names || []).forEach((n) => {
      const next = SUBWAY_PRESET_RENAME[n] || n;
      const key = next.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(next);
    });
    return out;
  }

  function migrateFromOlder(parsed) {
    const fp = parsed.foodPresets || {};
    const presets = {
      breakfast: dedupePresetNames(fp.breakfast || []),
      lunch: dedupePresetNames(
        migrateSubwayPresetNames(
          fp.lunch?.length
            ? [...fp.lunch]
            : parsed.lunchPresets?.length
              ? [...parsed.lunchPresets]
              : [...DEFAULT_PRESETS.lunch]
        )
      ),
      dinner: dedupePresetNames(
        fp.dinner?.length
          ? [...fp.dinner]
          : parsed.dinnerDishes?.length
            ? [...parsed.dinnerDishes]
            : [...DEFAULT_PRESETS.dinner]
      ),
      drinks: migrateDrinksPresetList(fp, parsed.drinkFoods),
    };
    const snackMigrated = migrateSnacksPresetList(
      fp.snacks,
      parsed.presetKcalOverrides?.snacks,
      !!parsed.settings?.snackCatalogV2
    );
    presets.snacks = snackMigrated.list;
    const profile = { ...defaultProfile(), ...parsed.profile };
    delete profile.exerciseMinutes;
    delete profile.exerciseType;
    delete profile.weightKg;
    if (profile.heightCm && profile.startWeightKg) profile.baselineSet = true;

    const migrated = migrateWaterData(parsed.waterByDate || {}, parsed.settings || {});
    return {
      ...defaultState(),
      foodPresets: presets,
      plateFoodsByMeal: migratePlateFoodsByMeal(parsed.plateFoodsByMeal, parsed.plateFoods),
      mealLogs: migrateLogs(parsed.mealLogs || parsed.logs || []),
      weightEntries: parsed.weightEntries || [],
      waterByDate: migrated.waterByDate,
      exerciseLogs: (parsed.exerciseLogs || []).map((e) => ({ ...e, id: e.id || e.at })),
      exerciseTypes: migrateExerciseTypes(parsed.exerciseTypes),
      profile,
      presetKcalOverrides: {
        breakfast: { ...parsed.presetKcalOverrides?.breakfast },
        lunch: { ...parsed.presetKcalOverrides?.lunch },
        dinner: { ...parsed.presetKcalOverrides?.dinner },
        snacks: snackMigrated.overrides,
        drinks: { ...parsed.presetKcalOverrides?.drinks },
      },
      snackCatalog: migrateSnackCatalog(parsed.snackCatalog),
      settings: {
        ...migrated.settings,
        theme: parsed.settings?.theme === "night" ? "night" : "day",
        snackCatalogV2: true,
      },
    };
  }

  /** Rough name-based guess — not from a nutrition database. */
  function guessDrinkKcal(name) {
    const n = (name || "").toLowerCase();
    const branded = SG.hasDrinkBrand ? SG.hasDrinkBrand(name) : false;
    if (!branded) {
      if (n.includes("americano") || n.includes("espresso")) return 10;
      if (n.includes("cappuccino") || /\bcap\b/.test(n)) return 120;
      if (n.includes("flat white")) return 170;
      if (n.includes("matcha")) return 200;
      if (n.includes("mocha")) return 290;
      if (n.includes("hot chocolate") || n.includes("hot cocoa")) return 200;
      if (n.includes("iced coffee") || n.includes("cold brew")) return 15;
      if (n.includes("latte")) return 180;
    }
    const sbSize = () => {
      if (n.includes("venti")) return 320;
      if (n.includes("grande")) return 250;
      if (n.includes("tall")) return 180;
      return 250;
    };
    if (n.includes("starbucks") || n.includes("sbux")) {
      if (n.includes("frapp") || n.includes("frap")) return n.includes("venti") ? 480 : n.includes("tall") ? 280 : 380;
      if (n.includes("mocha")) return n.includes("venti") ? 450 : n.includes("tall") ? 290 : 370;
      if (n.includes("matcha")) return n.includes("venti") ? 360 : n.includes("tall") ? 200 : 280;
      if (n.includes("macchiato")) return n.includes("venti") ? 410 : n.includes("tall") ? 250 : 330;
      if (n.includes("chai")) return n.includes("venti") ? 400 : n.includes("tall") ? 240 : 320;
      if (n.includes("chocolate") || n.includes("cocoa")) return n.includes("venti") ? 500 : n.includes("tall") ? 320 : 410;
      if (n.includes("refresher") || n.includes("pink drink") || n.includes("acai"))
        return n.includes("venti") ? 180 : n.includes("tall") ? 100 : 140;
      if (n.includes("latte")) {
        if (n.includes("venti")) return 320;
        if (n.includes("grande")) return 250;
        if (n.includes("tall")) return 180;
        return 240;
      }
      if (n.includes("cappuccino") || n.includes("cap")) {
        if (n.includes("venti")) return 200;
        if (n.includes("grande")) return 140;
        if (n.includes("tall")) return 100;
        return 140;
      }
      if (n.includes("flat white")) return n.includes("venti") ? 280 : n.includes("tall") ? 170 : 220;
      if (n.includes("black") || n.includes("americano") || n.includes("cold brew"))
        return n.includes("venti") ? 25 : 15;
      return sbSize();
    }
    if (n.includes("tiger sugar") || (n.includes("brown sugar") && (n.includes("boba") || n.includes("milk"))))
      return 530;
    if (n.includes("liho") || n.includes("li ho")) return n.includes("avocado") ? 480 : 400;
    if (n.includes("koi")) return 400;
    if (n.includes("gong cha") || n.includes("gongcha")) return n.includes("winter") ? 180 : 350;
    if (n.includes("chagee") || n.includes("bawangchaji")) return n.includes("chun ni") ? 450 : 400;
    if (n.includes("mixue")) return n.includes("lemon") ? 280 : 320;
    if (n.includes("heytea") || n.includes("xicha")) return 350;
    if (n.includes("nayuki") || n.includes("naixue")) return 380;
    if (n.includes("sharetea") || n.includes("share tea")) return 350;
    if (n.includes("coco") && (n.includes("tea") || n.includes("milk"))) return 380;
    if (n.includes("zus")) return 200;
    if (n.includes("arabica")) return 200;
    if (n.includes("100plus") || n.includes("100 plus")) return 110;
    if (n.includes("soy") || n.includes("soya")) return 90;
    if (n.includes("coconut water")) return 45;
    if (n.includes("ribena")) return 90;
    if (n.includes("whisk") || n.includes("whiskey")) return 100;
    if (n.includes("wine")) return 125;
    if (n.includes("xing fu") || n.includes("xingfutang")) return 540;
    if (n.includes("playmade") || n.includes("play made")) return 250;
    if (n.includes("each a cup") || n.includes("eachacup")) return 380;
    if (n.includes("cheese foam") || n.includes("cheese cap")) return 400;
    if (n.includes("venti")) return 280;
    if (n.includes("grande")) return 220;
    if (n.includes("tall")) return 160;
    if (n.includes("coke") || n.includes("coca")) return n.includes("diet") ? 1 : 140;
    if (n.includes("sprite")) return 140;
    if (n.includes("fanta")) return 150;
    if (n.includes("pepsi")) return n.includes("diet") ? 1 : 140;
    if (n.includes("bubble tea") || n.includes("boba") || n.includes("milk tea")) {
      if (n.includes("no sugar") || n.includes("0%") || n.includes("less sugar")) return 200;
      if (n.includes("large") || /\bl\b/.test(n)) return 350;
      if (n.includes("medium") || /\bm\b/.test(n)) return 280;
      return 220;
    }
    if (n.includes("beer")) return 150;
    if (n.includes("wine")) return 125;
    if (n.includes("juice")) return 110;
    if (n.includes("latte")) return 200;
    if (n.includes("coffee")) return n.includes("black") ? 5 : 80;
    if (n.includes("tea")) return n.includes("milk") ? 120 : 2;
    if (n.includes("nasi lemak") || n.includes("lemak")) return 600;
    if (n.includes("laksa")) return 550;
    if (n.includes("mee goreng")) return 600;
    if (n.includes("prata")) return n.includes("egg") ? 480 : 360;
    if (n.includes("padang")) return 750;
    if (n.includes("cai png") || n.includes("cai fan") || n.includes("economy rice")) return 650;
    if (n.includes("curry puff")) return 180;
    return null;
  }

  function isFixedOnlyMeal(meal) {
    return meal === "drinks" || meal === "snacks";
  }

  function mergeDbBandsOntoFood(food, meal) {
    const hit = SG.lookup(food.name, { meal, minScore: 55 });
    if (!hit) return food;
    const e = hit.entry;
    const out = { ...food };
    ["bowl", "plate", "cup", "can", "bottle"].forEach((key) => {
      if (e[key]) out[key] = { ...(out[key] || {}), ...e[key] };
    });
    return PM.normalizeFoodEntry(out);
  }

  function presetKcalOverride(meal, name) {
    const ov = state.presetKcalOverrides?.[meal];
    if (!ov) return null;
    if (ov[name] != null && Number.isFinite(ov[name])) return ov[name];
    const key = draftItemKey(name);
    for (const [k, v] of Object.entries(ov)) {
      if (draftItemKey(k) === key && Number.isFinite(v)) return v;
    }
    return null;
  }

  /** Kcal shown in the library / before override is stored (estimate or yours). */
  function presetDisplayedKcal(meal, name) {
    const ov = presetKcalOverride(meal, name);
    if (ov != null) return Math.round(ov);
    const info = getPresetCalorieInfo(meal, name);
    if (info.kcal != null && Number.isFinite(info.kcal)) return Math.round(info.kcal);
    return null;
  }

  function getPresetCalorieInfo(meal, name) {
    const override = presetKcalOverride(meal, name);
    if (override != null) {
      return { kcal: Math.round(override), source: "yours" };
    }
    const raw = (name || "").toLowerCase();
    const subway = window.DietSubway;
    if (subway && meal !== "drinks" && meal !== "snacks" && subway.isSubwayOrderText(name)) {
      const parsed = subway.parseOrder(name);
      if (parsed?.total) {
        return {
          kcal: parsed.total,
          kcalLow: parsed.total,
          kcalHigh: parsed.total,
          source: "subway",
          dbLabel: parsed.summary,
        };
      }
    }
    if (meal === "snacks") {
      const cat = snackCatalogKcal(name);
      if (cat != null) return { kcal: cat, source: "catalog" };
      return { kcal: null, source: "none" };
    }
    const db = SG.kcalFromLookup(name, meal);
    if (db) {
      return {
        kcal: db.kcal,
        kcalLow: db.kcalLow,
        kcalHigh: db.kcalHigh,
        source: "database",
        dbLabel: db.label,
      };
    }
    if (PRESET_KCAL[meal]?.[name] != null) {
      return { kcal: PRESET_KCAL[meal][name], source: "preset" };
    }
    if (meal === "drinks") {
      const guessed = guessDrinkKcal(name);
      if (guessed != null) return { kcal: guessed, source: "guess" };
      return { kcal: 120, source: "rough" };
    }
    return { kcal: 350, source: "rough" };
  }

  function presetCalories(meal, name, portion) {
    let base = getPresetCalorieInfo(meal, name).kcal;
    if (meal === "dinner" && portion) {
      const mult = { small: 0.75, normal: 1, large: 1.25 }[portion] || 1;
      base = Math.round(base * mult);
    }
    return base;
  }

  function formatKcalHint(info) {
    if (info.kcal == null || !Number.isFinite(info.kcal)) return "";
    return `~${info.kcal} kcal`;
  }

  /** System snack memory (not your Saved list). Updated when you log snacks. */
  function upsertSnackCatalog(name, kcal) {
    const trimmed = (name || "").trim();
    if (!trimmed) return false;
    if (!state.snackCatalog) state.snackCatalog = {};
    const key = draftItemKey(trimmed);
    const prev = state.snackCatalog[key];
    const nextKcal =
      kcal != null && Number.isFinite(kcal) && kcal >= 0
        ? Math.round(kcal)
        : prev?.kcal ?? null;
    if (prev && prev.name === trimmed && prev.kcal === nextKcal) return false;
    state.snackCatalog[key] = { name: trimmed, kcal: nextKcal };
    return true;
  }

  function snackCatalogKcal(name) {
    const hit = state.snackCatalog?.[draftItemKey(name)];
    if (hit?.kcal != null && Number.isFinite(hit.kcal)) return hit.kcal;
    return null;
  }

  function rememberSnackCatalogFromForm() {
    if (activeMeal !== "snacks") return;
    const name = $("foodQuickAddName")?.value.trim();
    if (!name) return;
    const kcalRaw = $("foodQuickAddKcal")?.value;
    const kcal = kcalRaw === "" || kcalRaw == null ? null : parseInt(kcalRaw, 10);
    const k = kcal != null && Number.isFinite(kcal) && kcal >= 0 ? kcal : null;
    if (k == null) return;
    if (upsertSnackCatalog(name, k)) saveState();
  }

  function loadState() {
    try {
      for (const key of [STORAGE_KEY, "dietTracker_v3", "dietTracker_v2", "dietTracker_v1"]) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const s = migrateFromOlder(JSON.parse(raw));
        if (key !== STORAGE_KEY) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        return s;
      }
      return defaultState();
    } catch {
      return defaultState();
    }
  }

  const BACKUP_FILE_VERSION = 1;

  function buildBackupPayload() {
    const snapshot = JSON.parse(JSON.stringify(state));
    if (snapshot.drinkFoods) delete snapshot.drinkFoods;
    return {
      app: "diet-tracker",
      backupVersion: BACKUP_FILE_VERSION,
      storageKey: STORAGE_KEY,
      exportedAt: new Date().toISOString(),
      state: snapshot,
    };
  }

  function exportBackup() {
    const payload = buildBackupPayload();
    const json = JSON.stringify(payload, null, 2);
    const date = todayStr();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diet-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackupFromObject(raw) {
    const inner = raw?.state && typeof raw.state === "object" ? raw.state : raw;
    if (!inner || typeof inner !== "object") {
      alert("That file does not look like a Diet backup.");
      return false;
    }
    state = migrateFromOlder(inner);
    monthNavIndex = 0;
    selectedExerciseType = state.exerciseTypes?.[0]?.id || "fitness_boxing";
    activeMeal = "lunch";
    resetMealDrafts();
    saveState();
    applyTheme(state.settings.theme);
    render();
    return true;
  }

  function importBackupFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result);
        if (
          !confirm(
            "Replace all data on this install with the backup?\n\nCurrent meals, lists, and baseline on this icon will be overwritten."
          )
        ) {
          return;
        }
        if (importBackupFromObject(raw)) {
          alert("Backup imported. Your data is restored on this install.");
        }
      } catch {
        alert("Could not read that file. Use a Diet export (.json) you saved earlier.");
      }
    };
    reader.readAsText(file);
  }

  function saveState() {
    if (state.drinkFoods) delete state.drinkFoods;
    if (state.snackCatalog) {
      for (const key of Object.keys(state.snackCatalog)) {
        const e = state.snackCatalog[key];
        if (e && (e.updatedAt != null || e.name == null)) {
          state.snackCatalog[key] = { name: e.name, kcal: e.kcal ?? null };
        }
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function migrateExerciseTypes(saved) {
    if (!Array.isArray(saved)) {
      return DEFAULT_EXERCISE_TYPES.map((t) => ({ ...t }));
    }
    if (!saved.length) {
      return DEFAULT_EXERCISE_TYPES.map((t) => ({ ...t }));
    }
    const hasBoxing = saved.some((t) => t.id === "fitness_boxing");
    const list = hasBoxing ? saved : [DEFAULT_EXERCISE_TYPES[0], ...saved];
    return list.map((t) => ({
      id: t.id,
      name: t.name || t.id,
      note: t.note || "",
      kcalPerMin: t.kcalPerMin ?? 5,
      builtin: !!t.builtin,
    }));
  }

  function slugExerciseId(name) {
    return (
      "ex_" +
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 24) +
      "_" +
      Date.now().toString(36)
    );
  }

  function guessKcalPerMin(name) {
    const n = name.toLowerCase();
    for (const row of EXERCISE_KCAL_GUESS) {
      if (row.keys.some((k) => n.includes(k))) return row.kcal;
    }
    return 6;
  }

  function exerciseTypeById(id) {
    return state.exerciseTypes.find((t) => t.id === id);
  }

  function exerciseTypeLabel(id) {
    const t = exerciseTypeById(id);
    if (t) return t.note ? `${t.name} (${t.note})` : t.name;
    if (id === "walk") return "Walk";
    if (id === "other") return "Other";
    if (id === "fitness_boxing") return "Fitness Boxing (Switch)";
    return id;
  }

  function caloriesForExerciseType(id, minutes) {
    const t = exerciseTypeById(id);
    const rate = t?.kcalPerMin ?? 5;
    return M.exerciseCalories(id, minutes, rate);
  }

  function replaceMeta(name, content) {
    const el = document.querySelector(`meta[name="${name}"]`);
    if (!el) return;
    const meta = document.createElement("meta");
    meta.setAttribute("name", name);
    meta.setAttribute("content", content);
    el.replaceWith(meta);
  }

  function applyTheme(theme) {
    const mode = theme === "night" ? "night" : "day";
    const isNight = mode === "night";
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = isNight ? "dark" : "light";
    replaceMeta("theme-color", isNight ? "#000000" : "#f2f2f7");
    replaceMeta("color-scheme", isNight ? "dark" : "light");
    replaceMeta("apple-mobile-web-app-status-bar-style", isNight ? "black" : "default");
  }

  function syncThemeToggle() {
    const btn = $("themeToggleBtn");
    if (!btn) return;
    const isNight = state.settings.theme === "night";
    btn.textContent = isNight ? "Day" : "Night";
    btn.setAttribute("aria-label", isNight ? "Switch to day mode" : "Switch to night mode");
  }

  let state = loadState();
  applyTheme(state.settings.theme);
  let activeMeal = "lunch";
  let plateDraft = [];
  let fixedDraft = [];
  let quickAddKcalTouched = false;
  let lastQuickAddName = "";
  const foodLogModeByMeal = {
    breakfast: "build",
    lunch: "fixed",
    dinner: "build",
    snacks: "fixed",
    drinks: "fixed",
  };
  let selectedExerciseType = state.exerciseTypes[0]?.id ?? null;
  let monthNavIndex = -1;
  let monthNavList = [];

  function todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function monthKeyFromDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function formatDisplayDate(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString(LOCALE, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }

  function formatShortDate(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString(LOCALE, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function formatMonthTitle(key) {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(LOCALE, { month: "long", year: "numeric" });
  }

  function mealLabel(meal) {
    return meal.charAt(0).toUpperCase() + meal.slice(1);
  }

  function migrateWaterData(waterByDate, settings) {
    const nextSettings = { ...defaultState().settings, ...settings };
    if (nextSettings.waterBottleMl) {
      if (!nextSettings.waterPrefsV2) {
        nextSettings.waterBottleMl = DEFAULT_WATER_BOTTLE_ML;
        nextSettings.waterGoalBottles = DEFAULT_WATER_GOAL_BOTTLES;
        nextSettings.waterPrefsV2 = true;
      }
      return { settings: nextSettings, waterByDate: { ...waterByDate } };
    }
    const bottleMl = DEFAULT_WATER_BOTTLE_ML;
    const goalBottles = DEFAULT_WATER_GOAL_BOTTLES;
    const oldGlassGoal = nextSettings.waterGoal || 8;
    nextSettings.waterBottleMl = bottleMl;
    nextSettings.waterGoalBottles = goalBottles;
    delete nextSettings.waterGoal;
    delete nextSettings.waterMaxBottles;
    const nextWater = {};
    Object.entries(waterByDate).forEach(([iso, val]) => {
      const glasses = Number(val) || 0;
      if (glasses <= 0) return;
      if (glasses >= oldGlassGoal) nextWater[iso] = goalBottles;
      else {
        const bottles = Math.ceil((glasses * 250) / bottleMl);
        if (bottles > 0) nextWater[iso] = bottles;
      }
    });
    return { settings: nextSettings, waterByDate: nextWater };
  }

  function waterBottleMl() {
    const ml = Number(state.settings.waterBottleMl);
    return Number.isFinite(ml) && ml >= 250 ? Math.round(ml) : DEFAULT_WATER_BOTTLE_ML;
  }

  function waterGoalBottles() {
    const n = Number(state.settings.waterGoalBottles);
    if (!Number.isFinite(n) || n < 1) return DEFAULT_WATER_GOAL_BOTTLES;
    return Math.min(6, Math.round(n * 2) / 2);
  }

  function bodyWeightKgForWater() {
    return getCurrentWeightKg() ?? state.profile.startWeightKg ?? null;
  }

  function estimateWeightKgFromHeight(heightCm) {
    if (!heightCm) return null;
    const m = heightCm / 100;
    return 22 * m * m;
  }

  function waterMaxMlForBody() {
    let kg = bodyWeightKgForWater();
    if (!kg) kg = estimateWeightKgFromHeight(state.profile.heightCm);
    if (!kg) return null;
    const ml = Math.round(kg * WATER_ML_PER_KG_CAUTION);
    return Math.min(4500, Math.max(1800, ml));
  }

  function waterMlLogged(bottles) {
    return Math.round((Number(bottles) || 0) * waterBottleMl());
  }

  function waterStatusLevel(bottles) {
    const maxMl = waterMaxMlForBody();
    if (maxMl && waterMlLogged(bottles) > maxMl) return "caution";
    if (bottles >= waterGoalBottles()) return "done";
    return "normal";
  }

  function formatWaterVolume(ml) {
    if (ml >= 1000) {
      const l = ml / 1000;
      return Number.isInteger(l) ? `${l} L` : `${l.toFixed(1)} L`;
    }
    return `${ml} ml`;
  }

  function formatBottleCount(n) {
    const v = Math.round(n * 2) / 2;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  function waterBottleLabel(bottles) {
    const n = Number(bottles) || 0;
    if (n === 1) return "1 bottle";
    return `${formatBottleCount(n)} bottles`;
  }

  function waterPerBottleNote() {
    return `${formatWaterVolume(waterBottleMl())} per bottle`;
  }

  function waterGoalLineText() {
    const goal = waterGoalBottles();
    const goalMl = Math.round(waterBottleMl() * goal);
    return `Goal: ${formatBottleCount(goal)} bottles (${formatWaterVolume(goalMl)})`;
  }

  function waterProgressPercent(bottles) {
    const goal = waterGoalBottles();
    if (!goal) return 0;
    return Math.min(100, Math.round((bottles / goal) * 100));
  }

  function waterCountHeadline(bottles) {
    if (!bottles) return waterBottleLabel(0);
    const level = waterStatusLevel(bottles);
    if (level === "caution") return `${waterBottleLabel(bottles)}, Caution`;
    if (level === "done") return `${waterBottleLabel(bottles)}, Done`;
    return waterBottleLabel(bottles);
  }

  function updateWaterUI(bottles) {
    const countEl = $("waterCountLine");
    const tagEl = $("waterDoneTag");
    const hintEl = $("waterHint");
    const goalEl = $("waterGoalLine");
    const fillEl = $("waterProgressFill");
    const barEl = $("waterProgressBar");
    const level = waterStatusLevel(bottles);
    const pct = waterProgressPercent(bottles);

    if (countEl) countEl.textContent = waterBottleLabel(bottles);
    if (tagEl) {
      const show = level !== "normal" && bottles > 0;
      tagEl.classList.toggle("hidden", !show);
      tagEl.textContent = level === "caution" ? "Caution" : "Done";
      tagEl.classList.toggle("is-done", level === "done");
      tagEl.classList.toggle("is-caution", level === "caution");
    }
    if (hintEl) hintEl.textContent = waterPerBottleNote();
    if (goalEl) goalEl.textContent = waterGoalLineText();
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (barEl) {
      barEl.setAttribute("aria-valuenow", String(pct));
      barEl.classList.toggle("is-complete", level === "done");
      barEl.classList.toggle("is-caution", level === "caution");
    }
  }

  function getWaterBottles(iso) {
    return state.waterByDate[iso] ?? 0;
  }

  function setWaterBottles(iso, bottles) {
    const b = Math.max(0, Math.min(12, bottles));
    if (b === 0) delete state.waterByDate[iso];
    else state.waterByDate[iso] = b;
    saveState();
    render();
  }

  function collectActivityMonthKeys() {
    const set = new Set();
    const add = (iso) => {
      if (iso && iso.length >= 7) set.add(iso.slice(0, 7));
    };
    state.mealLogs.forEach((l) => add(l.date));
    state.weightEntries.forEach((e) => add(e.date));
    Object.keys(state.waterByDate).forEach(add);
    state.exerciseLogs.forEach((e) => add(e.date));
    if (state.profile.goalStartDate) add(state.profile.goalStartDate);
    return set;
  }

  function buildMonthNavList() {
    const now = new Date();
    const current = monthKeyFromDate(now);
    const next = monthKeyFromDate(new Date(now.getFullYear(), now.getMonth() + 1, 1));
    const list = new Set(collectActivityMonthKeys());
    list.add(current);
    list.add(next);
    const sorted = [...list].sort();
    const filtered = sorted.filter((m) => m <= next);
    if (!filtered.includes(current)) filtered.push(current);
    filtered.sort();
    return filtered;
  }

  function syncMonthNavIndex() {
    monthNavList = buildMonthNavList();
    const current = monthKeyFromDate(new Date());
    let idx = monthNavList.indexOf(current);
    if (idx < 0) idx = monthNavList.length - 1;
    if (monthNavIndex < 0 || monthNavIndex >= monthNavList.length) monthNavIndex = idx;
  }

  function exerciseForDate(iso) {
    return state.exerciseLogs.filter((e) => e.date === iso);
  }

  function saveExercise(type, minutes, manualCalories) {
    const auto = caloriesForExerciseType(type, minutes);
    const calories =
      manualCalories != null && Number.isFinite(manualCalories) && manualCalories >= 0
        ? Math.round(manualCalories)
        : auto;
    state.exerciseLogs.unshift({
      id: `ex-${Date.now()}`,
      date: todayStr(),
      type,
      minutes,
      calories,
      manual: manualCalories != null && manualCalories !== "",
      at: new Date().toISOString(),
    });
    saveState();
    render();
  }

  function deleteExercise(id) {
    state.exerciseLogs = state.exerciseLogs.filter((e) => e.id !== id);
    saveState();
    render();
  }

  function getCurrentWeightKg() {
    const t = M.weightOnDate(state.weightEntries, todayStr());
    if (t != null) return t;
    return M.latestWeight(state.weightEntries)?.weightKg ?? null;
  }

  function mealsForDate(iso) {
    return state.mealLogs.filter((l) => l.date === iso);
  }

  function mealsForToday() {
    return mealsForDate(todayStr());
  }

  function addMealLog(meal, name, portion, calories) {
    const entry = {
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: todayStr(),
      meal,
      kind: "fixed",
      name,
      portion: portion || null,
      calories: calories != null && Number.isFinite(calories) ? Math.round(calories) : null,
      at: new Date().toISOString(),
    };
    state.mealLogs.unshift(entry);
    saveState();
    renderAfterMealAdd();
  }

  function addPlateMealLog(meal, draft) {
    const library = plateFoodsForMeal(meal);
    const total = PM.mealTotalRange(draft, library);
    if (!total) return;
    const components = draft.map((d) => {
      const size = PM.normalizeSize(d.size);
      const r = PM.lineRange({ ...d, size }, library);
      return {
        name: d.name,
        container: d.container,
        size,
        caloriesLow: r.low,
        caloriesHigh: r.high,
      };
    });
    const entry = {
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: todayStr(),
      meal,
      kind: "plate",
      name: draft.map((d) => d.name).join(", "),
      components,
      caloriesLow: total.low,
      caloriesHigh: total.high,
      calories: PM.mealCaloriesMid(total),
      at: new Date().toISOString(),
    };
    state.mealLogs.unshift(entry);
    saveState();
    resetPlateDraft();
    renderAfterMealAdd();
    renderPlateBuilder();
  }

  function setMealLibraryEmpty(listEl, isEmpty) {
    const shell = listEl?.closest(".meal-food-library");
    if (shell) shell.classList.toggle("is-empty", isEmpty);
  }

  function renderMealLibraryEmpty(listEl) {
    listEl.innerHTML = "";
    setMealLibraryEmpty(listEl, true);
    const empty = document.createElement("p");
    empty.className = "meal-library-empty";
    empty.textContent = "No items yet. Add one above.";
    listEl.appendChild(empty);
  }

  function draftItemKey(name) {
    return (name || "").trim().toLowerCase();
  }

  function findPresetIndex(meal, name) {
    const list = state.foodPresets[meal] || [];
    const key = draftItemKey(name);
    return list.findIndex((n) => draftItemKey(n) === key);
  }

  function addPresetIfNew(meal, name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return false;
    if (!state.foodPresets[meal]) state.foodPresets[meal] = [];
    if (findPresetIndex(meal, trimmed) >= 0) return false;
    state.foodPresets[meal].push(trimmed);
    return true;
  }

  function mergeFixedDraftItems(items) {
    const map = new Map();
    items.forEach((item) => {
      const key = draftItemKey(item.name);
      const prev = map.get(key);
      if (!prev) {
        map.set(key, { name: item.name.trim(), kcal: item.kcal });
        return;
      }
      if (item.kcal != null && Number.isFinite(item.kcal)) prev.kcal = item.kcal;
    });
    return [...map.values()];
  }

  function fixedItemsForSave() {
    const items = [...fixedDraft];
    const pending = readQuickAddPending();
    if (pending) items.push({ name: pending.name, kcal: pending.kcal });
    return mergeFixedDraftItems(items);
  }

  function caloriesForDraftItem(item) {
    if (item.kcal != null && Number.isFinite(item.kcal)) return Math.round(item.kcal);
    const info = getPresetCalorieInfo(activeMeal, item.name);
    if (info.kcal != null && Number.isFinite(info.kcal)) return Math.round(info.kcal);
    return 0;
  }

  function readQuickAddPending() {
    const name = $("foodQuickAddName")?.value.trim();
    if (!name) return null;
    const kcalRaw = $("foodQuickAddKcal")?.value;
    if (kcalRaw !== "" && kcalRaw != null) {
      const k = parseInt(kcalRaw, 10);
      if (Number.isFinite(k) && k >= 0) return { name, kcal: k };
    }
    return { name, kcal: null };
  }

  function fixedDraftCalorieTotal() {
    return fixedItemsForSave().reduce((s, item) => s + caloriesForDraftItem(item), 0);
  }

  function clearQuickAddForm() {
    if ($("foodQuickAddName")) $("foodQuickAddName").value = "";
    if ($("foodQuickAddKcal")) $("foodQuickAddKcal").value = "";
    quickAddKcalTouched = false;
    lastQuickAddName = "";
  }

  function syncQuickAddKcalFromName() {
    const name = $("foodQuickAddName")?.value.trim() || "";
    if (name !== lastQuickAddName) {
      lastQuickAddName = name;
      quickAddKcalTouched = false;
    }
    if (!name || quickAddKcalTouched || !$("foodQuickAddKcal")) return;
    const ov = presetKcalOverride(activeMeal, name);
    const cat = activeMeal === "snacks" ? snackCatalogKcal(name) : null;
    let v = ov != null ? ov : cat;
    if (v == null) {
      const info = getPresetCalorieInfo(activeMeal, name);
      if (info.kcal != null && Number.isFinite(info.kcal)) v = Math.round(info.kcal);
    }
    $("foodQuickAddKcal").value = v != null ? String(v) : "";
  }

  let quickAddNutritionGen = 0;

  function onQuickAddNameInput() {
    const gen = ++quickAddNutritionGen;
    ensureNutritionForMeal(activeMeal)
      .then(() => {
        if (gen !== quickAddNutritionGen) return;
        syncQuickAddKcalFromName();
        renderFixedLogActions();
      })
      .catch(() => {
        syncQuickAddKcalFromName();
        renderFixedLogActions();
      });
  }

  function addQuickAddToDraftOnly() {
    const pending = readQuickAddPending();
    if (!pending) return;
    const key = draftItemKey(pending.name);
    const existing = fixedDraft.find((d) => draftItemKey(d.name) === key);
    if (existing) {
      existing.kcal = pending.kcal;
    } else {
      fixedDraft.push({ name: pending.name, kcal: pending.kcal });
    }
    clearQuickAddForm();
    renderFixedPanel();
  }

  function renderFixedLogActions() {
    const totalEl = $("fixedTotalCal");
    const saveBtn = $("fixedSaveBtn");
    const pending = readQuickAddPending();
    const has = fixedDraft.length > 0 || !!pending;
    totalEl?.classList.toggle("hidden", !has);
    saveBtn?.classList.toggle("hidden", !has);
    if (has && totalEl) {
      const label =
        activeMeal === "drinks"
          ? "Drinks estimate"
          : activeMeal === "snacks"
            ? "Snacks estimate"
            : "Meal estimate";
      totalEl.textContent = `${label}: ~${fixedDraftCalorieTotal()} kcal`;
    }
  }

  function renderFixedPanel() {
    syncQuickAddKcalFromName();
    renderFixedFoodLibrary();
    renderFixedLogActions();
  }

  function nextPlateKey() {
    return `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  }

  function resetPlateDraft() {
    plateDraft = [];
  }

  function resetFixedDraft() {
    fixedDraft = [];
    clearQuickAddForm();
  }

  function resetMealDrafts() {
    resetPlateDraft();
    resetFixedDraft();
  }

  function toggleFixedDraft(name) {
    const n = name.trim();
    if (!n) return;
    const key = draftItemKey(n);
    if (fixedDraft.some((x) => draftItemKey(x.name) === key)) {
      fixedDraft = fixedDraft.filter((x) => draftItemKey(x.name) !== key);
    } else {
      fixedDraft.push({ name: n, kcal: null });
    }
  }

  function saveFixedMeal() {
    const items = fixedItemsForSave();
    if (!items.length) return;
    let catalogChanged = false;
    items.forEach((item, i) => {
      const kcal = caloriesForDraftItem(item);
      if (activeMeal === "snacks") {
        catalogChanged =
          upsertSnackCatalog(item.name, kcal > 0 ? kcal : null) || catalogChanged;
      }
      const entry = {
        id: `meal-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        date: todayStr(),
        meal: activeMeal,
        kind: "fixed",
        name: item.name,
        portion: null,
        calories: kcal,
        at: new Date().toISOString(),
      };
      state.mealLogs.unshift(entry);
    });
    resetFixedDraft();
    clearQuickAddForm();
    saveState();
    renderAfterMealAdd();
    renderFixedPanel();
  }

  function ensurePlateFoodInLibrary(name, meal) {
    const n = name.trim();
    const m = meal || activeMeal;
    const list = plateFoodsForMeal(m);
    if (!n || PM.findFood(list, n)) return;
    let food = PM.foodForName(list, n);
    food = mergeDbBandsOntoFood(food, m);
    list.push(PM.normalizeFoodEntry(food));
  }

  function addPlateDraftItem(name) {
    const n = name.trim();
    if (!n) return;
    if (plateDraft.some((d) => d.name.toLowerCase() === n.toLowerCase())) return;
    ensurePlateFoodInLibrary(n);
    plateDraft.push({ key: nextPlateKey(), name: n, container: null, size: null });
    renderPlateBuilder();
  }

  function plateMealBudgetLeft() {
    const b = calorieBudgetToday();
    if (!b) return 600;
    return Math.max(200, b.left);
  }

  function formatPlateLogBody(entry) {
    if ((entry.kind === "plate" || entry.kind === "drink") && entry.components?.length) {
      const parts = entry.components.map((c) => {
        const lbl =
          entry.kind === "drink"
            ? DM.sizeLabel(c.vessel || c.container, c.size)
            : PM.sizeLabel(c.container, c.size);
        return `${c.name} ${lbl}`;
      });
      const kcal = `${entry.caloriesLow}–${entry.caloriesHigh} kcal`;
      return `${parts.join(" · ")} · ${kcal}`;
    }
    const portion = entry.portion ? `, ${entry.portion}` : "";
    const kcal =
      entry.caloriesLow != null && entry.caloriesHigh != null
        ? ` · ${entry.caloriesLow}–${entry.caloriesHigh} kcal`
        : entry.calories != null
          ? ` · ${entry.calories} kcal`
          : "";
    return `${entry.name}${portion}${kcal}`;
  }

  function draftBadgeLabel() {
    return isFixedOnlyMeal(activeMeal) ? "Selected" : "In meal";
  }

  function updateMealLogUiLabels() {
    const isDrinks = activeMeal === "drinks";
    const saveFixed = $("fixedSaveBtn");
    const saveBuild = $("plateSaveBtn");
    if (saveFixed) saveFixed.textContent = "Add to intake";
    if (saveBuild) saveBuild.textContent = "Add to intake";
    const mealSec = $("plateMealSectionLabel");
    if (mealSec) mealSec.textContent = "This meal";
    document.querySelectorAll("#mealLogModeRow .meal-log-mode-btn").forEach((btn) => {
      if (btn.dataset.mode === "build") btn.textContent = "Build";
    });
  }

  function deleteMeal(id) {
    state.mealLogs = state.mealLogs.filter((l) => l.id !== id);
    saveState();
    render();
  }

  function caloriesEatenToday() {
    return mealsForToday().reduce((sum, l) => sum + (l.calories || 0), 0);
  }

  function exerciseStatsToday() {
    const list = exerciseForDate(todayStr());
    const burned = list.reduce((s, e) => s + e.calories, 0);
    const bonus = Math.round(burned / 3);
    return { burned, bonus, count: list.length };
  }

  function calorieBudgetToday() {
    const p = state.profile;
    const w = getCurrentWeightKg();
    const plan = M.goalPlan(w, p.idealWeightKg, p.heightCm, p.age, p.sex);
    if (!plan) return null;
    const ex = exerciseStatsToday();
    const eaten = caloriesEatenToday();
    const allowance = plan.target + ex.bonus;
    const left = allowance - eaten;
    return { plan, eaten, allowance, left, bonus: ex.bonus, burned: ex.burned };
  }

  function monthRangeByKey(key) {
    const [y, m] = key.split("-").map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    const days = [];
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return { days, year: y, month: m - 1, firstWeekday: first.getDay(), key };
  }

  function activeDatesInDays(dayList) {
    const set = new Set();
    const inMonth = (iso) => dayList.includes(iso);
    state.mealLogs.forEach((l) => {
      if (inMonth(l.date)) set.add(l.date);
    });
    state.weightEntries.forEach((e) => {
      if (inMonth(e.date)) set.add(e.date);
    });
    Object.keys(state.waterByDate).forEach((d) => {
      if (inMonth(d) && state.waterByDate[d] > 0) set.add(d);
    });
    state.exerciseLogs.forEach((e) => {
      if (inMonth(e.date)) set.add(e.date);
    });
    return set;
  }

  function profileComplete() {
    const p = state.profile;
    return p.baselineSet && p.heightCm && p.startWeightKg != null && p.idealWeightKg != null && p.age;
  }

  function saveBaseline(form) {
    const age = parseInt(form.age, 10);
    const heightCm = parseFloat(form.height);
    const startWeightKg = parseFloat(form.weight);
    const idealWeightKg = parseFloat(form.ideal);
    const sex = form.sex === "female" ? "female" : "male";
    if (!Number.isFinite(age) || age < 10 || age > 120) {
      alert("Enter a valid age (10–120).");
      return;
    }
    if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
      alert("Enter a valid height in cm.");
      return;
    }
    if (!Number.isFinite(startWeightKg) || startWeightKg < 30 || startWeightKg > 300) {
      alert("Enter a valid starting weight in kg.");
      return;
    }
    if (!Number.isFinite(idealWeightKg) || idealWeightKg < 30 || idealWeightKg > 300) {
      alert("Enter a valid goal weight in kg.");
      return;
    }
    const p = state.profile;
    p.age = age;
    p.sex = sex;
    p.heightCm = heightCm;
    p.startWeightKg = startWeightKg;
    p.idealWeightKg = idealWeightKg;
    p.baselineSet = true;
    p.goalStartDate = todayStr();
    state.weightEntries = state.weightEntries.filter((e) => e.date !== todayStr());
    state.weightEntries.unshift({
      date: todayStr(),
      weightKg: p.startWeightKg,
      at: new Date().toISOString(),
    });
    saveState();
    render();
  }

  function saveWeightEntry(weightKg) {
    state.weightEntries = state.weightEntries.filter((e) => e.date !== todayStr());
    state.weightEntries.unshift({ date: todayStr(), weightKg, at: new Date().toISOString() });
    saveState();
    render();
  }

  function weightProgressLine() {
    const start = state.profile.startWeightKg;
    const current = getCurrentWeightKg();
    const ideal = state.profile.idealWeightKg;
    if (start == null || current == null) return "—";
    const change = current - start;
    const toGoal = ideal != null ? current - ideal : null;
    const ch = change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
    if (toGoal != null) {
      const to = toGoal >= 0 ? `${toGoal.toFixed(1)} kg to goal` : `${Math.abs(toGoal).toFixed(1)} kg past goal`;
      return `${current.toFixed(1)} kg · ${ch} from start · ${to}`;
    }
    return `${current.toFixed(1)} kg · ${ch} from start`;
  }

  function addExerciseType(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = slugExerciseId(trimmed);
    if (state.exerciseTypes.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) return;
    state.exerciseTypes.push({
      id,
      name: trimmed,
      note: "",
      kcalPerMin: guessKcalPerMin(trimmed),
      builtin: false,
    });
    selectedExerciseType = id;
    saveState();
    render();
  }

  function ensureExerciseTypes() {
    if (!state.exerciseTypes.length) {
      state.exerciseTypes = DEFAULT_EXERCISE_TYPES.map((t) => ({ ...t }));
      selectedExerciseType = state.exerciseTypes[0].id;
      saveState();
    }
  }

  function deleteExerciseType(id) {
    state.exerciseTypes = state.exerciseTypes.filter((x) => x.id !== id);
    if (selectedExerciseType === id) selectedExerciseType = state.exerciseTypes[0]?.id ?? null;
    ensureExerciseTypes();
    saveState();
    render();
  }

  function openExerciseTypeModal() {
    $("exerciseTypeModal").classList.remove("hidden");
    $("newExerciseTypeName").value = "";
    $("newExerciseTypeHint").textContent = "Burn rate estimated from name.";
    $("newExerciseTypeName").focus();
  }

  function closeExerciseTypeModal() {
    $("exerciseTypeModal").classList.add("hidden");
  }

  let openSwipeEl = null;
  let openLibraryMenuEl = null;

  function closeOpenSwipe() {
    if (!openSwipeEl) return;
    const content = openSwipeEl.querySelector(".swipe-row-content");
    if (content) content.style.transform = "";
    openSwipeEl = null;
  }

  function closeLibraryMenu() {
    if (openLibraryMenuEl) {
      openLibraryMenuEl.remove();
      openLibraryMenuEl = null;
    }
  }

  function showLibraryItemMenu(anchor, { onRename, onDelete }) {
    closeLibraryMenu();
    closeOpenSwipe();
    const menu = document.createElement("div");
    menu.className = "library-item-menu";
    menu.setAttribute("role", "menu");
    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "library-item-menu-btn";
    renameBtn.textContent = "Rename";
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLibraryMenu();
      onRename();
    });
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "library-item-menu-btn library-item-menu-btn--destructive";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeLibraryMenu();
      onDelete();
    });
    menu.append(renameBtn, deleteBtn);
    document.body.appendChild(menu);
    const rect = anchor.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    let left = rect.right - menuRect.width;
    let top = rect.bottom + 4;
    left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));
    if (top + menuRect.height > window.innerHeight - 8) top = rect.top - menuRect.height - 4;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    openLibraryMenuEl = menu;
  }

  function attachLibraryMoreButton(rowBtn, actions) {
    const more = document.createElement("button");
    more.type = "button";
    more.className = "plate-food-row-more";
    more.setAttribute("aria-label", "Item actions");
    more.setAttribute("aria-haspopup", "menu");
    more.textContent = "⋯";
    more.addEventListener("click", (e) => {
      e.stopPropagation();
      if (openLibraryMenuEl) {
        closeLibraryMenu();
        return;
      }
      showLibraryItemMenu(more, actions);
    });
    rowBtn.appendChild(more);
  }

  function attachSwipeDelete(wrap, onDelete) {
    attachSwipeRowActions(wrap, { onDelete });
  }

  function attachSwipeRowActions(wrap, { onDelete, onRename }) {
    const actions = document.createElement("div");
    actions.className =
      "swipe-row-actions" + (onRename && onDelete ? " swipe-row-actions--library" : "");
    if (onRename) {
      const renameBtn = document.createElement("button");
      renameBtn.type = "button";
      renameBtn.className = "swipe-rename-btn";
      renameBtn.textContent = "Rename";
      renameBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeOpenSwipe();
        onRename();
      });
      actions.appendChild(renameBtn);
    }
    if (onDelete) {
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "swipe-delete-btn";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeOpenSwipe();
        onDelete();
      });
      actions.appendChild(delBtn);
    }

    const content = document.createElement("div");
    content.className = "swipe-row-content";
    while (wrap.firstChild) content.appendChild(wrap.firstChild);
    wrap.appendChild(actions);
    wrap.appendChild(content);

    const revealWidth = onRename && onDelete ? 152 : 76;
    let startX = 0;
    let startY = 0;
    let axis = null;

    const setOffset = (px) => {
      content.style.transform = px ? `translateX(${px}px)` : "";
    };

    const onTouchStart = (e) => {
      if (openSwipeEl && openSwipeEl !== wrap) closeOpenSwipe();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      axis = null;
    };

    const onTouchMove = (e) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis !== "x") return;
      if (dx < -6) {
        setOffset(Math.max(dx, -revealWidth));
        e.preventDefault();
      } else if (openSwipeEl === wrap && dx > 0) {
        setOffset(Math.min(-revealWidth + dx, 0));
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      axis = null;
      const m = /translateX\((-?\d+)/.exec(content.style.transform);
      const current = m ? parseInt(m[1], 10) : 0;
      if (current < -revealWidth / 2) {
        closeOpenSwipe();
        setOffset(-revealWidth);
        openSwipeEl = wrap;
      } else {
        setOffset(0);
        if (openSwipeEl === wrap) openSwipeEl = null;
      }
    };

    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchmove", onTouchMove, { passive: false });
    wrap.addEventListener("touchend", onTouchEnd);
    wrap.addEventListener("touchcancel", onTouchEnd);
  }

  function renderExerciseTypePick() {
    const container = $("exerciseTypePick");
    if (!container) return;
    container.innerHTML = "";
    ensureExerciseTypes();
    if (!state.exerciseTypes.length) {
      container.innerHTML = '<p class="empty">None</p>';
      return;
    }
    if (!state.exerciseTypes.some((t) => t.id === selectedExerciseType)) {
      selectedExerciseType = state.exerciseTypes[0]?.id ?? null;
    }
    state.exerciseTypes.forEach((t) => {
      const swipe = document.createElement("div");
      swipe.className = "swipe-row";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "exercise-type-btn" + (t.id === selectedExerciseType ? " is-selected" : "");
      btn.dataset.type = t.id;
      const name = document.createElement("span");
      name.className = "exercise-type-name";
      name.textContent = t.name;
      btn.appendChild(name);
      if (t.note) {
        const note = document.createElement("span");
        note.className = "exercise-type-note";
        note.textContent = t.note;
        btn.appendChild(note);
      }
      btn.addEventListener("click", () => {
        selectedExerciseType = t.id;
        renderExerciseTypePick();
      });
      swipe.appendChild(btn);
      attachSwipeDelete(swipe, () => {
        if (confirm(`Delete "${t.name}"?`)) deleteExerciseType(t.id);
      });
      container.appendChild(swipe);
    });
  }

  function caloriesForDate(iso) {
    return mealsForDate(iso).reduce((sum, l) => sum + (l.calories || 0), 0);
  }

  function weightKgForDate(iso) {
    const onDay = M.weightOnDate(state.weightEntries, iso);
    if (onDay != null) return onDay;
    const past = [...state.weightEntries]
      .filter((e) => e.date <= iso && e.weightKg != null)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (past.length) return past[0].weightKg;
    return state.profile.startWeightKg ?? getCurrentWeightKg();
  }

  function exerciseStatsForDate(iso) {
    const list = exerciseForDate(iso);
    const burned = list.reduce((s, e) => s + e.calories, 0);
    return { burned, bonus: Math.round(burned / 3), count: list.length };
  }

  function calorieBudgetForDate(iso) {
    const p = state.profile;
    const w = weightKgForDate(iso);
    const plan = M.goalPlan(w, p.idealWeightKg, p.heightCm, p.age, p.sex);
    if (!plan) return null;
    const ex = exerciseStatsForDate(iso);
    const eaten = caloriesForDate(iso);
    const allowance = plan.target + ex.bonus;
    return { plan, eaten, allowance, left: allowance - eaten, bonus: ex.bonus };
  }

  /** Gray = no food logged; blue = logged and within allowance; red = logged and over. */
  function monthCellFoodStatus(iso) {
    const eaten = caloriesForDate(iso);
    if (eaten <= 0) return "none";
    const budget = calorieBudgetForDate(iso);
    if (!budget) return "on-budget";
    return eaten <= budget.allowance ? "on-budget" : "over";
  }

  function updateScrollLocks() {
    document.querySelectorAll(".view-scroll").forEach((el) => {
      if (el.classList.contains("view-scroll--static")) {
        el.classList.add("view-scroll--locked");
        return;
      }
      const view = el.closest(".view");
      if (!view?.classList.contains("active")) return;
      el.classList.remove("view-scroll--locked");
    });
  }

  let activeView = "summary";

  function captureScrollPositions() {
    const positions = {};
    document.querySelectorAll(".view-scroll, .food-pane").forEach((el) => {
      const view = el.closest(".view");
      if (view?.dataset.view) positions[view.dataset.view] = el.scrollTop;
    });
    return positions;
  }

  function restoreScrollPositions(positions) {
    document.querySelectorAll(".view-scroll, .food-pane").forEach((el) => {
      const view = el.closest(".view");
      if (view?.dataset.view && positions[view.dataset.view] != null) {
        el.scrollTop = positions[view.dataset.view];
      }
    });
  }

  function showView(name) {
    activeView = name;
    document.querySelectorAll(".view").forEach((el) => {
      el.classList.toggle("active", el.dataset.view === name);
    });
    document.querySelectorAll(".tab").forEach((tab) => {
      const on = tab.dataset.tab === name;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-current", on ? "page" : "false");
    });
    $("pageTitle").textContent = VIEW_TITLES[name] || "Summary";
    if (name === "food") {
      ensureNutritionForMeal(activeMeal)
        .then(() => renderFood())
        .catch(() => {});
    }
    requestAnimationFrame(() => {
      updateScrollLocks();
      requestAnimationFrame(updateScrollLocks);
    });
  }

  function renderSummary() {
    $("todayDate").textContent = formatDisplayDate(todayStr());

    const budget = calorieBudgetToday();
    const hero = $("calorieLeftHero");
    const unit = $("calorieLeftUnit");
    const sub = $("calorieLeftSub");
    if (!budget) {
      hero.textContent = "—";
      hero.classList.remove("is-set", "is-over");
      unit.classList.add("hidden");
      const label = document.querySelector(".intake-hero-label");
      if (label) label.textContent = "Intake left today";
      sub.textContent = "Set baseline in Profile";
      sub.classList.remove("hidden");
    } else {
      const left = Math.round(budget.left);
      const over = left < 0;
      hero.textContent = String(left);
      hero.classList.remove("is-set", "is-over");
      hero.classList.add(over ? "is-over" : "is-set");
      unit.classList.remove("hidden");
      const label = document.querySelector(".intake-hero-label");
      if (label) label.textContent = over ? "Over today" : "Intake left today";
      if (over) {
        sub.textContent = `${budget.eaten} eaten · over by ${-left} kcal · allowance ${budget.allowance} (+${budget.bonus} exercise)`;
      } else {
        sub.textContent = `${budget.eaten} eaten · ${budget.allowance} allowance · exercise +${budget.bonus}`;
      }
      sub.classList.remove("hidden");
    }

    const bottles = getWaterBottles(todayStr());
    const waterEl = $("waterStatusText");
    const waterLevel = waterStatusLevel(bottles);
    waterEl.textContent = bottles ? waterCountHeadline(bottles) : "None";
    waterEl.classList.toggle("is-set", waterLevel === "done");
    waterEl.classList.toggle("is-caution", waterLevel === "caution");

    const meals = mealsForToday();
    const foodEl = $("foodStatusText");
    if (!meals.length) {
      foodEl.textContent = "None";
      foodEl.classList.remove("is-set");
    } else {
      const kcal = caloriesEatenToday();
      foodEl.textContent = `${meals.length} · ${kcal} kcal`;
      foodEl.classList.add("is-set");
    }

    const ex = exerciseStatsToday();
    const exEl = $("exerciseStatusText");
    if (!ex.count) {
      exEl.textContent = "None";
      exEl.classList.remove("is-set");
    } else {
      exEl.textContent = `−${ex.burned} kcal (+${ex.bonus} allowed)`;
      exEl.classList.add("is-set");
    }

    const w = getCurrentWeightKg();
    const weightEl = $("weightStatusText");
    if (w != null) {
      weightEl.textContent = `${w.toFixed(1)} kg`;
      weightEl.classList.add("is-set");
    } else {
      weightEl.textContent = "None";
      weightEl.classList.remove("is-set");
    }

    $("progressStatusText").textContent = profileComplete() ? weightProgressLine() : "—";

    const track = M.onTrackStatus(state.weightEntries, state.profile, todayStr());
    const trackHead = $("trackStatusHead");
    const trackDetail = $("trackStatusDetail");
    if (trackHead) {
      trackHead.textContent = track.label;
      trackHead.classList.remove("on-track-yes", "on-track-no", "is-set");
      if (track.ok === true) trackHead.classList.add("on-track-yes", "is-set");
      if (track.ok === false) trackHead.classList.add("on-track-no", "is-set");
    }
    if (trackDetail) {
      if (track.detail && track.label !== "—") {
        trackDetail.textContent = track.detail;
        trackDetail.classList.remove("hidden");
      } else {
        trackDetail.textContent = "";
        trackDetail.classList.add("hidden");
      }
    }
  }

  function renderLogItem(container, meta, body, onDelete, options = {}) {
    if (options.swipe) {
      const wrap = document.createElement("div");
      wrap.className = "swipe-row log-swipe-row";
      const inner = document.createElement("div");
      inner.className = "log-item log-item--swipe";
      inner.innerHTML = `<div class="log-item-body"><span class="log-meta">${escapeHtml(meta)}</span> ${escapeHtml(body)}</div>`;
      wrap.appendChild(inner);
      attachSwipeDelete(wrap, onDelete);
      container.appendChild(wrap);
      return;
    }
    const row = document.createElement("div");
    row.className = "log-item";
    row.innerHTML = `<div class="log-item-body"><span class="log-meta">${escapeHtml(meta)}</span> ${escapeHtml(body)}</div>`;
    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn-delete";
    del.textContent = "Delete";
    del.addEventListener("click", onDelete);
    row.appendChild(del);
    container.appendChild(row);
  }

  function removePlateFood(index) {
    const list = plateFoodsForMeal(activeMeal);
    const name = list[index]?.name;
    list.splice(index, 1);
    if (name) {
      plateDraft = plateDraft.filter((d) => d.name.toLowerCase() !== name.toLowerCase());
    }
    saveState();
    renderFood();
  }

  function renamePlateFood(index) {
    const list = plateFoodsForMeal(activeMeal);
    const food = list[index];
    if (!food) return;
    const oldName = food.name;
    const newName = prompt("Rename item", oldName)?.trim();
    if (!newName || newName.toLowerCase() === oldName.toLowerCase()) return;
    if (list.some((f, i) => i !== index && f.name.toLowerCase() === newName.toLowerCase())) {
      alert("An item with that name is already on your list.");
      return;
    }
    food.name = newName;
    plateDraft = plateDraft.map((d) =>
      d.name.toLowerCase() === oldName.toLowerCase() ? { ...d, name: newName } : d
    );
    saveState();
    renderFood();
  }

  function foodRowSideHtml(inDraft, badge, kcalText) {
    if (!inDraft && !kcalText) return "";
    const badgeHtml = inDraft ? `<span class="plate-food-row-badge">${badge}</span>` : "";
    const kcalHtml = kcalText ? `<span class="plate-food-row-kcal">${kcalText}</span>` : "";
    return `<span class="plate-food-row-side">${badgeHtml}${kcalHtml}</span>`;
  }

  function removeFixedPreset(index) {
    const name = state.foodPresets[activeMeal][index];
    state.foodPresets[activeMeal].splice(index, 1);
    if (name) {
      fixedDraft = fixedDraft.filter((x) => draftItemKey(x.name) !== draftItemKey(name));
      const ov = state.presetKcalOverrides[activeMeal];
      if (ov && name) {
        const key = Object.keys(ov).find((k) => draftItemKey(k) === draftItemKey(name));
        if (key != null) delete ov[key];
      }
    }
    saveState();
    renderFood();
  }

  function renameFixedPreset(index) {
    const oldName = state.foodPresets[activeMeal][index];
    if (!oldName) return;
    const newName = prompt("Rename item", oldName)?.trim();
    if (!newName || newName.toLowerCase() === oldName.toLowerCase()) return;
    const meal = activeMeal;
    if (state.foodPresets[meal].some((n, i) => i !== index && n.toLowerCase() === newName.toLowerCase())) {
      alert("An item with that name is already on your list.");
      return;
    }
    const lockedKcal = presetDisplayedKcal(meal, oldName);
    state.foodPresets[meal][index] = newName;
    const ov = state.presetKcalOverrides[meal];
    if (ov) {
      const oldKey = Object.keys(ov).find((k) => draftItemKey(k) === draftItemKey(oldName));
      if (oldKey != null) {
        ov[newName] = ov[oldKey];
        delete ov[oldKey];
      }
    }
    if (lockedKcal != null) {
      if (!state.presetKcalOverrides[meal]) state.presetKcalOverrides[meal] = {};
      state.presetKcalOverrides[meal][newName] = lockedKcal;
    }
    fixedDraft = fixedDraft.map((d) =>
      draftItemKey(d.name) === draftItemKey(oldName) ? { ...d, name: newName } : d
    );
    saveState();
    renderFood();
  }

  function renderFixedFoodLibrary() {
    const list = $("foodFixedLibraryList");
    if (!list) return;
    const items = state.foodPresets[activeMeal] || [];
    list.innerHTML = "";
    if (!items.length) {
      renderMealLibraryEmpty(list);
      return;
    }
    setMealLibraryEmpty(list, false);
    items.forEach((name, index) => {
      const wrap = document.createElement("div");
      wrap.className = "plate-food-library-row";
      const inDraft = fixedDraft.some((x) => draftItemKey(x.name) === draftItemKey(name));
      const badge = draftBadgeLabel();
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "plate-food-row";
      btn.classList.toggle("is-in-meal", inDraft);
      const kcalText = formatKcalHint(getPresetCalorieInfo(activeMeal, name));
      btn.innerHTML = `<span class="plate-food-row-name">${escapeHtml(name)}</span>${foodRowSideHtml(
        inDraft,
        badge,
        kcalText
      )}`;
      btn.addEventListener("click", () => {
        toggleFixedDraft(name);
        renderFixedPanel();
      });
      attachLibraryMoreButton(btn, {
        onRename: () => renameFixedPreset(index),
        onDelete: () => removeFixedPreset(index),
      });
      wrap.appendChild(btn);
      list.appendChild(wrap);
    });
  }

  function renderPlateFoodLibrary() {
    const list = $("plateFoodLibraryList");
    if (!list) return;
    const foods = plateFoodsForMeal(activeMeal);
    list.innerHTML = "";
    if (!foods.length) {
      renderMealLibraryEmpty(list);
      return;
    }
    setMealLibraryEmpty(list, false);
    foods.forEach((food, index) => {
      const wrap = document.createElement("div");
      wrap.className = "plate-food-library-row";
      const inDraft = plateDraft.some((d) => d.name.toLowerCase() === food.name.toLowerCase());
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "plate-food-row";
      btn.classList.toggle("is-in-meal", inDraft);
      const badge = draftBadgeLabel();
      btn.innerHTML = `<span class="plate-food-row-name">${escapeHtml(food.name)}</span>${foodRowSideHtml(
        inDraft,
        badge,
        ""
      )}`;
      btn.addEventListener("click", () => {
        if (inDraft) {
          plateDraft = plateDraft.filter((d) => d.name.toLowerCase() !== food.name.toLowerCase());
        } else {
          addPlateDraftItem(food.name);
          return;
        }
        renderPlateBuilder();
      });
      attachLibraryMoreButton(btn, {
        onRename: () => renamePlateFood(index),
        onDelete: () => removePlateFood(index),
      });
      wrap.appendChild(btn);
      list.appendChild(wrap);
    });
  }

  function renderPlateBuilder() {
    renderPlateFoodLibrary();

    const allVessels = plateDraft.length > 0 && plateDraft.every((d) => d.container);
    const suggestByKey = new Map();
    if (allVessels) {
      PM.suggestPortions(plateDraft, plateFoodsForMeal(activeMeal), plateMealBudgetLeft()).forEach((s) => {
        suggestByKey.set(s.key, s);
        const line = plateDraft.find((x) => x.key === s.key);
        if (line && !line.size) line.size = s.size;
      });
    }

    const draftEl = $("plateDraftList");
    const mealLabel = $("plateMealSectionLabel");
    draftEl.innerHTML = "";
    mealLabel?.classList.toggle("hidden", !plateDraft.length);
    if (!plateDraft.length) {
      draftEl.innerHTML = "";
    } else {
      plateDraft.forEach((d) => {
        const row = document.createElement("div");
        row.className = "plate-draft-row";

        const head = document.createElement("div");
        head.className = "plate-draft-head";
        const title = document.createElement("span");
        title.className = "plate-draft-name";
        title.textContent = d.name;
        head.appendChild(title);
        const sug = document.createElement("span");
        sug.className = "plate-suggest";
        const hint = suggestByKey.get(d.key);
        if (hint && d.container) {
          sug.textContent = `~${hint.label}`;
        } else {
          sug.textContent = "";
        }
        head.appendChild(sug);
        row.appendChild(head);

        const vessel = document.createElement("div");
        vessel.className = "plate-vessel-segment plate-portion-track";
        ["bowl", "plate"].forEach((c) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "portion-btn";
          b.textContent = c === "bowl" ? "Bowl" : "Plate";
          b.classList.toggle("is-selected", d.container === c);
          b.addEventListener("click", () => {
            d.container = c;
            d.size = null;
            renderPlateBuilder();
          });
          vessel.appendChild(b);
        });
        row.appendChild(vessel);

        if (d.container) {
          const sizes = PM.sizesForContainer(d.container);
          const seg = document.createElement("div");
          seg.className = "plate-size-segment--four plate-portion-track";
          sizes.forEach((size) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "portion-btn";
            b.textContent = PM.sizeLabel(d.container, size);
            b.classList.toggle("is-selected", d.size === size);
            b.addEventListener("click", () => {
              d.size = size;
              renderPlateBuilder();
            });
            seg.appendChild(b);
          });
          row.appendChild(seg);
        }

        const r = PM.lineRange(d, plateFoodsForMeal(activeMeal));
        if (r && d.size) {
          const note = document.createElement("p");
          note.className = "plate-line-kcal";
          note.textContent = `~${r.low}–${r.high} kcal`;
          row.appendChild(note);
        }

        draftEl.appendChild(row);
      });
    }

    const allSized = plateDraft.length > 0 && plateDraft.every((d) => d.container && d.size);
    const total = allSized ? PM.mealTotalRange(plateDraft, plateFoodsForMeal(activeMeal)) : null;
    const totalEl = $("plateTotalRange");
    totalEl.classList.toggle("hidden", !total);
    if (total) {
      totalEl.textContent = `Meal estimate: ~${total.low}–${total.high} kcal`;
    }
    $("plateSaveBtn").classList.toggle("hidden", !allSized);
  }

  function renderBuildPanel() {
    renderPlateBuilder();
  }

  function renderFood() {
    document.querySelectorAll("#mealTypeSegment .meal-tab").forEach((btn) => {
      btn.classList.toggle("is-selected", btn.dataset.meal === activeMeal);
    });

    $("foodRecordPanel").classList.remove("hidden");

    const fixedOnly = isFixedOnlyMeal(activeMeal);
    $("foodRecordPanel")?.classList.toggle("food-record-panel--fixed-only", fixedOnly);
    $("foodRecordPanel")?.classList.toggle("food-record-panel--drinks", fixedOnly);
    $("mealLogModeRow")?.classList.toggle("hidden", fixedOnly);

    let mode;
    if (fixedOnly) {
      mode = "fixed";
      foodLogModeByMeal[activeMeal] = "fixed";
    } else {
      mode = foodLogModeByMeal[activeMeal] || (activeMeal === "lunch" ? "fixed" : "build");
      foodLogModeByMeal[activeMeal] = mode;
    }

    document.querySelectorAll("#mealLogModeRow .meal-log-mode-btn").forEach((btn) => {
      btn.classList.toggle("is-selected", btn.dataset.mode === mode);
    });

    updateMealLogUiLabels();

    $("foodFixedPanel")?.classList.toggle("hidden", mode !== "fixed");
    $("foodBuildPanel")?.classList.toggle("hidden", fixedOnly || mode !== "build");

    $("foodQuickAddForm")?.classList.toggle("hidden", mode !== "fixed");
    if (mode === "fixed") renderFixedPanel();

    if (!fixedOnly && mode === "build") renderBuildPanel();

    const bottles = getWaterBottles(todayStr());
    updateWaterUI(bottles);

    renderFoodTodayList();
  }

  function renderExercise() {
    renderExerciseTypePick();
    const list = $("exerciseTodayList");
    const items = exerciseForDate(todayStr());
    if (!items.length) {
      list.innerHTML = '<p class="empty">None</p>';
    } else {
      list.innerHTML = "";
      items.forEach((e) => {
        const manual = e.manual ? " · manual" : "";
        renderLogItem(
          list,
          exerciseTypeLabel(e.type),
          `${e.minutes} min · ${e.calories} kcal${manual}`,
          () => deleteExercise(e.id),
          { swipe: true }
        );
      });
    }
  }

  function renderProfile() {
    const complete = profileComplete();
    $("profileSetupBlock").classList.toggle("hidden", complete);
    $("profileMainBlock").classList.toggle("hidden", !complete);
    if (!complete) {
      $("setupAge").value = state.profile.age ?? "";
      $("setupSex").value = state.profile.sex || "male";
      $("setupHeight").value = state.profile.heightCm ?? "";
      $("setupWeight").value = "";
      $("setupIdeal").value = state.profile.idealWeightKg ?? "";
      return;
    }

    const p = state.profile;
    const w = getCurrentWeightKg();
    const bmr = w && p.heightCm && p.age ? M.bmr(w, p.heightCm, p.age, p.sex) : null;
    const bmiVal = w && p.heightCm ? M.bmi(w, p.heightCm) : null;
    let bmiText = "—";
    if (bmiVal != null) {
      const cat = M.bmiCategory(bmiVal);
      bmiText = `${cat.label}`;
    }

    $("baselineSummary").innerHTML = `
      <div class="baseline-main">
        <p class="baseline-line">Height ${p.heightCm} cm</p>
        <p class="baseline-line">Start ${p.startWeightKg.toFixed(1)} kg</p>
        <p class="baseline-line">Goal ${p.idealWeightKg.toFixed(1)} kg</p>
        <p class="baseline-line">Age ${p.age}</p>
      </div>
      <div class="baseline-metrics">
        <p class="baseline-line"><strong>BMR</strong><br>${bmr != null ? Math.round(bmr) : "—"} kcal</p>
        <p class="baseline-line"><strong>BMI</strong><br>${bmiVal != null ? `${bmiVal.toFixed(1)} · ${bmiText}` : "—"}</p>
      </div>
    `;

    $("editAge").value = p.age;
    $("editSex").value = p.sex;
    $("editHeight").value = p.heightCm;
    $("editIdeal").value = p.idealWeightKg;
    $("todayWeight").value = M.weightOnDate(state.weightEntries, todayStr()) ?? "";

    renderWeightMonthCalendar();
  }

  function renderWeightChart(el, dayIsos, compact) {
    if (!el) return;
    const weights = dayIsos.map((iso) => M.weightOnDate(state.weightEntries, iso));
    const valid = weights.filter((w) => w != null);
    if (!valid.length) {
      el.innerHTML = '<p class="empty">No weight entries</p>';
      return;
    }
    const min = Math.min(...valid);
    const max = Math.max(...valid);
    const span = Math.max(max - min, 0.5);
    el.innerHTML = "";
    dayIsos.forEach((iso) => {
      const w = M.weightOnDate(state.weightEntries, iso);
      const wrap = document.createElement("div");
      wrap.className = "chart-bar-wrap";
      const bar = document.createElement("div");
      bar.className = "chart-bar" + (w == null ? " empty" : "");
      if (w != null) bar.style.height = `${20 + ((w - min) / span) * 80}%`;
      const label = document.createElement("span");
      label.className = "chart-label";
      const d = new Date(iso + "T12:00:00");
      label.textContent = compact
        ? d.toLocaleDateString(LOCALE, { day: "numeric" })
        : d.toLocaleDateString(LOCALE, { weekday: "narrow" });
      const val = document.createElement("span");
      val.className = "chart-value";
      val.textContent = w != null ? w.toFixed(1) : "";
      wrap.appendChild(bar);
      wrap.appendChild(val);
      wrap.appendChild(label);
      el.appendChild(wrap);
    });
  }

  function renderWeightMonthCalendar() {
    syncMonthNavIndex();
    const key = monthNavList[monthNavIndex];
    const { days, firstWeekday } = monthRangeByKey(key);
    const today = todayStr();
    const currentKey = monthKeyFromDate(new Date());

    $("monthNavTitle").textContent = formatMonthTitle(key);
    $("monthOlder").disabled = monthNavIndex <= 0;
    $("monthNewer").disabled = monthNavIndex >= monthNavList.length - 1;

    const grid = $("monthGrid");
    if (!grid) return;
    grid.innerHTML = "";
    for (let i = 0; i < firstWeekday; i++) {
      const pad = document.createElement("div");
      pad.className = "month-cell is-pad";
      grid.appendChild(pad);
    }
    days.forEach((iso) => {
      const cell = document.createElement("div");
      cell.className = "month-cell";
      const w = M.weightOnDate(state.weightEntries, iso);
      const kcal = caloriesForDate(iso);
      const foodStatus = monthCellFoodStatus(iso);
      if (foodStatus === "none") cell.classList.add("is-no-log");
      else if (foodStatus === "over") cell.classList.add("is-over-budget");
      else cell.classList.add("is-on-budget");
      if (iso === today && key === currentKey) cell.classList.add("is-today");

      const dayNum = document.createElement("span");
      dayNum.className = "month-cell-day";
      dayNum.textContent = iso.slice(8, 10).replace(/^0/, "");
      cell.appendChild(dayNum);

      if (w != null) {
        const wEl = document.createElement("span");
        wEl.className = "month-cell-w";
        wEl.textContent = `${w.toFixed(1)} kg`;
        cell.appendChild(wEl);
      }
      if (kcal > 0) {
        const kEl = document.createElement("span");
        kEl.className = "month-cell-k";
        kEl.textContent = `${kcal} kcal`;
        cell.appendChild(kEl);
      }
      grid.appendChild(cell);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderFoodTodayList() {
    const todayList = $("todayFoodList");
    if (!todayList) return;
    const todayMeals = mealsForToday();
    const bottles = getWaterBottles(todayStr());
    if (!todayMeals.length && !bottles) {
      todayList.innerHTML = '<p class="empty">None</p>';
    } else {
      todayList.innerHTML = "";
      if (bottles) {
        renderLogItem(todayList, "Water", `${waterCountHeadline(bottles)} · ${waterPerBottleNote()}`, () => {
          setWaterBottles(todayStr(), 0);
        });
      }
      todayMeals.forEach((entry) => {
        renderLogItem(todayList, mealLabel(entry.meal), formatPlateLogBody(entry), () => deleteMeal(entry.id));
      });
    }
  }

  function render() {
    const scrollPos = captureScrollPositions();
    const foodTodayOpen = $("foodTodayDetails")?.open;

    renderSummary();
    renderFood();
    renderExercise();
    renderProfile();
    syncThemeToggle();

    if (foodTodayOpen && $("foodTodayDetails")) $("foodTodayDetails").open = true;

    requestAnimationFrame(() => {
      restoreScrollPositions(scrollPos);
      updateScrollLocks();
    });
  }

  function renderAfterMealAdd() {
    const scrollPos = captureScrollPositions();
    renderSummary();
    renderFoodTodayList();
    requestAnimationFrame(() => restoreScrollPositions(scrollPos));
  }

  function bindPreventZoom() {
    ["gesturestart", "gesturechange", "gestureend"].forEach((name) => {
      document.addEventListener(name, (e) => e.preventDefault(), { passive: false });
    });
    const bar = document.querySelector(".tab-bar");
    if (bar) bar.addEventListener("dblclick", (e) => e.preventDefault());
  }

  function bindEvents() {
    document.addEventListener("click", () => {
      closeOpenSwipe();
      closeLibraryMenu();
    });
    bindPreventZoom();

    document.querySelectorAll(".tab").forEach((tab) => {
      let lastTap = 0;
      tab.addEventListener("touchend", (e) => {
        const now = Date.now();
        if (now - lastTap < 400) e.preventDefault();
        lastTap = now;
      }, { passive: false });
      tab.addEventListener("click", () => {
        showView(tab.dataset.tab);
        tab.blur();
      });
    });

    document.querySelectorAll("#mealTypeSegment .meal-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeMeal = btn.dataset.meal;
        resetMealDrafts();
        ensureNutritionForMeal(activeMeal)
          .then(() => renderFood())
          .catch(() => renderFood());
      });
    });

    document.querySelectorAll("#mealLogModeRow .meal-log-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        foodLogModeByMeal[activeMeal] = btn.dataset.mode;
        resetMealDrafts();
        renderFood();
        requestAnimationFrame(updateScrollLocks);
      });
    });

    $("editBaselineBtn").addEventListener("click", () => {
      const form = $("profileEditForm");
      const hidden = form.classList.toggle("hidden");
      $("editBaselineBtn").textContent = hidden ? "Edit" : "Done";
      $("editBaselineBtn").setAttribute("aria-expanded", hidden ? "false" : "true");
    });

    $("plateAddCustomForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("plateCustomName").value.trim();
      if (!name) return;
      ensurePlateFoodInLibrary(name, activeMeal);
      $("plateCustomName").value = "";
      saveState();
      renderFood();
    });

    $("plateSaveBtn").addEventListener("click", () => {
      if (!plateDraft.every((d) => d.container && d.size)) return;
      addPlateMealLog(activeMeal, plateDraft);
    });

    $("fixedSaveBtn").addEventListener("click", () => saveFixedMeal());

    $("profileSetupForm").addEventListener("submit", (e) => {
      e.preventDefault();
      saveBaseline({
        age: $("setupAge").value,
        sex: $("setupSex").value,
        height: $("setupHeight").value,
        weight: $("setupWeight").value,
        ideal: $("setupIdeal").value,
      });
    });

    $("profileEditForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const p = state.profile;
      p.age = parseInt($("editAge").value, 10);
      p.sex = $("editSex").value;
      p.heightCm = parseFloat($("editHeight").value);
      p.idealWeightKg = parseFloat($("editIdeal").value);
      saveState();
      $("profileEditForm").classList.add("hidden");
      $("editBaselineBtn").textContent = "Edit";
      $("editBaselineBtn").setAttribute("aria-expanded", "false");
      render();
    });

    $("weightForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const weightKg = parseFloat($("todayWeight").value);
      if (!Number.isFinite(weightKg)) return;
      saveWeightEntry(weightKg);
    });

    $("addExerciseTypeBtn").addEventListener("click", openExerciseTypeModal);
    $("exerciseModalBackdrop").addEventListener("click", closeExerciseTypeModal);
    $("exerciseModalCancel").addEventListener("click", closeExerciseTypeModal);

    $("addExerciseTypeForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("newExerciseTypeName").value.trim();
      if (!name) return;
      addExerciseType(name);
      $("newExerciseTypeName").value = "";
      closeExerciseTypeModal();
    });

    $("newExerciseTypeName").addEventListener("input", (e) => {
      const name = e.target.value.trim();
      if (!name) {
        $("newExerciseTypeHint").textContent = "Burn rate estimated from name.";
        return;
      }
      $("newExerciseTypeHint").textContent = `About ${guessKcalPerMin(name)} kcal per minute (estimated).`;
    });

    $("exerciseForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const type = selectedExerciseType;
      const minutes = parseInt($("exerciseMinutes").value, 10);
      const manualRaw = $("exerciseCaloriesManual").value;
      const manual = manualRaw === "" ? null : parseInt(manualRaw, 10);
      if (!type || !exerciseTypeById(type)) return;
      if (!Number.isFinite(minutes) || minutes < 1) return;
      saveExercise(type, Math.min(30, minutes), manual);
    });

    $("waterPlus").addEventListener("click", () => setWaterBottles(todayStr(), getWaterBottles(todayStr()) + 1));
    $("waterMinus").addEventListener("click", () => setWaterBottles(todayStr(), getWaterBottles(todayStr()) - 1));

    ["foodTodayDetails"].forEach((id) => {
      const el = $(id);
      if (el) el.addEventListener("toggle", () => requestAnimationFrame(updateScrollLocks));
    });

    $("monthOlder").addEventListener("click", () => {
      if (monthNavIndex > 0) {
        monthNavIndex--;
        renderWeightMonthCalendar();
        requestAnimationFrame(updateScrollLocks);
      }
    });
    $("monthNewer").addEventListener("click", () => {
      if (monthNavIndex < monthNavList.length - 1) {
        monthNavIndex++;
        renderWeightMonthCalendar();
        requestAnimationFrame(updateScrollLocks);
      }
    });

    $("foodQuickAddName")?.addEventListener("input", onQuickAddNameInput);
    $("foodQuickAddKcal")?.addEventListener("input", () => {
      quickAddKcalTouched = true;
      renderFixedLogActions();
    });
    $("foodQuickAddKcal")?.addEventListener("blur", rememberSnackCatalogFromForm);
    $("foodQuickAddForm")?.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.target !== $("foodQuickAddName")) return;
      e.preventDefault();
      addQuickAddToDraftOnly();
    });
    $("foodQuickAddForm").addEventListener("submit", (e) => {
      e.preventDefault();
      let presetName = $("foodQuickAddName").value.trim();
      if (!presetName) return;
      const meal = activeMeal;
      const idx = findPresetIndex(meal, presetName);
      if (idx < 0) {
        addPresetIfNew(meal, presetName);
      } else {
        presetName = state.foodPresets[meal][idx];
      }
      let kcal = null;
      const kcalRaw = $("foodQuickAddKcal")?.value;
      if (kcalRaw !== "" && kcalRaw != null) {
        const parsed = parseInt(kcalRaw, 10);
        if (Number.isFinite(parsed) && parsed >= 0) kcal = parsed;
      }
      if (kcal == null) {
        const est = getPresetCalorieInfo(meal, presetName).kcal;
        if (est != null && Number.isFinite(est)) kcal = Math.round(est);
      }
      if (kcal != null) {
        if (!state.presetKcalOverrides[meal]) state.presetKcalOverrides[meal] = {};
        state.presetKcalOverrides[meal][presetName] = kcal;
      }
      clearQuickAddForm();
      saveState();
      renderFood();
    });

    $("themeToggleBtn").addEventListener("click", () => {
      state.settings.theme = state.settings.theme === "night" ? "day" : "night";
      applyTheme(state.settings.theme);
      syncThemeToggle();
      saveState();
    });

    $("forceAppUpdateBtn")?.addEventListener("click", () => {
      forceAppUpdate();
    });

    $("exportDataBtn")?.addEventListener("click", exportBackup);
    $("importDataBtn")?.addEventListener("click", () => $("importDataFile")?.click());
    $("importDataFile")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      importBackupFromFile(file);
    });

    $("resetData").addEventListener("click", () => {
      if (
        !confirm(
          "Erase ALL data on this device?\n\nMeals, drinks, weight, water, exercise, and your saved lists will be deleted. This cannot be undone."
        )
      ) {
        return;
      }
      if (!confirm('Tap OK only if you are sure.\n\nType mentally: you really want to reset everything.')) {
        return;
      }
      state = defaultState();
      monthNavIndex = 0;
      selectedExerciseType = "fitness_boxing";
      saveState();
      activeMeal = "lunch";
      resetMealDrafts();
      applyTheme(state.settings.theme);
      render();
      showView("summary");
    });
  }

  async function fetchRemoteBuild() {
    const res = await fetch(`files/version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return Number.isFinite(data.build) ? data.build : null;
  }

  async function forceAppUpdate() {
    if (
      !confirm(
        "Load the newest Diet app from the server?\n\nYour meal logs and settings stay on this phone. The screen may flash once."
      )
    ) {
      return;
    }
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (_) {}
    const remote = await fetchRemoteBuild().catch(() => null);
    const bump = remote != null ? remote : APP_RELEASE;
    localStorage.setItem(BUILD_STORAGE_KEY, String(Math.max(0, bump - 1)));
    const base = location.pathname.split("?")[0];
    location.replace(`${base}?refresh=${Date.now()}`);
  }

  function syncAppVersionLabel() {
    const el = $("appVersionLabel");
    if (el) el.textContent = `v${APP_RELEASE}`;
  }

  function wireIconCacheBust() {
    document.querySelectorAll('link[rel="apple-touch-icon"]').forEach((link) => {
      const base = (link.getAttribute("href") || "").split("?")[0];
      if (base) link.setAttribute("href", `${base}?v=6`);
    });
  }

  bindEvents();
  wireIconCacheBust();
  syncAppVersionLabel();
  window.addEventListener("resize", updateScrollLocks);
  render();
  showView("summary");
})();
