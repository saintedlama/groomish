export type Insert = {
  sql: string;
  values: any[];
};

export function buildInsert<T>(table: string, entity: T): Insert {
  const keys = Object.keys(entity).filter((key) => key != "id");

  const values: { key: string; i: number }[] = [];
  const sqlValues = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = entity[key as keyof typeof entity] as any;
    values.push(value);
    sqlValues.push({ key, i });
  }

  return {
    sql: `INSERT INTO ${table} (${sqlValues.map((s) => escapeColumnName(s.key)).join(", ")}) VALUES (${sqlValues
      .map((s) => `$${s.i + 1}`)
      .join(", ")})`,
    values,
  };
}

export type Update = {
  sql: string;
  values: any[];
};

export function buildUpdate<T>(table: string, entity: T): Update {
  const keys = Object.keys(entity).filter((key) => key != "id");

  const values: { key: string; i: number }[] = [];
  const sqlValues = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = entity[key as keyof typeof entity] as any;
    values.push(value);
    sqlValues.push({ key, i });
  }

  // TODO: throw if no id field found
  // TODO: threow if no fields found to update
  return {
    sql: `UPDATE ${table} SET ${sqlValues.map((s) => `${escapeColumnName(s.key)}=$${s.i + 1}`).join(", ")} WHERE ${escapeColumnName(
      "id"
    )}=$${sqlValues.length + 1}`,
    values: values.concat(entity["id" as keyof typeof entity] as any),
  };
}
export function buildSelect(table: string, predicates: any, options: any): Update {
  const keys = Object.keys(predicates);

  const values: { key: string; i: number }[] = [];
  const sqlValues = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = predicates[key as keyof typeof predicates] as any;
    values.push(value);
    sqlValues.push({ key, i });
  }

  let sql = `SELECT * FROM ${table} WHERE ${sqlValues.map((s) => `${escapeColumnName(s.key)}=$${s.i + 1}`).join(" AND ")}`;

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`;
  }

  if (options?.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  }

  return {
    sql,
    values,
  };
}

function escapeColumnName(columnName: string) {
  return `"${columnName}"`;
}
