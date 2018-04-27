import NamedEntityService from "./named-entity-service";
import ApiService from "../api/index";

export default function() {
    return new NamedEntityService(ApiService);
}