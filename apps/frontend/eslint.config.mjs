import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 1. Explicitly pin the TS configuration to this local Next.js workspace
  {
    settings: {
      react: {
        version: "19.2.4", // Forces it to read package.json directly instead of using the broken API method
      },
    },
    languageOptions: {
      parserOptions: {
        project: false,
        tsconfigRootDir: import.meta.dirname, // <-- Pin to apps/frontend absolute path
      },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
