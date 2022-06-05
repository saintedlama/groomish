import Connection from "./connection";
import { buildInsert } from "./sql";
import log from "./log";

export default class Repository {
  constructor(public connection: Connection, public table: string) {}

  async insert<T>(entity: T): Promise<T> {
    const insert = buildInsert(this.table, entity);
    const sql = `${insert.sql} RETURNING *`;

    log(`inserting to ${this.table} using SQL ${sql}`);
    const result = await this.query(sql, insert.values);

    if (result.length != 1) {
      throw new Error(`entity could not be inserted into ${this.table}`);
    }

    return result[0] as T;
  }

  async find<T>(id: any): Promise<T> {
    const result = await this.query(`SELECT * FROM ${this.table} WHERE id = $1`, [id]);

    // TODO: assert result.length === 1
    return result[0] as T;
  }

  async query<T>(query: string, params: any[]): Promise<T[]> {
    const result = await this.connection.pg.query(query, params);
    return result.rows as T[];
  }
}
