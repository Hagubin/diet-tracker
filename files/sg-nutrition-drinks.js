/**
 * Drinks nutrition data — loaded on demand when you open the Drinks tab.
 */
(function (global) {
  const ENTRIES = [
    // —— Generic coffee / tea (no shop brand in what you type) ——
    { name: "Americano", aliases: ["americano", "black coffee"], meals: ["drinks"], kcal: 10 },
    { name: "Espresso", aliases: ["espresso shot", "single espresso"], meals: ["drinks"], kcal: 5 },
    { name: "Latte", aliases: ["caffe latte", "coffee latte", "hot latte"], meals: ["drinks"], kcal: 180 },
    { name: "Cappuccino", aliases: ["cappuccino", "cap coffee"], meals: ["drinks"], kcal: 120 },
    { name: "Flat white", aliases: ["flat white coffee"], meals: ["drinks"], kcal: 170 },
    { name: "Mocha coffee", aliases: ["caffe mocha", "mocha coffee"], meals: ["drinks"], kcal: 290 },
    { name: "Matcha latte", aliases: ["green tea latte", "matcha green latte"], meals: ["drinks"], kcal: 200 },
    { name: "Hot chocolate", aliases: ["hot cocoa", "drinking chocolate"], meals: ["drinks"], kcal: 200 },
    { name: "Iced coffee", aliases: ["iced americano", "cold brew coffee"], meals: ["drinks"], kcal: 15 },

    // —— Starbucks (rough label averages; not every menu item) ——
    { name: "Starbucks Tall latte", aliases: ["starbucks tall caffe latte", "tall latte", "starbucks tall iced latte"], meals: ["drinks"], kcal: 180 },
    { name: "Starbucks Grande latte", aliases: ["starbucks grande caffe latte", "grande latte", "starbucks grande iced latte"], meals: ["drinks"], kcal: 250 },
    { name: "Starbucks Venti latte", aliases: ["starbucks venti caffe latte", "venti latte", "starbucks venti iced latte"], meals: ["drinks"], kcal: 320 },
    { name: "Starbucks Tall black coffee", aliases: ["tall americano", "starbucks tall americano", "starbucks tall cold brew"], meals: ["drinks"], kcal: 15 },
    { name: "Starbucks Grande black coffee", aliases: ["grande americano", "starbucks grande cold brew"], meals: ["drinks"], kcal: 20 },
    { name: "Starbucks Venti black coffee", aliases: ["venti americano", "starbucks venti cold brew"], meals: ["drinks"], kcal: 25 },
    { name: "Starbucks Tall cappuccino", aliases: ["starbucks tall cap"], meals: ["drinks"], kcal: 100 },
    { name: "Starbucks Grande cappuccino", aliases: ["starbucks grande cap"], meals: ["drinks"], kcal: 140 },
    { name: "Starbucks Venti cappuccino", aliases: ["starbucks venti cap"], meals: ["drinks"], kcal: 200 },
    { name: "Starbucks Tall flat white", aliases: ["starbucks tall flat white"], meals: ["drinks"], kcal: 170 },
    { name: "Starbucks Grande flat white", meals: ["drinks"], kcal: 220 },
    { name: "Starbucks Venti flat white", meals: ["drinks"], kcal: 280 },
    { name: "Starbucks Tall mocha", aliases: ["starbucks tall caffe mocha", "tall mocha"], meals: ["drinks"], kcal: 290 },
    { name: "Starbucks Grande mocha", aliases: ["starbucks grande caffe mocha", "grande mocha"], meals: ["drinks"], kcal: 370 },
    { name: "Starbucks Venti mocha", aliases: ["starbucks venti caffe mocha", "venti mocha"], meals: ["drinks"], kcal: 450 },
    { name: "Starbucks Tall caramel macchiato", aliases: ["tall caramel macchiato"], meals: ["drinks"], kcal: 250 },
    { name: "Starbucks Grande caramel macchiato", aliases: ["grande caramel macchiato"], meals: ["drinks"], kcal: 330 },
    { name: "Starbucks Venti caramel macchiato", aliases: ["venti caramel macchiato"], meals: ["drinks"], kcal: 410 },
    { name: "Starbucks Tall white chocolate mocha", aliases: ["tall white mocha"], meals: ["drinks"], kcal: 350 },
    { name: "Starbucks Grande white chocolate mocha", aliases: ["grande white mocha"], meals: ["drinks"], kcal: 450 },
    { name: "Starbucks Venti white chocolate mocha", aliases: ["venti white mocha"], meals: ["drinks"], kcal: 550 },
    { name: "Starbucks Tall matcha latte", aliases: ["tall matcha latte", "starbucks tall green tea latte"], meals: ["drinks"], kcal: 200 },
    { name: "Starbucks Grande matcha latte", aliases: ["grande matcha latte"], meals: ["drinks"], kcal: 280 },
    { name: "Starbucks Venti matcha latte", aliases: ["venti matcha latte"], meals: ["drinks"], kcal: 360 },
    { name: "Starbucks Tall chai latte", aliases: ["tall chai tea latte"], meals: ["drinks"], kcal: 240 },
    { name: "Starbucks Grande chai latte", aliases: ["grande chai tea latte"], meals: ["drinks"], kcal: 320 },
    { name: "Starbucks Venti chai latte", aliases: ["venti chai tea latte"], meals: ["drinks"], kcal: 400 },
    { name: "Starbucks Tall hot chocolate", aliases: ["tall hot cocoa"], meals: ["drinks"], kcal: 320 },
    { name: "Starbucks Grande hot chocolate", aliases: ["grande hot cocoa"], meals: ["drinks"], kcal: 410 },
    { name: "Starbucks Venti hot chocolate", aliases: ["venti hot cocoa"], meals: ["drinks"], kcal: 500 },
    { name: "Starbucks Tall frappuccino", aliases: ["starbucks tall frap", "tall frappuccino", "tall java chip"], meals: ["drinks"], kcal: 280 },
    { name: "Starbucks Grande frappuccino", aliases: ["starbucks grande frap", "grande frappuccino", "grande java chip"], meals: ["drinks"], kcal: 380 },
    { name: "Starbucks Venti frappuccino", aliases: ["starbucks venti frap", "venti frappuccino"], meals: ["drinks"], kcal: 480 },
    { name: "Starbucks Tall refresher", aliases: ["tall pink drink", "tall strawberry acai", "tall mango dragonfruit"], meals: ["drinks"], kcal: 100 },
    { name: "Starbucks Grande refresher", aliases: ["grande pink drink", "grande strawberry acai"], meals: ["drinks"], kcal: 140 },
    { name: "Starbucks Venti refresher", aliases: ["venti pink drink", "venti strawberry acai"], meals: ["drinks"], kcal: 180 },
    { name: "Starbucks Tall iced tea lemonade", aliases: ["tall peach green tea", "tall iced tea"], meals: ["drinks"], kcal: 80 },
    { name: "Starbucks Grande iced tea lemonade", aliases: ["grande peach green tea"], meals: ["drinks"], kcal: 120 },
    { name: "Starbucks Venti iced tea lemonade", meals: ["drinks"], kcal: 160 },
    { name: "Starbucks Tall drink (avg)", aliases: ["starbucks tall", "sbux tall", "starbucks coffee tall"], meals: ["drinks"], kcal: 180 },
    { name: "Starbucks Grande drink (avg)", aliases: ["starbucks grande", "sbux grande", "starbucks coffee grande", "starbucks", "starbuks grande", "starbuks"], meals: ["drinks"], kcal: 250 },
    { name: "Starbucks Venti drink (avg)", aliases: ["starbucks venti", "sbux venti"], meals: ["drinks"], kcal: 320 },

    // —— Soft drinks (330ml can) ——
    { name: "Coke can", aliases: ["coca cola", "coca-cola", "coke 330", "coke can"], meals: ["drinks"], kcal: 139 },
    { name: "Sprite can", aliases: ["sprite 330"], meals: ["drinks"], kcal: 140 },
    { name: "Fanta orange can", aliases: ["fanta"], meals: ["drinks"], kcal: 150 },
    { name: "Pepsi can", aliases: ["pepsi 330"], meals: ["drinks"], kcal: 150 },
    { name: "Diet Coke can", aliases: ["coke zero", "coke light", "diet coke"], meals: ["drinks"], kcal: 1 },

    // —— Bubble tea (large cup ~700ml, full sugar + pearls unless noted; rough store averages) ——
    { name: "Bubble tea large", aliases: ["boba large", "milk tea large", "pearl milk tea large"], meals: ["drinks"], kcal: 350 },
    { name: "Bubble tea medium", aliases: ["boba medium", "milk tea medium"], meals: ["drinks"], kcal: 280 },
    { name: "Bubble tea small", aliases: ["boba small"], meals: ["drinks"], kcal: 220 },
    { name: "Bubble tea no sugar large", aliases: ["0% sugar bbt", "no sugar milk tea", "less sugar bbt large"], meals: ["drinks"], kcal: 200 },
    { name: "Brown sugar fresh milk large", aliases: ["brown sugar boba milk", "bsm large", "tiger sugar style"], meals: ["drinks"], kcal: 500 },
    { name: "Cheese foam tea large", aliases: ["cheese foam green tea", "cheese cap tea"], meals: ["drinks"], kcal: 400 },
    { name: "Fruit tea large", aliases: ["passion fruit tea large", "fruit bbt large"], meals: ["drinks"], kcal: 280 },
    { name: "Green tea latte large", aliases: ["matcha milk tea large", "green milk tea large"], meals: ["drinks"], kcal: 320 },
    { name: "Yakult green tea large", aliases: ["yakult tea large"], meals: ["drinks"], kcal: 300 },

    { name: "LiHO signature milk tea large", aliases: ["liho signature", "li ho signature milk tea", "liho milk tea large"], meals: ["drinks"], kcal: 400 },
    { name: "LiHO taro ball milk tea large", aliases: ["liho taro", "li ho taro"], meals: ["drinks"], kcal: 450 },
    { name: "LiHO avocado smoothie large", aliases: ["liho avocado", "li ho avocado"], meals: ["drinks"], kcal: 480 },
    { name: "LiHO da hong pao milk tea large", aliases: ["liho da hong pao", "li ho oolong"], meals: ["drinks"], kcal: 380 },
    { name: "LiHO cheese foam tea large", aliases: ["liho cheese foam", "li ho cheese cap"], meals: ["drinks"], kcal: 420 },

    { name: "KOI golden bubble milk tea large", aliases: ["koi golden bubble", "koi golden milk tea"], meals: ["drinks"], kcal: 450 },
    { name: "KOI grass jelly milk tea large", aliases: ["koi grass jelly", "koi cin cao"], meals: ["drinks"], kcal: 380 },
    { name: "KOI macadamia milk tea large", aliases: ["koi macadamia", "koi mac nut"], meals: ["drinks"], kcal: 420 },
    { name: "KOI thé latte large", aliases: ["koi the latte", "koi tea latte"], meals: ["drinks"], kcal: 350 },

    { name: "Gong Cha milk foam green tea large", aliases: ["gong cha milk foam", "gongcha foam green"], meals: ["drinks"], kcal: 350 },
    { name: "Gong Cha winter melon tea large", aliases: ["gong cha wintermelon", "gongcha winter melon"], meals: ["drinks"], kcal: 180 },
    { name: "Gong Cha earl grey milk tea large", aliases: ["gong cha earl grey", "gongcha earl grey"], meals: ["drinks"], kcal: 360 },
    { name: "Gong Cha passion fruit tea large", aliases: ["gong cha fruit tea", "gongcha passionfruit"], meals: ["drinks"], kcal: 280 },

    { name: "Tiger Sugar brown sugar boba milk large", aliases: ["tiger sugar boba", "tiger sugar brown sugar", "tigersugar"], meals: ["drinks"], kcal: 550 },
    { name: "Tiger Sugar boba fresh milk large", aliases: ["tiger sugar fresh milk"], meals: ["drinks"], kcal: 520 },

    { name: "PlayMade calamansi green tea large", aliases: ["playmade calamansi", "play made green tea"], meals: ["drinks"], kcal: 250 },
    { name: "Each-A-Cup milk tea large", aliases: ["each a cup milk tea", "eachacup"], meals: ["drinks"], kcal: 380 },
    { name: "R&B tea milk tea large", aliases: ["r and b tea", "r&b milk tea"], meals: ["drinks"], kcal: 390 },
    { name: "Xing Fu Tang brown sugar boba large", aliases: ["xing fu tang", "xingfutang"], meals: ["drinks"], kcal: 540 },

    { name: "LiHO drink large (avg)", aliases: ["liho large", "li ho large", "large liho", "liho"], meals: ["drinks"], kcal: 400 },
    { name: "KOI drink large (avg)", aliases: ["koi large", "large koi", "koi"], meals: ["drinks"], kcal: 400 },
    { name: "Gong Cha drink large (avg)", aliases: ["gong cha large", "large gong cha", "gongcha"], meals: ["drinks"], kcal: 350 },

    { name: "CHAGEE da hong pao milk tea large", aliases: ["chagee da hong pao", "chagee dhp", "bawangchaji dhp", "large chagee da hong pao"], meals: ["drinks"], kcal: 400 },
    { name: "CHAGEE ba wang chun ni milk tea large", aliases: ["chagee bawang chun ni", "chagee signature milk tea", "large chagee milk tea"], meals: ["drinks"], kcal: 450 },
    { name: "CHAGEE jasmine green milk tea large", aliases: ["chagee jasmine", "chagee green tea"], meals: ["drinks"], kcal: 350 },
    { name: "CHAGEE fresh milk tea large", aliases: ["chagee fresh milk", "chagee boba milk tea"], meals: ["drinks"], kcal: 380 },
    { name: "CHAGEE drink large (avg)", aliases: ["chagee large", "large chagee", "chagee", "chage", "bawangchaji"], meals: ["drinks"], kcal: 400 },

    { name: "Mixue lemonade large", aliases: ["mixue lemon", "mixue fruit tea"], meals: ["drinks"], kcal: 280 },
    { name: "Mixue ice cream tea large", aliases: ["mixue ice cream", "mixue fresh ice cream"], meals: ["drinks"], kcal: 350 },
    { name: "Mixue drink large (avg)", aliases: ["mixue large", "large mixue", "mixue"], meals: ["drinks"], kcal: 320 },

    { name: "Heytea cheese mango large", aliases: ["heytea mango", "heytea cheese tea"], meals: ["drinks"], kcal: 380 },
    { name: "Heytea grape green tea large", aliases: ["heytea grape", "large heytea grape"], meals: ["drinks"], kcal: 300 },
    { name: "Heytea drink large (avg)", aliases: ["heytea large", "large heytea", "heytea", "xicha"], meals: ["drinks"], kcal: 350 },

    { name: "Nayuki cheese strawberry large", aliases: ["nayuki strawberry", "nayuki cheese tea"], meals: ["drinks"], kcal: 400 },
    { name: "Nayuki drink large (avg)", aliases: ["nayuki large", "large nayuki", "nayuki", "naixue"], meals: ["drinks"], kcal: 380 },

    { name: "CoCo milk tea large", aliases: ["coco fresh tea", "coco bubble tea", "coco large"], meals: ["drinks"], kcal: 380 },
    { name: "Sharetea milk tea large", aliases: ["share tea", "sharetea large"], meals: ["drinks"], kcal: 350 },

    { name: "ZUS coffee latte Grande", aliases: ["zus latte", "zus coffee grande"], meals: ["drinks"], kcal: 240 },
    { name: "ZUS coffee drink (avg)", aliases: ["zus coffee", "zus"], meals: ["drinks"], kcal: 200 },
    { name: "Arabica latte", aliases: ["percent arabica", "arabica coffee", "arabica latte grande"], meals: ["drinks"], kcal: 200 },

    { name: "100Plus isotonic", aliases: ["100 plus", "hundred plus", "isotonic 100plus"], meals: ["drinks"], kcal: 110 },
    { name: "Packet soy milk", aliases: ["soya milk packet", "farmed soy milk", "unif soy milk"], meals: ["drinks"], kcal: 90 },
    { name: "Coconut water", aliases: ["coconut juice", "coco water"], meals: ["drinks"], kcal: 45 },
    { name: "Ribena", aliases: ["ribena packet", "ribena drink"], meals: ["drinks"], kcal: 90 },
    { name: "Yakult bottle", aliases: ["yakult drink"], meals: ["drinks"], kcal: 80 },
    { name: "Wine glass", aliases: ["red wine", "white wine glass"], meals: ["drinks"], kcal: 125 },
    { name: "Whisky shot", aliases: ["whiskey shot", "whisky glass"], meals: ["drinks"], kcal: 100 },

    // —— Kopitiam ——
    { name: "Kopi", aliases: ["coffee kopi", "kopi o kosong"], meals: ["drinks"], kcal: 90 },
    { name: "Kopi O", aliases: ["kopi o"], meals: ["drinks"], kcal: 80 },
    { name: "Kopi C", aliases: ["kopi c"], meals: ["drinks"], kcal: 120 },
    { name: "Teh", aliases: ["teh tarik", "milk tea teh"], meals: ["drinks"], kcal: 120 },
    { name: "Teh O", aliases: ["teh o kosong"], meals: ["drinks"], kcal: 30 },
    { name: "Milo", aliases: ["milo dinosaur", "milo dino"], meals: ["drinks"], kcal: 200 },
    { name: "Horlicks", meals: ["drinks"], kcal: 180 },
    { name: "Bandung", meals: ["drinks"], kcal: 180 },

    // —— Generic vessels (cup / can / bottle bands for drink builder) ——
    {
      name: "Coffee",
      aliases: ["black coffee", "instant coffee"],
      meals: ["drinks"],
      cup: { half: [2, 8], one: [8, 20] },
      can: { one: [90, 140] },
    },
    {
      name: "Tea",
      aliases: ["chinese tea", "green tea"],
      meals: ["drinks"],
      cup: { half: [0, 5], one: [5, 15] },
    },
    {
      name: "Milk tea",
      aliases: ["hk milk tea", "royal milk tea"],
      meals: ["drinks"],
      cup: { half: [80, 120], one: [200, 300] },
    },
    {
      name: "Juice",
      aliases: ["orange juice", "apple juice"],
      meals: ["drinks"],
      cup: { half: [40, 60], one: [100, 140] },
      bottle: { small: [50, 80], medium: [100, 150], large: [160, 240] },
    },
    {
      name: "Beer",
      aliases: ["tiger beer", "heineken"],
      meals: ["drinks"],
      can: { one: [140, 160] },
      bottle: { small: [90, 140], medium: [140, 200], large: [200, 280] },
    },
    {
      name: "Coke",
      aliases: ["cola"],
      meals: ["drinks"],
      can: { one: [130, 150] },
      bottle: { small: [80, 110], medium: [130, 160], large: [200, 260] },
    },
    {
      name: "Sprite",
      meals: ["drinks"],
      can: { one: [130, 150] },
    },
  ];

  function dbEntries() {
    return ENTRIES.map((e) => ({ ...e }));
  }

  global.DietSgDrinks = { ENTRIES, dbEntries };
})(typeof window !== "undefined" ? window : globalThis);
