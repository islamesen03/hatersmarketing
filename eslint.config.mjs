import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Explicit: ESLint's built-in node_modules ignore did not apply under this
    // project's non-ASCII Windows path (C:\Users\İSLAM\...).
    "**/node_modules/**",
  ]),
]);

export default eslintConfig;
