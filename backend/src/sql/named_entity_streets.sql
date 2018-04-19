--- Selects the streets and their named entities ---
SELECT street.name as streetName, namedEntity.name as namedEntityName, namedEntity.wikiUrl
FROM city_map.street
INNER JOIN namedEntity ON namedEntityId = namedEntity.id
ORDER BY street.id DESC;