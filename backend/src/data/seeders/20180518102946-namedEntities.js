"use strict";

const db = require("../models/index");

module.exports = {
    up: async () => {
        const namedEntities = [
            {
                name: "Максим Кривоніс",
                description: "Макси́м Кривоні́с (Кривонос, або Перебійніс також Перейбийніс; близько 1600 — 1648)  — український військовий діяч періоду Хмельниччини, лисянський полковник, один з керівників козацько-селянських повстань в Україні під час Хмельниччини. Учасник Корсунської битви, літньої подільської та осінньої волинсько-галицької кампаній 1648 року. Уперше в історії Львова взяв штурмом Високий замок.",
                wikiUrl: "https://uk.wikipedia.org/wiki/%D0%9C%D0%B0%D0%BA%D1%81%D0%B8%D0%BC_%D0%9A%D1%80%D0%B8%D0%B2%D0%BE%D0%BD%D1%96%D1%81",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/Kozak.gif",
                tags: []
            },
            {
                name: "Микола Миклухо-Маклай",
                description: "Миклу́хо-Макла́й Мико́ла Микола́йович (5 (17) липня 1846, село Язикове, Новгородська губернія — 2 (14) квітня 1888, Санкт-Петербург) — відомий мандрівник, антрополог, етнограф, географ; дослідник народів Південно-Східної Азії, Австралії й Океанії; автор близько 160 наукових праць; українського походження з козацького роду Миклух. Був підданим Російської імперії, але майже все своє свідоме життя провів поза її межами, де й зробив свої знакові дослідження та відкриття.",
                wikiUrl: "https://uk.wikipedia.org/wiki/%D0%9C%D0%B8%D0%BA%D0%BB%D1%83%D1%85%D0%BE-%D0%9C%D0%B0%D0%BA%D0%BB%D0%B0%D0%B9_%D0%9C%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0_%D0%9C%D0%B8%D0%BA%D0%BE%D0%BB%D0%B0%D0%B9%D0%BE%D0%B2%D0%B8%D1%87",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Miklukho-Maklai.jpg",
                tags: []
            },
            {
                name: "Іван Франко",
                description: "Іва́н Я́кович Фра́нко́ (27 серпня 1856, с. Нагуєвичі — 28 травня 1916, Львів, Австро-Угорщина) — видатний український письменник, поет, публіцист, перекладач, учений, громадський і політичний діяч. Доктор філософії (1893), дійсний член Наукового товариства імені Шевченка (1899), почесний доктор Харківського університету (1906)[1][2].",
                wikiUrl: "https://uk.wikipedia.org/wiki/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD_%D0%AF%D0%BA%D0%BE%D0%B2%D0%B8%D1%87",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ab/%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%D0%BE_%D0%86%D0%B2%D0%B0%D0%BD.jpg",
                tags: [{name: "письменники"}, {name: "поети"}]
            },
            {
                name: "Памво Беринда",
                description: "Па́мво Бери́нда (між 1550 та 1570 — 13 (23) липня 1632) — діяч української культури, енциклопедист, мовознавець, лексикограф, письменник, поет, друкар і гравер, православний чернець, великий українець, видатна постать культурно-освітнього руху Галичини та України першої половини ХVII століття.",
                wikiUrl: "https://uk.wikipedia.org/wiki/%D0%91%D0%B5%D1%80%D0%B8%D0%BD%D0%B4%D0%B0_%D0%9F%D0%B0%D0%BC%D0%B2%D0%BE",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/%D0%9F%D0%B0%D0%BC%D0%B2%D0%B0_%D0%91%D1%8F%D1%80%D1%8B%D0%BD%D0%B4%D0%B0.jpg",
                tags: [{name: "письменники"}, {name: "драматурги"}, {name: "друкарі"}]
            },
            {
                name: "Тарас Шевченко",
                description: "Тара́с Григо́рович Шевче́нко (відомий також як Кобза́р; 25 лютого (9 березня) 1814, с. Моринці, Київська губернія, Російська імперія (нині Звенигородський район, Черкаська область, Україна) — 26 лютого (10 березня) 1861, Санкт-Петербург, Російська імперія) — український поет, письменник (драматург, прозаїк), художник (живописець, гравер), громадський та політичний діяч. Національний герой і символ України.",
                wikiUrl: "https://uk.wikipedia.org/wiki/%D0%A8%D0%B5%D0%B2%D1%87%D0%B5%D0%BD%D0%BA%D0%BE_%D0%A2%D0%B0%D1%80%D0%B0%D1%81_%D0%93%D1%80%D0%B8%D0%B3%D0%BE%D1%80%D0%BE%D0%B2%D0%B8%D1%87",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Taras_Shevchenko_selfportrait_oil_1840_%28crop%29.png/800px-Taras_Shevchenko_selfportrait_oil_1840_%28crop%29.png",
                tags: [{name: "письменники"}, {name: "поети"}, {name: "художники"}]
            },
            {
                name: "Костянтин Корнякт",
                description: "Корнякт Костянтин (грец. Κωνσταντίνος Κορνιακτός, пол. Konstanty Korniakt; 1517/1520 — 1603) — грецький купець, шляхтич, громадянин Львова. Один з найбагатших міщан в історії міста, фундатор будівель, що носять його ім'я.",
                wikiUrl: "https://uk.wikipedia.org/wiki/%D0%9A%D0%BE%D1%80%D0%BD%D1%8F%D0%BA%D1%82_%D0%9A%D0%BE%D1%81%D1%82%D1%8F%D0%BD%D1%82%D0%B8%D0%BD",
                imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Konstanty_Korniakt_%281517-1603%29.jpg/320px-Konstanty_Korniakt_%281517-1603%29.jpg",
                tags: []
            }
        ];

        for(let namedEntity of namedEntities) {
            let existingNamedEntity = await db.namedEntity.findOne({where: {name: namedEntity.name}});
            if(!existingNamedEntity) {
                await db.namedEntity.create(namedEntity);
            }
        }
    },

    down: (queryInterface) => {
        return queryInterface.bulkDelete("namedEntity", null, {});
    }
};
