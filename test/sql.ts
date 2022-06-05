import { expect } from "chai";
import { buildInsert } from "../lib/sql";

describe("sql", () => {
  it("should build an insert statement", () => {
    const insert = buildInsert("users", {
      name: "John",
    });

    expect(insert.sql).to.equal(`INSERT INTO users (name) VALUES ($1)`);
    expect(insert.values).to.deep.equal(["John"]);
  });

  it("should omit 'id' fields from insert statements", () => {
    const insert = buildInsert("users", {
      id: 1,
      name: "John",
    });

    expect(insert.sql).to.equal(`INSERT INTO users (name) VALUES ($1)`);
    expect(insert.values).to.deep.equal(["John"]);
  });
});
