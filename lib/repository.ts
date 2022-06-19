import Connection from "./connection.js";
import { buildInsert, buildUpdate, buildSelect, buildSelectOptions } from "./sql.js";
import log from "./log.js";
import { RepositoryConventions, SelectOptions } from "./types.js";

export default class Repository<T> {
  constructor(
    public connection: Connection,
    public table: string,
    public conventions: RepositoryConventions = { idColumn: "id", idColumnAutoIncrement: true }
  ) {}

  async insert(entity: T): Promise<T> {
    const insert = buildInsert(this.table, this.conventions, entity);
    const sql = `${insert.sql} RETURNING *`;

    log(`inserting to ${this.table} using SQL "${sql}"`);
    const result = await this.query(sql, insert.values);

    if (result.length != 1) {
      throw new Error(`entity could not be inserted into ${this.table}`);
    }

    return result[0] as T;
  }

  async get(id: unknown): Promise<T> {
    // TODO: move to sql.ts
    const sql = `SELECT * FROM ${this.table} WHERE ${this.conventions.idColumn} = $1`;
    log(`getting from ${this.table} using SQL "${sql}"`);

    const result = await this.query(sql, [id]);

    if (result.length != 1) {
      throw new Error(`Entity with id ${id} could not be selected from ${this.table}. Got ${result.length} rows returned`);
    }

    return result[0];
  }

  async update(entity: T): Promise<T> {
    const update = buildUpdate(this.table, this.conventions, entity);
    const sql = `${update.sql} RETURNING *`;

    log(`updating ${this.table} using SQL "${sql}"`);
    const result = await this.query(sql, update.values);

    if (result.length != 1) {
      throw new Error(`entity could not be updated in ${this.table}`);
    }

    return result[0];
  }

  async delete(entity: T): Promise<T> {
    // TODO: move to sql.ts
    return await this.deleteById(entity[this.conventions.idColumn as keyof T]);
  }

  async deleteById(id: unknown): Promise<T> {
    const sql = `DELETE FROM ${this.table} WHERE ${this.conventions.idColumn} = $1 RETURNING *`;

    log(`deleting from ${this.table} using SQL "${sql}"`);
    const result = await this.query(sql, [id]);

    if (result.length != 1) {
      throw new Error(`entity with id ${id} could not be deleted from ${this.table}`);
    }

    return result[0];
  }

  async select(predicates: { [property in keyof T]: unknown }, options?: SelectOptions): Promise<T[]> {
    const select = buildSelect(this.table, predicates, options);
    const sql = `${select.sql}`;
    log(`selecting ${this.table} using SQL "${sql}"`);
    return await this.query(sql, select.values);
  }

  async selectWhere(whereClause: string, params?: unknown[], options?: SelectOptions): Promise<T[]> {
    // TODO: Move to sql.ts
    const sql = `SELECT * FROM ${this.table} WHERE ${whereClause} ${buildSelectOptions(options)}`;
    log(`selecting ${this.table} using SQL "${sql}"`);
    return await this.query(sql, params || []);
  }

  async query(query: string, params: unknown[]): Promise<T[]> {
    const result = await this.connection.pg.query(query, params);
    return result.rows as T[];
  }
}
