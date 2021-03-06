# Groomish

[![CI](https://github.com/saintedlama/groomish/actions/workflows/ci.yml/badge.svg)](https://github.com/saintedlama/groomish/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/saintedlama/groomish/badge.svg?branch=main)](https://coveralls.io/github/saintedlama/groomish?branch=main)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/saintedlama/groomish/tree/main)

## 1 minute example

Install latest `pg` peer dependency and `groomish`

```shell
npm i pg groomish
```

Start working with a repository

```js
import { Client } from "pg";
import groomish from "groomish";

async function demo() {
  // create a new pg client or pool since groomish does not manage pg connections
  const client = new Client({
    user: "postgres",
    database: "postgres",
    password: "postgres",
    host: "localhost",
  });

  await client.connect();

  // create a users table
  await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, first_name VARCHAR, last_name VARCHAR)`);

  // Let's start working with groomish - use the client and create a users repository
  const users = groomish(client).repository<User>("users");

  const john = await users.insert({ first_name: "John", last_name: "Doe" });
  const jane = await users.insert({ first_name: "Jane", last_name: "Doe" });

  // Select all users with first name "John"
  const johns = await users.select({ first_name: "John" });

  for (const aJohn of johns) {
    // Update the first name of each John to "Johnny"
    aJohn.first_name = "Johnny";
    const updatedUser = await users.update(aJohn);
  }

  // Select Jane by id and delete the user
  const toDelete = await users.get(jane.id);
  await users.delete(toDelete);
}
```
