/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**'
  ],
  coveragePathIgnorePatterns: [
    "enums",
    "errors",
    "providers",
    "testing"
  ]
};