import { Pool, Client } from "pg";
import Repository from "./repository";
import { ConnectionConventions, RepositoryConventions } from "./types";

export default class Connection {
  public conventions: ConnectionConventions;

  constructor(public pg: Pool | Client, conventions?: ConnectionConventions) {
    this.conventions = conventions || { idColumn: "id", idColumnAutoIncrement: true };
  }

  repository(table: string, conventions?: RepositoryConventions): Repository {
    return new Repository(this, table, conventions || this.conventions);
  }
}
