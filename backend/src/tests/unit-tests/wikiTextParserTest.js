"use strict";

const chai = require("chai");
const assert = chai.assert;
const testData = require("../data/wikiTestData");
const wikiTextParser = require("../../lib/wiki/wikiTextParser");

function createWikiText(wikiData) {
    let wikiText = "{{Default description\n";

    for(let key in wikiData) {
        wikiText += `|${key} = ${wikiData[key]}\n`;
    }

    wikiText += "}}";
    return wikiText;
}

describe("wiki text parser unit test", () => {
    it("should correctly parse the well formatted wikitext", (done) => {
        const wikiText = createWikiText(testData.wikiData);
        const results = wikiTextParser.parse(wikiText);
        const wikiDataKeys = Object.keys(testData.wikiData);
        for(let i = 0; i < wikiDataKeys.length; i++) {
            assert.equal(wikiDataKeys[i], results[i].key);
            assert.equal(testData.wikiData[wikiDataKeys[i]], results[i].value);
        }
        done();
    });

    it("should throw an error because of invalid wikiText format", (done) => {
        assert.throws(() => wikiTextParser.parse(null));
        assert.throws(() => wikiTextParser.parse(""));
        assert.throws(() => wikiTextParser.parse(undefined));
        assert.throws(() => wikiTextParser.parse("some simple text"));
        assert.throws(() => wikiTextParser.parse("{{}}"));
        done();
    });

    it("should return the empty results list", (done) => {
        const results = wikiTextParser.parse("{{Description\n}}");
        assert.exists(results);
        assert.equal(results.length, 0);
        done();
    });

    it("should return an empty property for the given key of the wiki-text", (done) => {
        const results = wikiTextParser.parse("{{Description\n|prop=}}");
        assert.exists(results);
        assert.equal(results.length, 1);
        assert.isEmpty(results[0].value);
        done();
    });
});