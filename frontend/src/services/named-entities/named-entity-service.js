export default class NamedEntityService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    search({search, offset, limit}) {
        return this.apiService.get("/namedEntities/", {
            params: {
                search: search,
                offset: offset,
                limit: limit
            }
        });
    }

    update(namedEntity) {
        return this.apiService.put(`/namedEntities/${namedEntity.id}`, namedEntity);
    }
}