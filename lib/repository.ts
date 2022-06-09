import Connection from "./connection";
import { buildInsert, buildUpdate, buildSelect, buildSelectOptions } from "./sql";
import log from "./log";
import { Predicates, RepositoryConventions, SelectOptions } from "./types";

export default class Repository {
  constructor(
    public connection: Connection,
    public table: string,
    public conventions: RepositoryConventions = { idColumn: "id", idColumnAutoIncrement: true }
  ) {}

  async insert<T>(entity: T): Promise<T> {
    const insert = buildInsert(this.table, this.conventions, entity);
    const sql = `${insert.sql} RETURNING *`;

    log(`inserting to ${this.table} using SQL "${sql}"`);
    const result = await this.query(sql, insert.values);

    if (result.length != 1) {
      throw new Error(`entity could not be inserted into ${this.table}`);
    }

    return result[0] as T;
  }

  async get<T>(id: any): Promise<T> {
    // TODO: move to sql.ts
    const sql = `SELECT * FROM ${this.table} WHERE ${this.conventions.idColumn} = $1`;
    log(`getting from ${this.table} using SQL "${sql}"`);

    const result = await this.query<T>(sql, [id]);

    if (result.length != 1) {
      throw new Error(`Entity with id ${id} could not be selected from ${this.table}. Got ${result.length} rows returned`);
    }

    return result[0];
  }

  async update<T>(entity: T): Promise<T> {
    const update = buildUpdate(this.table, this.conventions, entity);
    const sql = `${update.sql} RETURNING *`;

    log(`updating ${this.table} using SQL "${sql}"`);
    const result = await this.query<T>(sql, update.values);

    if (result.length != 1) {
      throw new Error(`entity could not be updated in ${this.table}`);
    }

    return result[0];
  }

  async delete<T>(entity: T): Promise<T> {
    // TODO: move to sql.ts
    return await this.deleteById([entity[this.conventions.idColumn as keyof typeof entity] as any]);
  }

  async deleteById<T>(id: any): Promise<T> {
    const sql = `DELETE FROM ${this.table} WHERE ${this.conventions.idColumn} = $1 RETURNING *`;

    log(`deleting from ${this.table} using SQL "${sql}"`);
    const result = await this.query<T>(sql, id);

    if (result.length != 1) {
      throw new Error(`entity with id ${id} could not be deleted from ${this.table}`);
    }

    return result[0];
  }

  async select<T>(predicates: Predicates, options?: SelectOptions): Promise<T[]> {
    const select = buildSelect(this.table, predicates, options);
    const sql = `${select.sql}`;
    log(`selecting ${this.table} using SQL "${sql}"`);
    return await this.query<T>(sql, select.values);
  }

  async selectWhere<T>(whereClause: string, params: any[], options?: SelectOptions): Promise<T[]> {
    // TODO: Move to sql.ts
    const sql = `SELECT * FROM ${this.table} WHERE ${whereClause} ${buildSelectOptions(options)}`;
    log(`selecting ${this.table} using SQL "${sql}"`);
    return await this.query<T>(sql, params);
  }

  async query<T>(query: string, params: any[]): Promise<T[]> {
    const result = await this.connection.pg.query(query, params);
    return result.rows as T[];
  }
}
