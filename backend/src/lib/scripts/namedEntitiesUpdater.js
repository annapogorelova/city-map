#!/usr/bin/env node

const dc = require("../../app/dependencyResolver");
const namedEntityService = dc.get("NamedEntityService");
const wikiService = dc.get("WikiService");

(async () => {
    const namedEntitites = await namedEntityService.getAll({isLockedForParsing: false});

    for(let namedEntity of namedEntitites) {
        let namedEntityPage = await wikiService.getPage(namedEntity.name);
        if(namedEntityPage) {
            let {tags, ...newNamedEntity} = wikiService.mapPageToNamedEntity(namedEntityPage);
            await namedEntityService.update(namedEntity.id, newNamedEntity, tags);
            console.log(`Updated ${namedEntity.name}`);
        }
    }
    console.log(`Finished updating named entities.`);
})();