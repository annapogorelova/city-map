module.exports = {
    findBestStringsMatch(search, results) {
        const rates = this.getResultsMatchRates(search, results);
        const maxRateIndex = rates.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
        return results[maxRateIndex];
    },

    getResultsMatchRates(search, results) {
        return results.map(r => this.calculatePhrasesMatchRate(search, r));
    },

    calculatePhrasesMatchRate(firstPhrase, secondPhrase, equalityThreshold = 0.6) {
        const firstPhraseWords = this.extractWords(firstPhrase);
        const secondPhraseWords = this.extractWords(secondPhrase);

        let rates = [];
        let overallRate = 0;
        for (let firstWord of firstPhraseWords) {
            for (let secondWord of secondPhraseWords) {
                const calculatedRate = this.calculateWordsMatchRate(firstWord, secondWord)
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
};