import { Client } from "pg";
import debug from "debug";

const log = debug("groomish:initDb");

export default async function initDb(): Promise<Client> {
  const client = new Client({
    user: "postgres",
    database: "postgres",
    password: "postgres",
    host: "localhost",
  });

  log(`connecting to postgres`);
  await client.connect();

  log(`dropping database groomish_test`);
  await client.query(`DROP DATABASE IF EXISTS groomish_test`);

  log(`creating database groomish_test`);
  await client.query(`CREATE DATABASE groomish_test`);

  log(`ending postgres connection`);
  await client.end();

  const groomishTestClient = new Client({
    user: "postgres",
    database: "groomish_test",
    password: "postgres",
    host: "localhost",
  });

  await groomishTestClient.connect();

  return groomishTestClient;
}
