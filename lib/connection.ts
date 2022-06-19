import { Pool, Client } from "pg";
import Repository from "./repository.js";
import { ConnectionConventions, RepositoryConventions } from "./types.js";

export default class Connection {
  public conventions: ConnectionConventions;

  constructor(public pg: Pool | Client, conventions?: ConnectionConventions) {
    this.conventions = conventions || { idColumn: "id", idColumnAutoIncrement: true };
  }

  repository<T>(table: string, conventions?: RepositoryConventions): Repository<T> {
    return new Repository<T>(this, table, conventions || this.conventions);
  }
}
