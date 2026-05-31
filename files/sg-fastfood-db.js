/**
 * Fast-food chains (SG) — approximate kcal; fuzzy match via aliases in DietSgNutrition.
 * Short forms: mcd, kfc, ph (Pizza Hut), bk, etc.
 */
(function (global) {
  const FOOD_MEALS = ["breakfast", "lunch", "dinner"];

  const ENTRIES = [
    // —— McDonald's ——
    {
      name: "McDonald's meal (avg)",
      aliases: [
        "mcd",
        "mcdonalds",
        "macdonalds",
        "mcdonald",
        "macdonald",
        "mac donalds",
        "mcdonlds",
        "mcdonalds meal",
        "mcd meal",
        "mcd lunch",
        "mcd dinner",
      ],
      meals: FOOD_MEALS,
      kcal: 520,
    },
    {
      name: "McDonald's McChicken meal",
      aliases: [
        "mcd mcchicken",
        "mcd chicken burger",
        "mcd chicken burger meal",
        "mcchicken meal",
        "mcd mcchicken meal",
        "mcd spicy chicken meal",
        "macdonalds mcchicken",
      ],
      meals: FOOD_MEALS,
      kcal: 650,
    },
    {
      name: "McDonald's Big Mac meal",
      aliases: ["mcd big mac", "big mac meal", "mcdonalds big mac meal", "bigmac meal"],
      meals: FOOD_MEALS,
      kcal: 720,
    },
    {
      name: "McDonald's McSpicy meal",
      aliases: ["mcd mcspicy", "mcd spicy meal", "mcspicy meal", "mcd spicy burger meal"],
      meals: FOOD_MEALS,
      kcal: 680,
    },
    {
      name: "McDonald's Double McSpicy meal",
      aliases: ["mcd double mcspicy", "double mcspicy meal"],
      meals: FOOD_MEALS,
      kcal: 900,
    },
    {
      name: "McDonald's Filet-O-Fish meal",
      aliases: ["mcd filet o fish", "filet o fish meal", "mcd fish burger meal"],
      meals: FOOD_MEALS,
      kcal: 580,
    },
    {
      name: "McDonald's McCrispy meal",
      aliases: ["mcd mccrispy", "mccrispy meal", "mcd crispy chicken meal"],
      meals: FOOD_MEALS,
      kcal: 700,
    },
    {
      name: "McDonald's 6pc McNuggets meal",
      aliases: ["mcd nuggets", "mcnuggets meal", "mcd 6pc nuggets", "nuggets meal mcd"],
      meals: FOOD_MEALS,
      kcal: 480,
    },
    {
      name: "McDonald's fries medium",
      aliases: ["mcd fries", "mcdonalds fries", "medium fries mcd"],
      meals: FOOD_MEALS,
      kcal: 320,
    },
    {
      name: "McDonald's breakfast set (avg)",
      aliases: ["mcd breakfast", "mcdonalds breakfast", "mcd hotcakes", "mcd pancake meal"],
      meals: FOOD_MEALS,
      kcal: 450,
    },

    // —— KFC ——
    {
      name: "KFC meal (avg)",
      aliases: [
        "kfc",
        "kentucky fried chicken",
        "kentucky fried",
        "kfc lunch",
        "kfc dinner",
        "kfc meal avg",
      ],
      meals: FOOD_MEALS,
      kcal: 700,
    },
    {
      name: "KFC 2 piece chicken meal",
      aliases: ["kfc 2pc", "kfc 2 piece", "kfc two piece meal", "kfc 2 pc meal"],
      meals: FOOD_MEALS,
      kcal: 750,
    },
    {
      name: "KFC 3 piece chicken meal",
      aliases: ["kfc 3pc", "kfc 3 piece meal"],
      meals: FOOD_MEALS,
      kcal: 900,
    },
    {
      name: "KFC Zinger burger meal",
      aliases: ["kfc zinger", "zinger meal", "kfc zinger burger", "zinger burger meal"],
      meals: FOOD_MEALS,
      kcal: 720,
    },
    {
      name: "KFC Zinger box",
      aliases: ["kfc zinger box", "zinger box meal"],
      meals: FOOD_MEALS,
      kcal: 850,
    },
    {
      name: "KFC popcorn chicken snack",
      aliases: ["kfc popcorn", "popcorn chicken kfc"],
      meals: FOOD_MEALS,
      kcal: 280,
    },

    // —— Pizza Hut ——
    {
      name: "Pizza Hut meal (avg)",
      aliases: [
        "pizza hut",
        "pizzahut",
        "pizza hot",
        "piza hut",
        "ph meal",
        "pizza hut meal",
        "pizzahut lunch",
      ],
      meals: FOOD_MEALS,
      kcal: 750,
    },
    {
      name: "Pizza Hut personal pan pizza",
      aliases: ["ph personal pan", "pizza hut personal", "personal pan pizza"],
      meals: FOOD_MEALS,
      kcal: 680,
    },
    {
      name: "Pizza Hut Hawaiian pizza (2 slices)",
      aliases: ["ph hawaiian", "pizza hut hawaiian", "hawaiian pizza meal"],
      meals: FOOD_MEALS,
      kcal: 620,
    },
    {
      name: "Pizza Hut pepperoni pizza (2 slices)",
      aliases: ["ph pepperoni", "pizza hut pepperoni"],
      meals: FOOD_MEALS,
      kcal: 700,
    },

    // —— Burger King ——
    {
      name: "Burger King meal (avg)",
      aliases: ["burger king", "burgerking", "bk meal", "bk", "burger king lunch"],
      meals: FOOD_MEALS,
      kcal: 680,
    },
    {
      name: "Burger King Whopper meal",
      aliases: ["bk whopper", "whopper meal", "burger king whopper"],
      meals: FOOD_MEALS,
      kcal: 900,
    },
    {
      name: "Burger King Tendergrill meal",
      aliases: ["bk tendergrill", "tendergrill meal"],
      meals: FOOD_MEALS,
      kcal: 650,
    },

    // —— Jollibee ——
    {
      name: "Jollibee meal (avg)",
      aliases: ["jollibee", "jolibee", "jollybee", "jollibee meal"],
      meals: FOOD_MEALS,
      kcal: 720,
    },
    {
      name: "Jollibee Chickenjoy 2pc meal",
      aliases: ["chickenjoy meal", "jollibee chickenjoy", "chickenjoy 2pc"],
      meals: FOOD_MEALS,
      kcal: 800,
    },
    {
      name: "Jollibee Yumburger meal",
      aliases: ["jollibee yumburger", "yumburger meal"],
      meals: FOOD_MEALS,
      kcal: 620,
    },

    // —— Texas Chicken / Popeyes / 4Fingers ——
    {
      name: "Texas Chicken 2 piece meal",
      aliases: ["texas chicken", "texas chiken", "texas chicken meal", "churchs chicken"],
      meals: FOOD_MEALS,
      kcal: 780,
    },
    {
      name: "Popeyes chicken meal (avg)",
      aliases: ["popeyes", "popeye", "popeyes meal", "popeyes chicken"],
      meals: FOOD_MEALS,
      kcal: 750,
    },
    {
      name: "4Fingers meal (avg)",
      aliases: ["4 fingers", "4fingers", "four fingers", "4 fingers meal"],
      meals: FOOD_MEALS,
      kcal: 700,
    },

    // —— Mos Burger / Carl's Jr / Five Guys ——
    {
      name: "Mos Burger meal (avg)",
      aliases: ["mos burger", "mosburger", "mos buger", "mos meal"],
      meals: FOOD_MEALS,
      kcal: 620,
    },
    {
      name: "Carl's Jr meal (avg)",
      aliases: ["carls jr", "carls junior", "carls", "carl's jr", "carls jr meal"],
      meals: FOOD_MEALS,
      kcal: 900,
    },
    {
      name: "Five Guys burger meal",
      aliases: ["five guys", "fiveguys", "5 guys meal"],
      meals: FOOD_MEALS,
      kcal: 1100,
    },

    // —— Other quick bites ——
    {
      name: "Subway footlong meal (avg)",
      aliases: ["subway footlong meal", "sub footlong meal"],
      meals: FOOD_MEALS,
      kcal: 650,
    },
    {
      name: "Old Chang Kee curry puff (2)",
      aliases: ["old chang kee meal", "occ meal"],
      meals: FOOD_MEALS,
      kcal: 360,
    },
  ];

  function dbEntries() {
    return ENTRIES.map((e) => ({ ...e }));
  }

  global.DietSgFastfood = {
    ENTRIES,
    dbEntries,
  };
})(typeof window !== "undefined" ? window : globalThis);
