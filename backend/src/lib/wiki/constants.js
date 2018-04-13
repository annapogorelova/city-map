"use strict";

module.exports = Object.freeze({
    uk: {
        CATEGORY_PREFIX: "Категорія:",
        STREET_CATEGORY_PREFIX: "Вулиці",
        CITY_CATEGORY_PREFIX: "Міста України",
        NAMED_AFTER_INFOBOX_KEY: "назва на честь",
        streetTypes: ["вулиця", "провулок", "площа", "перехрестя", "проспект", "майдан"],
        streetArticleTitleRegex: /(вулиця|провулок|площа|перехрестя|проспект|майдан) ([-'\u0400-\u04FF\w\s]+) \(([-'\u0400-\u04FF\w\s]+)\)/ig,
        images: ["фото", "портрет", "зображення", "герб", "прапор", "розташування"],
        namedEntityCategories: [
            {name: "Люди, на честь яких названі вулиці", priority: 8},
            {name: "Міста України", priority: 5},
            {name: "Історія України", priority: 3},
            {name: "Український національно-визвольний рух", priority: 2},
            {name: "Україна у Другій світовій війні", priority: 1},
            {name: "Український партизанський рух", priority: 1},
            {name: "Українські археологи", priority: 1},
            {name: "Українські етнографи", priority: 1},
            {name: "Українські мистецтвознавці", priority: 1},
            {name: "Українські музеологи", priority: 1},
            {name: "Українські історики", priority: 1},
            {name: "Українські журналісти", priority: 1},
            {name: "Українські краєзнавці", priority: 1},
            {name: "Українські поети", priority: 1},
            {name: "Вояки Армії УНР", priority: 1},
            {name: "Жінки-науковці", priority: 1},
            {name: "Українські педіатри", priority: 1},
            {name: "Заслужені діячі науки і техніки України", priority: 1},
            {name: "Теребовельські князі", priority: 1},
            {name: "Області України", priority: 1}
        ]
    }
});