// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "./" });

module.exports = async () => {
  // Returns an async function that returns a Promise to a config object
  const baseConfig = await await createJestConfig({
    moduleNameMapper: {
      "@/testutils/(.*)": "<rootDir>/test-utils/$1",
    },
  })();
  return {
    /*
   |----------------------------------------------------------------
   | Two-project setup
   |----------------------------------------------------------------
   | ① “client” → React components, hooks, anything that needs DOM
   | ② “server” → route handlers / server utils that need Node Fetch
   */
    projects: [
      {
        ...baseConfig,
        displayName: "server",
        testEnvironment: "node",
        testMatch: ["<rootDir>/src/app/api/**/*.test.ts"],
      },
      {
        ...baseConfig,
        displayName: "client",
        testEnvironment: "jsdom",
        setupFilesAfterEnv: ["<rootDir>/test-utils/setupDomTests.ts"],
        testMatch: [
          "<rootDir>/src/**/*.test.ts",
          "<rootDir>/src/**/*.test.tsx",
        ],
        testPathIgnorePatterns: ["<rootDir>/src/app/api/"],
      },
    ],
  };
};
