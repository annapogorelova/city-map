export default class NamedEntitiesService {
    constructor(apiService) {
        this.apiService = apiService;
    }

    search({search, offset, limit}) {
        return this.apiService.get("/namedEntities", {
            search: search,
            offset: offset,
            limit: limit
        });
    }

    create(namedEntity) {
        return this.apiService.post("/namedEntities", namedEntity);
    }

    update(namedEntity) {
        return this.apiService.put(`/namedEntities/${namedEntity.id}`, namedEntity);
    }

    remove(id) {
        return this.apiService.delete(`/namedEntities/${id}`);
    }
}