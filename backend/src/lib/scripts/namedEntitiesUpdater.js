#!/usr/bin/env node

const dc = require("../../app/dependencyResolver");
const namedEntityService = dc.get("NamedEntityService");
const wikiService = dc.get("WikiService");

(async () => {
    const namedEntitites = await namedEntityService.getAll();

    for(let namedEntity of namedEntitites) {
        let namedEntityPage = await wikiService.getPage(namedEntity.name);
        if(namedEntityPage) {
            let {tags, ...newNamedEntity} = wikiService.mapPageToNamedEntity(namedEntityPage);
            let namedEntityProps = Object.getOwnPropertyNames(namedEntity);

            for(let propName of namedEntityProps) {
                if(newNamedEntity[propName] !== undefined &&
                    namedEntity[propName] !== newNamedEntity[propName]) {
                    namedEntity[propName] = newNamedEntity[propName];
                }
            }

            await namedEntityService.update(namedEntity, tags);
            console.log(`Updated ${namedEntity.name}`);
        }
    }
    console.log(`Finished updating named entities.`);
})();