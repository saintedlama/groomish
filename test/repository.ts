import { expect } from "chai";
import connect from "../index.js";
import initDb from "./utils/initDb.js";
import log from "../lib/log.js";
import { Client } from "pg";

describe("repository", () => {
  let client: Client;

  beforeEach(async () => {
    client = await initDb();
  });

  afterEach(async () => await client?.end());

  describe("insert", () => {
    it("should insert an entity without id", async () => {
      await client.query(`CREATE TABLE users (name VARCHAR)`);

      const users = connect(client).repository("users");
      const user = {
        name: "John Doe",
      } as User;

      const result = await users.insert(user);
      expect(result).to.deep.equal({
        name: user.name,
      });
    });

    it("should insert an entity returning the generated id", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository("users");
      const user = {
        name: "John Doe",
      } as User;

      const result = await users.insert(user);
      expect(result).to.deep.equal({
        id: 1,
        name: user.name,
      });
    });

    it("should insert an entity returning the generated id specified in conventions", async () => {
      await client.query(`CREATE TABLE users (key SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository("users", { idColumn: "key", idColumnAutoIncrement: true });
      const user = {
        name: "John Doe",
      } as UserWithKey;

      const result = await users.insert(user);
      expect(result).to.deep.equal({
        key: 1,
        name: user.name,
      });
    });

    it("should insert an column id if key is not specified as auto increment in conventions", async () => {
      await client.query(`CREATE TABLE users (key VARCHAR PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository("users", { idColumn: "key", idColumnAutoIncrement: false });
      const user = {
        key: "jdoe",
        name: "John Doe",
      } as UserWithKey;

      const result = await users.insert(user);
      expect(result).to.deep.equal({
        key: "jdoe",
        name: user.name,
      });
    });

    it("should not insert an id if the id column is generated by the db", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository("users");
      const user = {
        id: 10,
        name: "John Doe",
      } as User;

      const result = await users.insert(user);
      expect(result).to.deep.equal({
        id: 1,
        name: user.name,
      });
    });
  });

  describe("get", () => {
    it("should get an entity by id", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<User>("users");
      const user = {
        name: "John Doe",
      } as User;

      const result = await users.insert(user);

      const loadedUser = await users.get(result.id);

      expect(loadedUser).to.deep.equal({
        id: 1,
        name: user.name,
      });
    });

    it("should throw entity was not found", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository("users");

      try {
        await users.get(1);
        expect.fail("expected get call of non persisted user to throw");
      } catch (e) {
        log(e);
        // success
      }
    });

    it("should get an entity by id specified in conventions", async () => {
      await client.query(`CREATE TABLE users (key SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<UserWithKey>("users", { idColumn: "key", idColumnAutoIncrement: true });
      const user = {
        name: "John Doe",
      } as UserWithKey;

      const result = await users.insert(user);

      const loadedUser = await users.get(result.key);

      expect(loadedUser).to.deep.equal({
        key: 1,
        name: user.name,
      });
    });
  });

  describe("update", () => {
    it("should update an entity by id", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<User>("users");
      const user = {
        name: "John Doe",
      } as User;

      const result = await users.insert(user);
      result.name = "Jane Doe";

      const updatedUser = await users.update(result);

      expect(updatedUser).to.deep.equal({
        id: 1,
        name: result.name,
      });
    });

    it("should update an entity by the id specified in conventions", async () => {
      await client.query(`CREATE TABLE users (key SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<UserWithKey>("users", { idColumn: "key", idColumnAutoIncrement: true });
      const user = {
        name: "John Doe",
      } as User;

      const result = await users.insert(user);
      result.name = "Jane Doe";

      const updatedUser = await users.update(result);

      expect(updatedUser).to.deep.equal({
        key: 1,
        name: result.name,
      });
    });

    it("should update an entity by the id specified in conventions if auto increment set to false", async () => {
      await client.query(`CREATE TABLE users (key VARCHAR PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<UserWithKey>("users", { idColumn: "key", idColumnAutoIncrement: false });
      const user = {
        key: "jdoe",
        name: "John Doe",
      } as UserWithKey;

      const result = await users.insert(user);
      result.name = "Jane Doe";

      const updatedUser = await users.update(result);

      expect(updatedUser).to.deep.equal({
        key: "jdoe",
        name: result.name,
      });
    });

    it("should throw if entity to update was not found", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<User>("users");

      try {
        await users.update({ id: 1, name: "John Doe" });
        expect.fail("expected update call of non persisted user to throw");
      } catch (e) {
        log(e);
        // success
      }
    });
  });

  describe("delete", () => {
    it("should delete an entity", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<User>("users");
      const user = {
        name: "John Doe",
      } as User;

      const result = await users.insert(user);

      const deletedUser = await users.delete(result);
      expect(deletedUser).to.deep.equal(result);
    });

    it("should delete an entity by id specified in conventions", async () => {
      await client.query(`CREATE TABLE users (key SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<UserWithKey>("users", { idColumn: "key", idColumnAutoIncrement: true });
      const user = {
        name: "John Doe",
      } as UserWithKey;

      const result = await users.insert(user);

      const deletedUser = await users.delete(result);
      expect(deletedUser).to.deep.equal(result);
    });

    it("should throw if entity to delete was not found", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<User>("users");

      try {
        await users.delete({ id: 1, name: "empty" });
        expect.fail("expected delete call of non persisted user to throw");
      } catch (e) {
        log(e);
        // success
      }
    });
  });

  describe("deleteById", () => {
    it("should delete an entity", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<User>("users");
      const user = {
        name: "John Doe",
      } as User;

      const result = await users.insert(user);

      const deletedUser = await users.deleteById(result.id);
      expect(deletedUser).to.deep.equal(result);
    });

    it("should delete an entity by id specified in conventions", async () => {
      await client.query(`CREATE TABLE users (key SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<UserWithKey>("users", { idColumn: "key", idColumnAutoIncrement: true });
      const user = {
        name: "John Doe",
      } as UserWithKey;

      const result = await users.insert(user);

      const deletedUser = await users.deleteById(result.key);
      expect(deletedUser).to.deep.equal(result);
    });

    it("should throw if entity to delete was not found", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR)`);

      const users = connect(client).repository<User>("users");

      try {
        await users.deleteById(1);
        expect.fail("expected delete call of non persisted user to throw");
      } catch (e) {
        log(e);
        // success
      }
    });
  });

  describe("select", () => {
    it("should select all entities by predicates", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, first_name VARCHAR, last_name VARCHAR)`);

      const users = connect(client).repository<UserExtended>("users");
      await users.insert({ first_name: "John", last_name: "Doe" });
      await users.insert({ first_name: "Jane", last_name: "Doe" });
      await users.insert({ first_name: "Jane", last_name: "Deer" });
      await users.insert({ first_name: "John", last_name: "Deer" });

      const result = await users.select({ first_name: "Jane" });
      expect(result.map((user) => user.first_name)).to.deep.equal(["Jane", "Jane"]);
    });

    it("should select entities by predicates containing null values", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, first_name VARCHAR, last_name VARCHAR)`);

      const users = connect(client).repository<UserExtended>("users");
      await users.insert({ first_name: "John" });
      await users.insert({ first_name: "Jane" });
      await users.insert({ first_name: "Jane", last_name: "Deer" });
      await users.insert({ first_name: "John", last_name: "Deer" });

      const result = await users.select({ last_name: null });
      expect(result.map((user) => user.first_name)).to.deep.equal(["John", "Jane"]);
    });
  });

  describe("selectWhere", () => {
    it("should select all entities by where clause with parameters given", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, first_name VARCHAR, last_name VARCHAR)`);

      const users = connect(client).repository<UserExtended>("users");
      await users.insert({ first_name: "John", last_name: "Doe" });
      await users.insert({ first_name: "Jane", last_name: "Doe" });
      await users.insert({ first_name: "Jane", last_name: "Deer" });
      await users.insert({ first_name: "John", last_name: "Deer" });

      const result = await users.selectWhere("first_name != $1", ["Jane"]);
      expect(result.map((user) => user.first_name)).to.deep.equal(["John", "John"]);
    });

    it("should select all entities by where with empty parameters", async () => {
      await client.query(`CREATE TABLE users (id SERIAL PRIMARY KEY, first_name VARCHAR, last_name VARCHAR)`);

      const users = connect(client).repository<UserExtended>("users");
      await users.insert({ first_name: "John" });
      await users.insert({ first_name: "Jane" });
      await users.insert({ first_name: "Jane", last_name: "Deer" });
      await users.insert({ first_name: "John", last_name: "Deer" });

      const result = await users.selectWhere("last_name IS NULL");
      expect(result.map((user) => user.first_name)).to.deep.equal(["John", "Jane"]);
    });
  });
});

type User = {
  id?: number;
  name: string;
};

type UserExtended = {
  id?: number;
  first_name?: string;
  last_name?: string;
};

type UserWithKey = {
  key?: number | string;
  name: string;
};
