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
    sql: `INSERT INTO ${table} (${sqlValues
      .map((s) => s.key)
      .join(", ")}) VALUES (${sqlValues.map((s) => `$${s.i + 1}`).join(", ")})`,
    values,
  };
}
