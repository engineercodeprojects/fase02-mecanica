import type { Config } from 'jest';

const config: Config = {
  displayName: 'integration',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.(integration|e2e)\\.spec\\.ts$',
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/generated/**',
    '!main.ts',
    '!**/*.module.ts',
    '!**/test/**',
  ],
  coverageDirectory: '../coverage/integration',
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
  testTimeout: 60000,
};

export default config;
