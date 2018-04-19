"use strict";

const chai = require("chai");
const assert = chai.assert;
const stringUtils = require("../../lib/wiki/stringUtils");

describe("stringUtils test", () => {
    it("should find the best string match for 'Олени Хохол' phrase", (done) => {
        const search = "Олени Хохол";
        const results = [
            "Хохол Олена Миколаївна",
            "Хохол (значення)",
            "Костюк Олена Платонівна",
            "Інститут педіатрії, акушерства і гінекології АМН України"
        ];

        const bestMatch = stringUtils.findBestStringsMatch(search, results);
        assert.equal("Хохол Олена Миколаївна", bestMatch);
        done();
    });

    it("should find the best string match for 'Луцька' phrase", (done) => {
        const search = "Луцька";
        const results = [
            "З'їзд європейських монархів у Луцьку",
            "Луцьк",
            "Лурк"
        ];

        const bestMatch = stringUtils.findBestStringsMatch(search, results);
        assert.equal("Луцьк", bestMatch);
        done();
    });

    it("should find the best string match for 'Устилузька' phrase", (done) => {
        const search = "Устилузька";
        const results = [
            "Устилузька міська громада",
            "Устилузька міська рада",
            "Луга (заказник)",
            "Адміністративний устрій Володимир-Волинського району",
            "Пам'ятник Данилу і Васильку Романовичам",
            "Володимир-Волинське територіальне медичне об'єднання",
            "Державний історико-культурний заповідник «Стародавній Володимир»",
            "Володимир-Волинський район",
            "Володимир-Волинський",
            "Устилуг",
            "Коритниця (Володимир-Волинський район)",
            "Стенжаричі",
            "Дарницьке",
            "Турівка (Володимир-Волинський район)",
            "Кладнів",
            "Селіски",
            "Залужжя (Володимир-Волинський район)",
            "Полум'яне (Володимир-Волинський район)",
            "Лудин",
            "Зоря (Володимир-Волинський район)"
        ];

        const bestMatch = stringUtils.findBestStringsMatch(search, results);
        assert.equal("Устилуг", bestMatch);
        done();
    });

    it("should find the best string match for 'Поліської Січі' phrase", (done) => {
        const search = "Поліської Січі";
        const results = [
            "Поліська Січ",
            "Олевська республіка",
            "Тарас Бульба-Боровець",
            "Задунайська Січ",
            "Карпатська Січ",
        ];

        const bestMatch = stringUtils.findBestStringsMatch(search, results);
        assert.equal("Поліська Січ", bestMatch);
        done();
    });

    it("should find the best string match for 'Цинкаловського' phrase", (done) => {
        const search = "Цинкаловського";
        const results = [
            "Бендюга",
            "Цинкаловський Олександр Миколайович",
            "Затишшя (Шацький район)",
            "Кропивники",
            "Вілиця",
            "Олешковичі",
            "Кам'янка (Шацький район)",
            "Красноволя (Любомльський район)",
            "Красний Бір",
            "Адамчуки",
            "Мала Білка",
            "Карначівка",
            "Жабка (Ківерцівський район)",
            "Стара Волинь і Волинське Полісся (словник)",
            "Хрипськ"
        ];

        const bestMatch = stringUtils.findBestStringsMatch(search, results);
        assert.equal("Цинкаловський Олександр Миколайович", bestMatch);
        done();
    });

    it("should find the best string match for 'Сагайдачного' phrase", (done) => {
        const search = "Сагайдачного";
        const results = [
            "Петро Конашевич-Сагайдачний",
            "Сагайдачний Євген Якович",
        ];

        const bestMatch = stringUtils.findBestStringsMatch(search, results);
        assert.equal("Петро Конашевич-Сагайдачний", bestMatch);
        done();
    });

    it("should find the best string match for 'Полуботка' phrase", (done) => {
        const search = "Полуботка";
        const results = [
            "Павло Полуботок",
            "2-й український полк імені Павла Полуботка",
            "Леонтій Полуботок",
            "Український військовий клуб імені гетьмана Павла Полуботка"
    ];

        const bestMatch = stringUtils.findBestStringsMatch(search, results);
        assert.equal("Павло Полуботок", bestMatch);
        done();
    });

    it("should match names (expected name consists of 1 word)", (done) => {
       let expectedName = "Сагайдачного";

       let testNames = [
           {name: "Сагайдачний", correct: true},
           {name: "Гетьман Сагайдачний", correct: true},
           {name: "Сагайдачний Петро", correct: true},
           {name: "Сагайдачний Петро Васильович", correct: true},

           {name: "Сагайдачна", correct: false},
           {name: "Сагайдачна Олена", correct: false},
           {name: "Сагайдачна Олена Валерівна", correct: false},

           {name: "Лопушан", correct: false},
       ];

       for(let testCase of testNames) {
           assert.equal(stringUtils.namesMatch(expectedName, testCase.name), testCase.correct);
       }

       done();
    });

    it("should match names (expected name consists of 2 words)", (done) => {
        let expectedName = "Юрія Сагайдачного";

        let testNames = [
            {name: "Сагайдачний Юрій", correct: true},
            {name: "Юрій Сагайдачний", correct: true},
            {name: "Сагайдачний Петро", correct: false},

            {name: "Сагайдачна Оксана", correct: false},
            {name: "Оксана Сагайдачна", correct: false},
            {name: "Оксана", correct: false},

            {name: "Лопушан Петро", correct: false},
            {name: "Петро Лопушан", correct: false},
        ];

        for(let testCase of testNames) {
            assert.equal(stringUtils.namesMatch(expectedName, testCase.name), testCase.correct);
        }

        done();
    });

    it("should match names (expected name consists of 3 words)", (done) => {
        let expectedName = "Юрія Володимировича Сагайдачного";

        let testNames = [
            {name: "Сагайдачний Юрій Володимирович", correct: true},
            {name: "Юрій Володимирович Сагайдачний", correct: true},

            {name: "Сагайдачний Юрій", correct: true},
            {name: "Юрій Сагайдачний", correct: true},
            {name: "Сагайдачний Петро", correct: false},

            {name: "Сагайдачна Оксана", correct: false},
            {name: "Оксана Сагайдачна", correct: false},
            {name: "Оксана", correct: false},

            {name: "Лопушан Петро Володимирович", correct: false},
            {name: "Лопушан Петро", correct: false},
            {name: "Петро Лопушан", correct: false},
        ];

        for(let testCase of testNames) {
            assert.equal(stringUtils.namesMatch(expectedName, testCase.name), testCase.correct);
        }

        done();
    });
});