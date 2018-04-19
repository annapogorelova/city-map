const shevchenko = require("shevchenko");
const constants = require("../../app/constants");

module.exports = {
    findBestStringsMatch(search, results) {
        const rates = results.map(r => this.calculatePhrasesMatchRate(search, r));
        const maxRateIndex = rates.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        return results[maxRateIndex];
    },

    calculatePhrasesMatchRate(firstPhrase, secondPhrase, equalityThreshold = 0.6) {
        const firstPhraseWords = this.extractWords(firstPhrase);
        const secondPhraseWords = this.extractWords(secondPhrase);

        let rates = [];
        let overallRate = 0;
        for (let firstWord of firstPhraseWords) {
            for (let secondWord of secondPhraseWords) {
                const calculatedRate = this.calculateWordsMatchRate(firstWord, secondWord);
                rates.push(calculatedRate);
                overallRate += calculatedRate;
            }
        }

        if (rates.some(r => r >= equalityThreshold)) {
            overallRate += firstPhraseWords.length / secondPhraseWords.length;
        }

        return overallRate;
    },

    extractWords(phrase) {
        return phrase.match(/['\u0400-\u04FF\w]*/gi).filter(m => m !== "");
    },

    calculateWordsMatchRate(firstWord, secondWord) {
        const minLength = firstWord.length > secondWord.length ? secondWord.length : firstWord.length;
        const maxLength = firstWord.length > secondWord.length ? firstWord.length : secondWord.length;
        let rate = 0;

        for (let i = 0; i < minLength; i++) {
            if (firstWord[i] === secondWord[i]) {
                rate++;
            } else {
                break;
            }
        }

        return rate / maxLength;
    },

    namesMatch(expectedTitle, actualTitle) {
        const expectedTitleParts = this.getNamePartsOptions(expectedTitle);
        const actualTitleParts = this.getNamePartsOptions(actualTitle);
        let matches = [];

        for (let expectedName of expectedTitleParts) {
            for (let actualName of actualTitleParts) {
                let male = {gender: "male", ...actualName};
                let female = {gender: "female", ...actualName};

                const genMale = shevchenko.inGenitive(male);
                const genFemale = shevchenko.inGenitive(female);

                if((genMale.lastName === expectedName.lastName &&
                    (expectedName.firstName === undefined || genMale.firstName === expectedName.firstName)) ||
                    (genFemale.lastName === expectedName.lastName &&
                        (expectedName.firstName === undefined || genFemale.firstName === expectedName.firstName))) {
                    matches.push(actualName);
                }
            }
        }

        return matches.length > 0;
    },

    getNamePartsOptions(title) {
        const parts = title.replace(/\(([-'\u0400-\u04FF\w\s]+)\)/g, "").trim()
            .match(constants.wordsSplitRegex);

        if(parts.length === 1) {
            return [{
                lastName: parts[0]
            }, {
                firstName: parts[0]
            }];
        }

        if(parts.length === 2) {
            return [{
                firstName: parts[0],
                lastName: parts[1]
            }, {
                firstName: parts[1],
                lastName: parts[0]
            }];
        }

        if(parts.length === 3) {
            return [{
                firstName: parts[0],
                lastName: parts[2]
            }, {
                firstName: parts[1],
                lastName: parts[0]
            }];
        }
    }
};