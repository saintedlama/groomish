export default {
  // [...]
  preset: "ts-jest/presets/default-esm", // or other ESM presets
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/test/**/*.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/utils/"],

  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules/", "/utils/"],
};
