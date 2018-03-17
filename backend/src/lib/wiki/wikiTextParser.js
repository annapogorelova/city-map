const wikiTextRegex = /^(?:\{\{)([\s|\S]+)(?:\}\})/i;
const segmentsRegex = /(?:\s*\|)([\s|\S]*)(?:\s*=\s*)([\s|\S]*)/u;

function validate(wikiText) {
    if(!wikiText) {
        throw Error("Value cannot be empty");
    }

    if(!wikiText.match(wikiTextRegex)) {
        throw Error("Invalid format");
    }
}

function extractContent(wikiText) {
    const matches = wikiTextRegex.exec(wikiText);
    return matches[matches.length - 1];
}

function extractParagraphs(wikiContent) {
    const paragraphs = wikiContent.split("\n");
    return mapWikiTextProperties(paragraphs);
}

function mapWikiTextProperties(wikiItems) {
    let results = [];

    for (let i = 0; i < wikiItems.length; i++) {
        const segments = segmentsRegex.exec(wikiItems[i]);
        if (segments && segments.length > 2) {
            results.push({
                key: segments[1].trim(),
                value: segments[2].trim()
            });
        }
    }

    return results;
}


module.exports = {
    parse(wikiText) {
        validate(wikiText);
        const wikiContent = extractContent(wikiText);
        return extractParagraphs(wikiContent);
    }
};