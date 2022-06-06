import { expect } from "chai";
import { buildInsert, buildUpdate } from "../lib/sql";

describe("sql", () => {
  describe("buildInsert", () => {
    it("should build an insert statement", () => {
      const insert = buildInsert("users", {
        name: "John",
      });

      expect(insert.sql).to.equal(`INSERT INTO users ("name") VALUES ($1)`);
      expect(insert.values).to.deep.equal(["John"]);
    });

    it("should omit 'id' fields from insert statements", () => {
      const insert = buildInsert("users", {
        id: 1,
        name: "John",
      });

      expect(insert.sql).to.equal(`INSERT INTO users ("name") VALUES ($1)`);
      expect(insert.values).to.deep.equal(["John"]);
    });
  });

  describe("buildUpdate", () => {
    it("should omit 'id' fields from update statements", () => {
      const insert = buildUpdate("users", {
        id: 1,
        name: "John",
      });

      expect(insert.sql).to.equal(`UPDATE users SET "name"=$1 WHERE "id"=$2`);
      expect(insert.values).to.deep.equal(["John", 1]);
    });

    it("should build an insert statement", () => {
      const update = buildUpdate("users", {
        name: "John",
        id: 1,
      });

      expect(update.sql).to.equal(`UPDATE users SET "name"=$1 WHERE "id"=$2`);
      expect(update.values).to.deep.equal(["John", 1]);
    });
  });
});
