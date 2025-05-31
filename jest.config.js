module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@aws-sdk/client-eventbridge': '<rootDir>/node_modules/@aws-sdk/client-eventbridge',
    '^@aws-sdk/client-dynamodb': '<rootDir>/node_modules/@aws-sdk/client-dynamodb',
  },
};
