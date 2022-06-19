import pg from "pg";
import type { Client } from "pg";
import debug from "debug";

const { Client: PgClient } = pg;

const log = debug("groomish:initDb");

export default async function initDb(): Promise<Client> {
  const client = new PgClient({
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    database: process.env.PGDATABASE || "postgres",
    host: process.env.PGHOSTADDR || "localhost",
  });

  log(`connecting to postgres`);
  await client.connect();

  log(`dropping database groomish_test`);
  await client.query(`DROP DATABASE IF EXISTS groomish_test`);

  log(`creating database groomish_test`);
  await client.query(`CREATE DATABASE groomish_test`);

  log(`ending postgres connection`);
  await client.end();

  const groomishTestClient = new PgClient({
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    database: "groomish_test",
    host: process.env.PGHOSTADDR || "localhost",
  });

  await groomishTestClient.connect();

  return groomishTestClient;
}
