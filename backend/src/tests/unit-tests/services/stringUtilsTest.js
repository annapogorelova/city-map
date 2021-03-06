"use strict";

const chai = require("chai");
const assert = chai.assert;
const stringUtils = require("../../../utils/stringUtils");

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
           assert.equal(stringUtils.namesInflectionMatch(expectedName, testCase.name), testCase.correct);
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
            assert.equal(stringUtils.namesInflectionMatch(expectedName, testCase.name), testCase.correct);
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
            assert.equal(stringUtils.namesInflectionMatch(expectedName, testCase.name), testCase.correct);
        }

        done();
    });

    it("should match names (expected name in format 'FirstName LastName (Nickname)')", (done) => {
        let expectedName = "Олега Святославича (князя усіх древлян)";

        let testNames = [
            {name: "Олег Святославич", correct: true},
            {name: "Святославич Олег", correct: true},
            {name: "Олег (князь) Святославич", correct: true},
            {name: "(Великий) Олег Святославич", correct: true},
            {name: "Олег Святославич (Великий)", correct: true},

            {name: "Лопушан Петро Володимирович", correct: false},
            {name: "Лопушан Петро", correct: false},
            {name: "Петро Лопушан", correct: false},
        ];

        for(let testCase of testNames) {
            assert.equal(testCase.correct, stringUtils.namesInflectionMatch(expectedName, testCase.name));
        }

        done();
    });

    it("should match names (expected name in format 'Title FirstName LastName')", (done) => {
        let expectedName = "Князя Олега";

        let testNames = [
            {name: "Олег", correct: true},
            {name: "Олег Святославич", correct: true},
            {name: "Святославич Олег", correct: true},

            {name: "Князь Всеволод", correct: false},
            {name: "Король Олег", correct: false},
        ];

        for(let testCase of testNames) {
            assert.equal(testCase.correct, stringUtils.namesInflectionMatch(expectedName, testCase.name));
        }

        done();
    });

    it("should remove the special symbols from the text", (done) => {
        assert.equal("Юрій Олексійович Гагарін", stringUtils.cleanText("Ю́рій Олексі́йович Гага́рін"));
        assert.equal("Леся Українка", stringUtils.cleanText("Ле́ся Украї́нка"));
        assert.equal("Семен Степанович Гулак-Артемовський", stringUtils.cleanText("Семе́н Степа́нович Гула́к-Артемо́вський"));

        done();
    });

    it("should crop the wiki content text", (done) => {
        const maxLength = 50;
        let text = "koko\n\t";
        for(let i = 0; i < 20; i++) {
            text += "koko\n\t";
        }
        const formattedText = stringUtils.formatText(text, maxLength);
        assert.equal(formattedText.length, maxLength);
        assert.equal(formattedText.indexOf("\n"), -1);
        done();
    });

    it("should return text value when text is empty or null", (done) => {
        const maxLength = 50;
        let formattedText = stringUtils.formatText("", maxLength);
        assert.equal(formattedText, "");
        formattedText = stringUtils.formatText(null, maxLength);
        assert.equal(formattedText, null);
        done();
    });
});