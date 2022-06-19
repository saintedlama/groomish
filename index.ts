import { Pool, Client } from "pg";
import Connection from "./lib/connection.js";

/**
 * Connect groomish to a PostgreSQL database
 * @param pg postgres instance of pool or client
 * @returns connected groomish instance
 */
export function connect(pg: Pool | Client) {
  return new Connection(pg);
}
