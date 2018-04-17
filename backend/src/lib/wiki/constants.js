"use strict";

module.exports = Object.freeze({
    uk: {
        CATEGORY_PREFIX: "Категорія:",
        STREET_CATEGORY_PREFIX: "Вулиці",
        CITY_CATEGORY_PREFIX: "Міста України",
        NAMED_AFTER_INFOBOX_KEY: "назва на честь",
        streetTypes: ["вулиця", "провулок", "площа", "перехрестя", "проспект", "майдан"],
        generalStreetArticleTitleRegex: /(вулиця|провулок|площа|перехрестя|проспект|майдан) ([-'\u0400-\u04FF\w\s]+)/ig,
        streetArticleTitleRegex: /(вулиця|провулок|площа|перехрестя|проспект|майдан) ([-'\u0400-\u04FF\w\s]+) \(([-'\u0400-\u04FF\w\s]+)\)/ig,
        namedAfterArticleRegex: /Людина, на честь якої названі ці об’єкти:\s*([-'\u0400-\u04FF\w \(\)]+)/i,
        wordsSplitRegex: /[-'\u0400-\u04FF\w]+/ig,
        images: ["фото", "портрет", "зображення", "герб", "прапор", "розташування"],
        nameInfoBoxProperty: "ім'я",
        namedEntityCategories: [
            {name: "Люди, на честь яких названі вулиці", priority: 8, isPerson: true},
            // {name: "Міста України", priority: 5},
            {name: "Історія України", priority: 3},
            // {name: "Персоналії", priority: 3, isPerson: true},
            {name: "Український національно-визвольний рух", priority: 2},
            {name: "Україна у Другій світовій війні", priority: 2},
            {name: "Український партизанський рух", priority: 2},
            {name: "Українські археологи", priority: 2, isPerson: true},
            {name: "Українські етнографи", priority: 2, isPerson: true},
            {name: "Українські історики", priority: 2, isPerson: true},
            {name: "Українські краєзнавці", priority: 2, isPerson: true},
            {name: "Українські поети", priority: 2, isPerson: true},
            {name: "Вояки Армії УНР", priority: 2, isPerson: true},
            {name: "Жінки-науковці", priority: 2, isPerson: true},
            {name: "Українські науковці", priority: 2, isPerson: true},
            {name: "Українські винахідники", priority: 2, isPerson: true},
            {name: "Українські селекціонери", priority: 2, isPerson: true},
            {name: "Українські педіатри", priority: 2, isPerson: true},
            {name: "Українські біологи", priority: 2, isPerson: true},
            {name: "Українські зоологи", priority: 2, isPerson: true},
            {name: "Українські орнітологи", priority: 2, isPerson: true},
            {name: "Українські іконописці", priority: 2, isPerson: true},
            {name: "Українські композитори", priority: 2, isPerson: true},
            {name: "Українські релігійні діячі", priority: 2, isPerson: true},
            {name: "Заслужені діячі науки і техніки України", priority: 2, isPerson: true},
            {name: "Теребовельські князі", priority: 2, isPerson: true},
            {name: "Думи", priority: 1},
            {name: "Люди, на честь яких названо астероїд", priority: 1, isPerson: true},
            {name: "Червоний Хрест", priority: 1},
            {name: "Історичні організації Львова", priority: 1},
            {name: "Громадські організації України", priority: 1},
            {name: "Польські військовики", priority: 1, isPerson: true},
            {name: "Січові стрільці", priority: 1},
            {name: "Великі князі Київські", priority: 1, isPerson: true},
            {name: "Переяславські князі", priority: 1, isPerson: true},
            {name: "Рюриковичі", priority: 1, isPerson: true},
            {name: "Іншомовні письменники, народжені в Україні", priority: 1, isPerson: true},
            {name: "Польські поети", priority: 1, isPerson: true},
            {name: "Галицько-Волинське князівство", priority: 1},
            {name: "Православ'я в Речі Посполитій", priority: 1},
            {name: "Учасники Євромайдану", priority: 1},
        ]
    }
});