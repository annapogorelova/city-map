"use strict";

module.exports = Object.freeze({
    uk: {
        PEOPLE_STREETS_NAMED_AFTER: "Категорія:Люди, на честь яких названі вулиці",
        STREET_CATEGORY_PREFIX: "Категорія:Вулиці",
        NAMED_AFTER_INFOBOX_KEY: "назва на честь",
        streetTypes: ["вулиця", "провулок", "площа", "перехрестя", "проспект"],
        streetArticleTitleRegex: /(вулиця|провулок|площа|перехрестя|проспект) ([-'\u0400-\u04FF\w\s]+) \(([-'\u0400-\u04FF\w\s]+)\)/ig,
        images: ["фото", "портрет", "зображення"]
    }
});