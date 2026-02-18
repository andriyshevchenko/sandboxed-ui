export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/server/__tests__/**/*.test.js', '**/server/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['server/index.js', '!**/node_modules/**'],
}
