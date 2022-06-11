import { Predicates, RepositoryConventions, SelectOptions } from "./types.js";

export type PreparedStatement = {
  sql: string;
  values: any[];
};

export function buildInsert<T>(table: string, conventions: RepositoryConventions, entity: T): PreparedStatement {
  const keys = Object.keys(entity).filter((key) => (conventions.idColumnAutoIncrement ? key != conventions.idColumn : true));

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

export function buildUpdate<T>(table: string, conventions: RepositoryConventions, entity: T): PreparedStatement {
  const keys = Object.keys(entity).filter((key) => key != conventions.idColumn);

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
      conventions.idColumn
    )}=$${sqlValues.length + 1}`,
    values: values.concat(entity[conventions.idColumn as keyof typeof entity] as any),
  };
}

export function buildSelect(table: string, predicates: Predicates, options?: SelectOptions): PreparedStatement {
  const whereClause = buildWhereClause(predicates);
  const sql = `SELECT * FROM ${table} ${whereClause.sql} ${buildSelectOptions(options)}`;

  return {
    sql: sql.trim(),
    values: whereClause.values,
  };
}

export function buildSelectOptions(options?: SelectOptions): string {
  let sql = "";

  if (options?.limit) {
    sql += ` LIMIT ${options.limit}`;
  }

  if (options?.orderBy) {
    sql += ` ORDER BY ${options.orderBy}`;
  }

  return sql.trim();
}

export function buildWhereClause(predicates: Predicates): PreparedStatement {
  const columns = Object.keys(predicates);

  const values = [];
  const sqlColumns = [];

  let skippedValues = 0;
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    const value = predicates[column as keyof typeof predicates] as any;

    if (value === null) {
      skippedValues++;

      sqlColumns.push(`${escapeColumnName(column)} IS NULL`);
    } else {
      values.push(value);
      sqlColumns.push(`${escapeColumnName(column)}=$${i + 1 - skippedValues}`);
    }
  }

  return {
    sql: `WHERE ${sqlColumns.join(" AND ")}`,
    values,
  };
}

function escapeColumnName(columnName: string) {
  return `"${columnName}"`;
}
