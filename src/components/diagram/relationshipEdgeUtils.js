const hasColumnValue = (value) => (
  value !== undefined &&
  value !== null &&
  value !== ''
);

const hasCompleteColumnPair = (fromColumns, toColumns) => (
  fromColumns.some((fromColumn, pairIndex) => (
    hasColumnValue(fromColumn) && hasColumnValue(toColumns[pairIndex])
  ))
);

/**
 * Apply React Flow edge deletions to semantic-model relationships.
 *
 * A pair is complete when both array slots contain a value. Whether those values
 * currently resolve to dataset fields is deliberately not considered here:
 * unavailable field names remain editable data and must not be discarded
 * implicitly. Dataset-level fallback edges use a null pair index and explicitly
 * delete the whole relationship.
 */
export const deleteRelationshipEdges = (relationships = [], edgesToDelete = []) => {
  if (!Array.isArray(relationships) || !Array.isArray(edgesToDelete)) {
    return { changed: false, relationships };
  }

  const deletionsByRelationship = new Map();

  edgesToDelete.forEach((edge) => {
    const relationshipIndex = edge?.data?.relationshipIndex;
    const relationship = relationships[relationshipIndex];
    if (
      !Number.isInteger(relationshipIndex) ||
      relationshipIndex < 0 ||
      relationshipIndex >= relationships.length ||
      !relationship ||
      typeof relationship !== 'object' ||
      Array.isArray(relationship)
    ) return;

    const pairIndexes = deletionsByRelationship.get(relationshipIndex) || new Set();
    const pairIndex = edge.data?.columnPairIndex;
    if (pairIndex === null) {
      pairIndexes.add(null);
    } else if (Number.isInteger(pairIndex) && pairIndex >= 0) {
      const fromColumns = relationship.from_columns;
      const toColumns = relationship.to_columns;
      if (
        !Array.isArray(fromColumns) ||
        !Array.isArray(toColumns) ||
        pairIndex >= fromColumns.length ||
        pairIndex >= toColumns.length ||
        !hasColumnValue(fromColumns[pairIndex]) ||
        !hasColumnValue(toColumns[pairIndex])
      ) return;
      pairIndexes.add(pairIndex);
    } else {
      return;
    }
    deletionsByRelationship.set(relationshipIndex, pairIndexes);
  });

  if (deletionsByRelationship.size === 0) {
    return { changed: false, relationships };
  }

  const updatedRelationships = relationships.flatMap((relationship, relationshipIndex) => {
    const pairIndexes = deletionsByRelationship.get(relationshipIndex);
    if (!pairIndexes) return [relationship];
    if (pairIndexes.has(null)) return [];

    const fromColumns = Array.isArray(relationship?.from_columns)
      ? [...relationship.from_columns]
      : [];
    const toColumns = Array.isArray(relationship?.to_columns)
      ? [...relationship.to_columns]
      : [];

    [...pairIndexes].sort((a, b) => b - a).forEach((pairIndex) => {
      fromColumns.splice(pairIndex, 1);
      toColumns.splice(pairIndex, 1);
    });

    if (!hasCompleteColumnPair(fromColumns, toColumns)) return [];

    return [{
      ...relationship,
      from_columns: fromColumns,
      to_columns: toColumns,
    }];
  });

  return {
    changed: true,
    relationships: updatedRelationships.some(Boolean) ? updatedRelationships : undefined,
  };
};
