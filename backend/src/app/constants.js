"use strict";

module.exports = Object.freeze({
    CATEGORY_PREFIX: "Категорія:",
    STREET_CATEGORY_PREFIX: "Вулиці",
    CITY_CATEGORY_PREFIX: "Міста України",
    NAMED_AFTER_INFOBOX_KEY: "назва на честь",
    streetTypes: ["вулиця", "провулок", "площа", "перехрестя", "проспект", "майдан", "вул."],
    generalStreetArticleTitleRegex: /(вулиця|провулок|площа|перехрестя|проспект|майдан|вул.) ([-'\u0400-\u04FF\w\s]+)/ig,
    streetArticleTitleRegex: /(вулиця|провулок|площа|перехрестя|проспект|майдан) ([-'\u0400-\u04FF\w\s]+) \(([-'\u0400-\u04FF\w\s]+)\)/ig,
    personTitle: /(княз(?:ь|я|ів)|корол(?:ь|я|ів)|княгин(?:і|я)|королев(?:а|и)|гетьман(?:а|и)|отаман(?:и|а)|професор(?:и|а)|академік(?:и|а)|брат(?:и|ів)|сест(?:ри|ер)|архієпископ(?:а|и|ів))/ig,
    namedAfterArticleRegex: /Людина, на честь якої названі ці об’єкти:\s*([-'\u0400-\u04FF\w ()]+)/i,
    wikiSummaryCleanRegex: /\|[-?'\u0400-\u04FF\w\s]+=/g,
    wordsSplitRegex: /[-'\u0400-\u04FF\w]+/ig,
    clearSpecialSymbolsRegex: /[^\w\u0400-\u04FF\s'\-,.?!:;%()’—]+/g,
    images: ["фото", "портрет", "зображення", "герб", "прапор", "розташування"],
    nameInfoBoxProperty: "ім'я",
    namedEntityCategories: [
        {name: "Люди, на честь яких названі вулиці", priority: 8},
        {name: "Українські археологи", priority: 2},
        {name: "Українські етнографи", priority: 2},
        {name: "Українські історики", priority: 2},
        {name: "Українські краєзнавці", priority: 2},
        {name: "Українські поети", priority: 2},
        {name: "Жінки-науковці", priority: 2},
        {name: "Українські науковці", priority: 2},
        {name: "Українські винахідники", priority: 2},
        {name: "Українські селекціонери", priority: 2},
        {name: "Українські педіатри", priority: 2},
        {name: "Українські біологи", priority: 2},
        {name: "Українські зоологи", priority: 2},
        {name: "Українські орнітологи", priority: 2},
        {name: "Українські іконописці", priority: 2},
        {name: "Українські композитори", priority: 2},
        {name: "Українські релігійні діячі", priority: 2},
        {name: "Українські священики", priority: 1},
        {name: "Українські теологи", priority: 1},
        {name: "Українські педагоги", priority: 1},
        {name: "Українські філологи", priority: 1},
        {name: "Заслужені діячі науки і техніки України", priority: 2},
        {name: "Теребовельські князі", priority: 2},
        {name: "Люди, на честь яких названо астероїд", priority: 1},
        {name: "Польські військовики", priority: 1},
        {name: "Великі князі Київські", priority: 1},
        {name: "Переяславські князі", priority: 1},
        {name: "Рюриковичі", priority: 1},
        {name: "Іншомовні письменники, народжені в Україні", priority: 1},
        {name: "Польські поети", priority: 1},
        {name: "Думи", priority: 1},
        {name: "Телережисери", priority: 1},
        {name: "Персоналії", priority: 1, strictComparison: false},
    ],
});