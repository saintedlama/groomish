import { expect } from "chai";
import { buildInsert, buildSelect, buildSelectOptions, buildUpdate, buildWhereClause } from "../lib/sql.js";

describe("sql", () => {
  describe("buildInsert", () => {
    it("should build an insert statement", () => {
      const insert = buildInsert("users", { idColumn: 'id', idColumnAutoIncrement: true }, {
        name: "John",
      });

      expect(insert.sql).to.equal(`INSERT INTO users ("name") VALUES ($1)`);
      expect(insert.values).to.deep.equal(["John"]);
    });

    it("should omit 'id' fields from insert statements", () => {
      const insert = buildInsert("users", { idColumn: 'id', idColumnAutoIncrement: true }, {
        id: 1,
        name: "John",
      });

      expect(insert.sql).to.equal(`INSERT INTO users ("name") VALUES ($1)`);
      expect(insert.values).to.deep.equal(["John"]);
    });
  });

  describe("buildUpdate", () => {
    it("should omit 'id' fields from update statements", () => {
      const insert = buildUpdate("users", { idColumn: 'id', idColumnAutoIncrement: true }, {
        id: 1,
        name: "John",
      });

      expect(insert.sql).to.equal(`UPDATE users SET "name"=$1 WHERE "id"=$2`);
      expect(insert.values).to.deep.equal(["John", 1]);
    });

    it("should build an insert statement", () => {
      const update = buildUpdate("users", { idColumn: 'id', idColumnAutoIncrement: true }, {
        name: "John",
        id: 1,
      });

      expect(update.sql).to.equal(`UPDATE users SET "name"=$1 WHERE "id"=$2`);
      expect(update.values).to.deep.equal(["John", 1]);
    });
  });

  describe("buildSelect", () => {
    it("should add SELECT for table", () => {
      const preparedStatement = buildSelect("users", {
        id: 1,
        name: "John",
      });

      expect(preparedStatement.sql).to.equal(`SELECT * FROM users WHERE "id"=$1 AND "name"=$2`);
      expect(preparedStatement.values).to.deep.equal([1, "John"]);
    });
  });

  describe("buildWhere", () => {
    it("should add predicates to AND joined value equality clause", () => {
      const preparedStatement = buildWhereClause({
        id: 1,
        name: "John",
      });

      expect(preparedStatement.sql).to.equal(`WHERE "id"=$1 AND "name"=$2`);
      expect(preparedStatement.values).to.deep.equal([1, "John"]);
    });

    it("should transform null values to IS NULL predicates", () => {
      const preparedStatement = buildWhereClause({
        id: null,
        name: "John",
      });

      expect(preparedStatement.sql).to.equal(`WHERE "id" IS NULL AND "name"=$1`);
      expect(preparedStatement.values).to.deep.equal(["John"]);
    });
  });

  describe("buildSelectOptions", () => {
    it("should build limit clause", () => {
      const optionsString = buildSelectOptions({
        limit: 10,
      });

      expect(optionsString).to.equal(`LIMIT 10`);
    });

    it("should build oderBy clause", () => {
      const optionsString = buildSelectOptions({
        orderBy: "last_name DESC",
      });

      expect(optionsString).to.equal(`ORDER BY last_name DESC`);
    });
  });
});
