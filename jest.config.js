/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', module: 'commonjs', isolatedModules: true, rootDir: __dirname } }],
  },
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@sections/(.*)$': '<rootDir>/sections/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/public/', '/.next/'],
};
