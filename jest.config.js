module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // modulePathIgnorePatterns: ["<rootDir>/dist/"],
  testMatch: ["<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}"],
  collectCoverage: true,
  coverageDirectory: "coverage",
};
