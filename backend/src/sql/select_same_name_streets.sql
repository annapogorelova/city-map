--- Selects the counts of the streets with the same named entity ---
SELECT namedEntity.name, COUNT(DISTINCT street.id) AS streetsCount FROM namedEntity
LEFT JOIN street ON street.namedEntityId = namedEntity.id
GROUP BY namedEntity.name
ORDER BY streetsCount DESC;