import { Pool, Client } from "pg";
import Repository from "./repository";

export default class Connection {
  constructor(public pg: Pool | Client) {}

  repository(table: string): Repository {
    return new Repository(this, table);
  }
}
