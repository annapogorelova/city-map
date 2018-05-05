export default class NamedEntityService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    search({search, offset, limit}) {
        return this.apiService.get("/namedEntities/", {
            search: search,
            offset: offset,
            limit: limit
        });
    }

    update(namedEntity) {
        return this.apiService.put(`/namedEntities/${namedEntity.id}`, namedEntity);
    }

    remove(id) {
        return this.apiService.delete(`/namedEntities/${id}`);
    }
}